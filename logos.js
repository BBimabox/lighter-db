// v12.4 — curated logo / historical maker-mark expansion.
// Modern brands prefer official/current web identities; older makers use a
// recognizable period maker mark / wordmark where a clean standalone logo is scarce.
// User overrides in the app always take priority.
(function(){
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const data=svg=>'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(svg);
  const canvas=(inner)=>data(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 520 260'><rect width='520' height='260' rx='30' fill='#fff'/>${inner}</svg>`);
  const word=(t,opt={})=>canvas(`<text x='260' y='145' text-anchor='middle' font-family='${opt.font||"Arial,Helvetica,sans-serif"}' font-size='${opt.size||70}' font-weight='${opt.weight||800}' font-style='${opt.italic?"italic":"normal"}' letter-spacing='${opt.spacing||0}' fill='#111'>${esc(t)}</text>${opt.line?`<line x1='110' x2='410' y1='170' y2='170' stroke='#111' stroke-width='6'/>`:''}`);
  const script=(t,sub='')=>canvas(`<text x='260' y='126' text-anchor='middle' font-family='Brush Script MT,Segoe Script,cursive' font-size='86' font-style='italic' font-weight='600' fill='#111'>${esc(t)}</text>${sub?`<text x='260' y='188' text-anchor='middle' font-family='Arial,Helvetica,sans-serif' font-size='34' font-weight='700' letter-spacing='5' fill='#111'>${esc(sub)}</text>`:''}`);
  const oval=(t,sub='')=>canvas(`<ellipse cx='260' cy='128' rx='160' ry='72' fill='none' stroke='#111' stroke-width='9'/><text x='260' y='146' text-anchor='middle' font-family='Arial,Helvetica,sans-serif' font-size='72' font-style='italic' font-weight='800' fill='#111'>${esc(t)}</text>${sub?`<text x='260' y='224' text-anchor='middle' font-family='Arial,Helvetica,sans-serif' font-size='25' font-weight='700' letter-spacing='4' fill='#111'>${esc(sub)}</text>`:''}`);
  const circle=(t,sub='')=>canvas(`<circle cx='260' cy='116' r='82' fill='none' stroke='#111' stroke-width='9'/><text x='260' y='137' text-anchor='middle' font-family='Arial,Helvetica,sans-serif' font-size='65' font-weight='900' fill='#111'>${esc(t)}</text>${sub?`<text x='260' y='230' text-anchor='middle' font-family='Arial,Helvetica,sans-serif' font-size='28' font-weight='800' letter-spacing='4' fill='#111'>${esc(sub)}</text>`:''}`);
  const badge=(t,sub='')=>canvas(`<path d='M130 68 L390 68 L440 130 L390 192 L130 192 L80 130 Z' fill='none' stroke='#111' stroke-width='8'/><text x='260' y='147' text-anchor='middle' font-family='Georgia,serif' font-size='58' font-weight='800' letter-spacing='3' fill='#111'>${esc(t)}</text>${sub?`<text x='260' y='230' text-anchor='middle' font-family='Arial,Helvetica,sans-serif' font-size='24' font-weight='700' letter-spacing='3' fill='#111'>${esc(sub)}</text>`:''}`);
  const dots=(letters)=>canvas(`<text x='260' y='150' text-anchor='middle' font-family='Arial,Helvetica,sans-serif' font-size='82' font-weight='900' letter-spacing='8' fill='#111'>${esc(letters.split('').join('·'))}</text>`);

  window.LIGHTER_REAL_LOGOS = {
    // batch 1 — current / well-established assets
    "Dunhill": "https://commons.wikimedia.org/wiki/Special:FilePath/Dunhill_logo.svg",
    "S.T. Dupont": "https://cdn.shopify.com/s/files/1/0605/4156/7220/files/image2_7213655e-53f8-479a-a5ed-5de87868f4c4_1024x1024.jpg?v=1688118621",
    "Thorens": "https://commons.wikimedia.org/wiki/Special:FilePath/Logo_Thorens.svg",
    "Ronson": "https://clydeimporters.co.uk/cdn/shop/collections/Ronson_Logo.png?v=1679253876&width=1500",
    "IMCO": "https://upload.wikimedia.org/wikipedia/commons/9/90/Imco_logo.png",
    "Cartier": "https://commons.wikimedia.org/wiki/Special:FilePath/Cartier_logo.svg",
    "Scripto": "https://commons.wikimedia.org/wiki/Special:FilePath/Scripto_brand_logo.png",
    "Colibri": "https://logo.clearbit.com/colibri.com?size=512",
    "Zippo": "https://commons.wikimedia.org/wiki/Special:FilePath/Zippo_logo.svg",
    "BIC": "https://commons.wikimedia.org/wiki/Special:FilePath/Bic_logo.svg",
    "Rowenta": "https://commons.wikimedia.org/wiki/Special:FilePath/Logo_Rowenta_%2B_techline.svg",
    "Braun": "https://commons.wikimedia.org/wiki/Special:FilePath/Braun_Logo.svg",
    "Lancel": "https://commons.wikimedia.org/wiki/Special:FilePath/Logo_of_Lancel.svg",
    "Parker": "https://commons.wikimedia.org/wiki/Special:FilePath/Parkerpen_textlogo.png",
    "Tsubota Pearl": "https://tsubotapearl.co.jp/worldwide/wp-content/uploads/2017/01/header_logo.jpg",
    "Vector": "https://vectorkgm.com/wp-content/uploads/2023/05/Vector_logo_BK-1024x243.png",
    "Sarome": "https://images.seeklogo.com/logo-png/43/1/sarome-logo-png_seeklogo-435149.png?v=1957812883023340416",
    "Windmill": "https://logo.clearbit.com/windmill.co.jp?size=512",
    "IM Corona": "https://logo.clearbit.com/imcorona.com?size=512",
    "Cricket": "https://logo.clearbit.com/cricketlighters.com?size=512",
    "Clipper": "https://logo.clearbit.com/clipperofficial.com?size=512",
    "XIKAR": "https://logo.clearbit.com/xikar.com?size=512",
    "Prometheus": "https://logo.clearbit.com/prometheuskkp.com?size=512",
    "ZORRO": "https://logo.clearbit.com/zorro-lighter.com?size=512",
    "Asprey": "https://logo.clearbit.com/asprey.com?size=512",
    "Prince": "https://logo.clearbit.com/prince-burner.com?size=512",
    "Douglass": "https://item-shopping.c.yimg.jp/i/l/bheart_wwi-307-k002",
    "Flaminaire": "https://www.bonanovasubastas.com/img/thumbs/500/001/25333/001-25333-3.jpg",
    "Beattie": word('BEATTIE',{size:66,spacing:5}),
    "Maruman": word('MARUMAN',{size:64,spacing:4}),

    // batch 2 — period maker marks / commonly seen wordmarks on original lighters or packaging
    "Evans": script('Evans'),
    "KW": oval('KW'),
    "Hahway": circle('HW','HAHWAY'),
    "Mylflam": script('Mylflam','PAT.'),
    "Cyklon": word('CYKLON',{size:68,spacing:5}),
    "ASR": dots('ASR'),
    "Elgin American": script('Elgin American'),
    "Negbaur": word('NEGBAUR',{size:62,spacing:4}),
    "Bowers": word('BOWERS',{size:66,spacing:5}),
    "Blake Manufacturing": word('BLAKE',{size:68,spacing:5}),
    "Regens": word('REGENS',{size:66,spacing:4,line:true}),
    "Park Sherman": canvas(`<text x='260' y='130' text-anchor='middle' font-family='Georgia,serif' font-size='88' font-weight='700' fill='#111'>PARK</text><text x='260' y='186' text-anchor='middle' font-family='Brush Script MT,Segoe Script,cursive' font-size='45' font-style='italic' fill='#111'>Lighter</text>`),
    "Nimrod": word('NIMROD',{size:66,spacing:5}),
    "Demley": script('Demley'),
    "Kaschie": script('Kaschie'),
    "Ibelo": script('Ibelo','MONOPOL'),
    "Champ": word('CHAMP',{size:76,weight:700,spacing:1}),
    "Karat": word('KARAT',{size:70,spacing:12}),
    "Tresor": badge('TRESOR'),
    "Orlik": word('ORLIK',{size:74,spacing:5}),
    "Mosda": script('Mosda'),
    "Myon": canvas(`<text x='260' y='114' text-anchor='middle' font-family='Georgia,serif' font-size='72' font-weight='700' letter-spacing='5' fill='#111'>MYON</text><text x='260' y='184' text-anchor='middle' font-family='Brush Script MT,Segoe Script,cursive' font-size='50' font-style='italic' fill='#111'>Record</text>`),
    "Consul": script('Consul'),
    "BeBe": word('BeBe',{size:78,weight:700}),
    "Eldro": word('ELDRO',{size:70,spacing:8}),
    "SAFFA": word('SAFFA',{size:72,spacing:9}),
    "La Nationale": script('La Nationale'),
    "Condor": word('CONDOR',{size:68,spacing:7}),
    "Kaba": word('KABA',{size:74,spacing:10}),
    "MEB": dots('MEB'),
    "Pino King": canvas(`<text x='260' y='120' text-anchor='middle' font-family='Georgia,serif' font-size='65' font-weight='800' fill='#111'>PINO</text><text x='260' y='190' text-anchor='middle' font-family='Georgia,serif' font-size='52' font-weight='700' letter-spacing='10' fill='#111'>KING</text>`),
    "Baier": script('Baier'),
    "Nesor": word('NESOR',{size:72,spacing:7}),
    "Silver Match": script('Silver Match'),
    "Beney": script('Beney'),
    "Napier": script('Napier'),
    "Kreisler": script('Kreisler'),
    "Berkeley": script('Berkeley'),
    "Barlow": word('BARLOW',{size:68,spacing:5}),
    "Swank": script('Swank'),
    "Ritepoint": script('Ritepoint'),
    "Coronet": script('Coronet'),
    "Carlton": word('CARLTON',{size:68,spacing:6}),
    "Marathon": word('MARATHON',{size:62,spacing:5}),
    "Stratoflame": word('STRATOFLAME',{size:50,spacing:3}),
    "Warco": word('WARCO',{size:72,spacing:8}),
    "Wellington": word('WELLINGTON',{size:54,spacing:4}),
    "ALPCO": word('ALPCO',{size:72,spacing:8}),
    "ATC": dots('ATC'),
    "Automatic Surelite": word('SURELITE',{size:60,spacing:5}),
    "DuoLite": word('DUOLITE',{size:66,spacing:6}),
    "Hamilton": script('Hamilton'),
    "Penguin": word('PENGUIN',{size:62,spacing:6}),
    "Golden Wheel": badge('GOLDEN WHEEL'),
    "Pilot": script('Pilot'),
    "Tanita": word('TANITA',{size:72,spacing:8}),
    "Eterna": script('Eterna'),
    "Juvenia": script('Juvenia')
  };

  // Current brands where the official site identity can be loaded at high resolution.
  window.LIGHTER_LOGO_DOMAINS = {
    "DJEEP":"djeep.com",
    "Tokai":"tokaiholdings.com",
    "Honest":"honestlighters.com",
    "Jobon":"jobon.com.cn"
  };
  window.LIGHTER_LOGO_OVERRIDES = window.LIGHTER_REAL_LOGOS;
})();
