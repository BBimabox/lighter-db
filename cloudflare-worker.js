// Lighter DB v6 — Cloudflare Worker backend for OpenAI image identification.
// IMPORTANT: Store OPENAI_API_KEY as a Worker secret. Never paste it into this file.

const DEFAULT_ALLOWED_ORIGIN = 'https://bbimabox.github.io';
const OPENAI_URL = 'https://api.openai.com/v1/responses';

function cors(origin, allowed) {
  const ok = origin && (origin === allowed || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:'));
  return {
    'Access-Control-Allow-Origin': ok ? origin : allowed,
    'Vary': 'Origin',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store'
  };
}

function json(data, status, headers) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers }
  });
}

function outputText(resp) {
  if (typeof resp.output_text === 'string' && resp.output_text) return resp.output_text;
  for (const item of resp.output || []) {
    if (item.type !== 'message') continue;
    for (const part of item.content || []) {
      if (part.type === 'output_text' && part.text) return part.text;
    }
  }
  return '';
}

function collectSources(resp) {
  const found = new Map();
  const add = (url, title='') => {
    if (!url || !/^https?:\/\//i.test(url)) return;
    if (!found.has(url)) found.set(url, { url, title: title || new URL(url).hostname });
  };
  for (const item of resp.output || []) {
    if (item.type === 'message') {
      for (const part of item.content || []) {
        for (const a of part.annotations || []) {
          if (a.type === 'url_citation') add(a.url, a.title);
        }
      }
    }
    if (item.type === 'web_search_call') {
      for (const s of item.action?.sources || []) add(s.url, 'Web source');
      if (item.action?.url) add(item.action.url, 'Web source');
    }
  }
  return [...found.values()].slice(0, 12);
}

const schema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    brand: { type: 'string' },
    model: { type: 'string' },
    date_range: { type: 'string' },
    country: { type: 'string' },
    mechanism: { type: 'string' },
    confidence: { type: 'string', enum: ['高','中','低'] },
    authenticity: { type: 'string', enum: ['較符合真品特徵','有疑點','無法判定'] },
    authenticity_reason: { type: 'string' },
    visible_markings: { type: 'array', items: { type: 'string' } },
    evidence: { type: 'array', items: { type: 'string' } },
    concerns: { type: 'array', items: { type: 'string' } },
    missing_photos: { type: 'array', items: { type: 'string' } },
    summary: { type: 'string' }
  },
  required: ['brand','model','date_range','country','mechanism','confidence','authenticity','authenticity_reason','visible_markings','evidence','concerns','missing_photos','summary']
};

const instructions = `你是專門研究 antique / vintage cigarette lighters 的影像辨識助手。使用者會提供一至多張打火機照片。你的工作是：
1. 根據可見的 Logo、底印、專利號、字體、外殼比例、鉸鏈、火輪、點火機構、燃料結構、材質與工藝，推測品牌、型號、年代與機構。
2. 真偽只能做「照片初判」。不得用肯定語氣宣稱 100% 真品；需要區分仿品、後期復刻、重鍍、換件、混件與原裝品。
3. 如果證據不足，brand/model/date_range 請明確寫「未知」或合理範圍，不要猜一個看似精確的答案。
4. visible_markings 只寫照片中真的看得到或高度可辨認的刻字/標記，不得捏造。
5. evidence 寫支持判斷的具體視覺或可靠歷史特徵；concerns 寫疑點；missing_photos 告訴使用者下一步應補拍什麼（例如底印、內膽、鉸鏈、火石管、加油口）。
6. 若可以使用 web search，優先查官方資料、專利、原始型錄、Lighter Library、Vintage Cigarette Lighters、收藏俱樂部與可信拍賣紀錄；不要把賣家標題當成事實。
7. 回答使用繁體中文，品牌與型號保留原文。`;

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = env.ALLOWED_ORIGIN || DEFAULT_ALLOWED_ORIGIN;
    const headers = cors(origin, allowed);

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });

    const url = new URL(request.url);
    if (request.method === 'GET' && url.pathname.endsWith('/health')) {
      return json({ ok: true, service: 'lighter-db-ai', version: 6 }, 200, headers);
    }
    if (request.method !== 'POST' || !url.pathname.endsWith('/analyze')) {
      return json({ ok: false, error: 'Not found' }, 404, headers);
    }
    if (!env.OPENAI_API_KEY) {
      return json({ ok: false, error: 'Worker 尚未設定 OPENAI_API_KEY secret。' }, 500, headers);
    }

    let body;
    try { body = await request.json(); }
    catch { return json({ ok: false, error: '無效的 JSON request。' }, 400, headers); }

    const images = Array.isArray(body.images) ? body.images.slice(0, 6) : [];
    if (!images.length) return json({ ok: false, error: '請至少提供一張照片。' }, 400, headers);
    if (images.some(x => typeof x !== 'string' || !/^data:image\/(jpeg|jpg|png|webp);base64,/i.test(x))) {
      return json({ ok: false, error: '照片格式只接受 JPEG / PNG / WebP。' }, 400, headers);
    }
    const approxBytes = images.reduce((n, x) => n + x.length, 0);
    if (approxBytes > 12_000_000) return json({ ok: false, error: '照片總量太大，請減少張數或重新拍攝。' }, 413, headers);

    const mode = body.mode === 'deep' ? 'deep' : 'quick';
    const model = mode === 'deep' ? 'gpt-5.6-sol' : 'gpt-5.6-luna';
    const hint = String(body.hint || '').slice(0, 1000);
    const catalog = Array.isArray(body.catalog) ? body.catalog.slice(0, 350).map(x => String(x).slice(0, 100)) : [];
    const prompt = `請辨識照片中的打火機。${hint ? `\n使用者補充：${hint}` : ''}${catalog.length ? `\nLighter DB 目前已收錄的品牌/Maker 候選名單如下；它只供比對，不能因為名稱在清單中就強行判定：\n${catalog.join(' | ')}` : ''}\n\n請特別注意底印、專利號、Logo 字體、鉸鏈和點火機構。`;

    const content = [
      { type: 'input_text', text: prompt },
      ...images.map(image_url => ({ type: 'input_image', image_url, detail: mode === 'deep' ? 'high' : 'auto' }))
    ];

    const payload = {
      model,
      store: false,
      instructions,
      input: [{ role: 'user', content }],
      max_output_tokens: 2600,
      text: {
        format: {
          type: 'json_schema',
          name: 'lighter_identification',
          description: 'Structured identification of a photographed lighter',
          strict: true,
          schema
        }
      }
    };
    if (mode === 'deep') payload.tools = [{ type: 'web_search', search_context_size: 'medium' }];

    let apiResp;
    try {
      apiResp = await fetch(OPENAI_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      return json({ ok: false, error: '無法連線 OpenAI API：' + String(e?.message || e) }, 502, headers);
    }

    const raw = await apiResp.json().catch(() => ({}));
    if (!apiResp.ok) {
      const message = raw?.error?.message || `OpenAI API error ${apiResp.status}`;
      return json({ ok: false, error: message }, apiResp.status, headers);
    }

    const text = outputText(raw);
    let analysis;
    try { analysis = JSON.parse(text); }
    catch {
      return json({ ok: false, error: 'AI 回傳格式無法解析，請再試一次。', raw_text: text.slice(0, 2000) }, 502, headers);
    }

    return json({
      ok: true,
      analysis,
      sources: collectSources(raw),
      model,
      usage: raw.usage || null
    }, 200, headers);
  }
};
