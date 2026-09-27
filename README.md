# Lighter DB PWA v6

291 筆品牌 / Maker 資料庫 + 型號管理 + 收藏資料 + 照片 + 品牌辨識指南 + AI 拍照辨識。

## v6 新功能

- 底部新增「AI辨識」頁。
- 手機可直接叫出相機，也可從相簿選最多 6 張照片。
- 快速辨識：GPT-5.6 Luna。
- 深入鑑定：GPT-5.6 Sol + OpenAI Web Search。
- 回傳品牌、型號、年代、國家、機構、可見刻字、支持證據、疑點、建議補拍部位。
- 真偽欄位只做「照片初判」，不會宣稱 100% 真品。
- AI 結果若可對上本地 291 品牌，可一鍵進品牌頁並把型號帶入。
- AI 後端網址只存在瀏覽器 localStorage；完整備份會一併保存該網址。

## 為什麼需要 Cloudflare Worker

OpenAI API key 不可以放在 GitHub Pages、瀏覽器 JavaScript 或手機 App 裡。v6 將照片送到你自己的 Cloudflare Worker，再由 Worker 使用 secret 中的 OpenAI API key 呼叫 OpenAI Responses API。

`cloudflare-worker.js` 就是後端程式碼。它本身不含任何 API key，可以放在公開 GitHub。

## 架構

手機 / PWA → Cloudflare Worker → OpenAI Responses API

## Worker 需要的 Secret

- `OPENAI_API_KEY`：你的 OpenAI API key。只放在 Cloudflare Worker Secrets。
- `ALLOWED_ORIGIN`（可選）：預設已限制為 `https://bbimabox.github.io`。

## Worker 路由

- `GET /health`：測試連線。
- `POST /analyze`：照片辨識。

## 更新 GitHub Pages

將此資料夾中前端檔案上傳覆蓋 repository 根目錄即可。GitHub Pages 會自動重新部署。

`cloudflare-worker.js` 不會在 GitHub Pages 上執行；它需要另外貼到 Cloudflare Workers。

## 隱私提醒

AI 辨識時，使用者選擇的照片會送到你的 Worker，再送到 OpenAI API。前端收藏照片平常仍只保存在目前瀏覽器的 IndexedDB，不會自動上傳。
