/* app.js — Switch 2 Popup Store · Game Recommendation Guide (React, no build step)
   Flow: Landing → Method picker → Category select → Results list → Game detail.
   Game data: window.GAMES (games.js). Cover art: RAWG live + generated fallback (config.js). */

const { useState, useMemo, useEffect } = React;
const h = React.createElement;
const GAMES = window.GAMES || [];
const RAWG_KEY = (window.RAWG_API_KEY || "").trim();

/* ============================ Category definitions ===================== */
/* Genre buckets (some games' genres are granular, so we match by keyword).
   Indie / roguelike aren't in the genre field, so use curated id sets. */
const INDIE = new Set(["game4","game5","game7","game11","game12","game38","game39","game40","game41","game46"]);
const ROGUE = new Set(["game4","game11","game12","game41","game21"]);

const GENRE_CATS = [
  { value: "action", label: "액션-MOBA 게임 추천",    sub: "짜릿한 손맛과 타격감! 당신의 한계를 시험할 다이내믹한 플레이",   match: g => /액션|MOBA/.test(g.genre) },
  { value: "fps",    label: "슈팅/FPS 게임 추천",     sub: "시원하게 터지는 쾌감과 전장을 지배하는 짜릿함",   match: g => /슈팅|FPS/.test(g.genre) },
  { value: "rpg",    label: "RPG 게임 추천",          sub: "당신이 주인공이 되는 방대한 이야기",     match: g => /RPG/.test(g.genre) },
  { value: "sports", label: "스포츠/레이싱 게임 추천", sub: "0.1초의 승부! 심장을 뛰게 할 압도적인 스피드와 승리의 쾌감", match: g => /스포츠|레이싱/.test(g.genre) },
  { value: "indie",  label: "인디 게임 추천",         sub: "세상에 없던 독창적인 아이디어와 감성",     match: g => INDIE.has(g.id) },
  { value: "rogue",  label: "로그라이크 게임 추천",    sub: "매번 새로워지는 던전과 예측 불가의 모험",     match: g => /로그라이/.test(g.genre) || ROGUE.has(g.id) },
];

const IP_CATS = [
  { value: "마리오",     label: "마리오 시리즈",        match: g => g.name.includes("마리오") },
  { value: "젤다",       label: "젤다 시리즈",          match: g => g.name.includes("젤다") },
  { value: "포켓몬",     label: "포켓몬 시리즈",        match: g => g.name.includes("포켓") },
  { value: "제노블레이드", label: "제노블레이드 시리즈",  match: g => g.name.includes("제노") },
  { value: "스플래툰",    label: "스플래툰 시리즈",      match: g => g.name.includes("스플래") },
  { value: "커비",       label: "커비 시리즈",          match: g => g.name.includes("커비") },
  { value: "기타",       label: "기타 프랜차이즈 시리즈", match: g => !/마리오|젤다|포켓|제노|스플래|커비/.test(g.name) },
];

const MBTI_CATS = [
  { value: "XXTP", label: "XXTP형 추천", title: "분석적 플레이어 추천", sub: "깊이 있는 전략가",   match: g => g.mbti === "XXTP" },
  { value: "XXFJ", label: "XXFJ형 추천", title: "감성적 조화가 추천",   sub: "함께라서 즐거운",   match: g => g.mbti === "XXFJ" },
  { value: "XXFP", label: "XXFP형 추천", title: "자유로운 모험가 추천", sub: "신나는 즐거움 추구", match: g => g.mbti === "XXFP" },
  { value: "XXTJ", label: "XXTJ형 추천", title: "전략적 지휘관 추천",   sub: "도전을 즐기는",     match: g => g.mbti === "XXTJ" },
];

const HUMAN_CATS = [
  { value: "1인용",   label: "1인 게임 추천",     sub: "혼자서도 완벽하게!",   match: g => g.players === "1인용" },
  { value: "2인용",   label: "2인 게임 추천",     sub: "둘이서 더 재밌게!",     match: g => g.players === "2인용" },
  { value: "3인 이상", label: "3인 이상 게임 추천", sub: "다같이 왁자지껄!",     match: g => g.players === "3인 이상" },
];

const CATS = { genre: GENRE_CATS, ip: IP_CATS, mbti: MBTI_CATS, human: HUMAN_CATS };
const CATEGORY_META = {
  genre: { title: "장르별 추천 선택",   sub: "손이 가는 액션부터 느긋한 힐링까지, 당신의 취향은?" },
  ip:    { title: "대표 IP별 추천 선택", sub: "당신의 심장을 뛰게 한 영웅은 누구인가요?" },
  mbti:  { title: "MBTI 추천 선택",     sub: "플레이 스타일 분석 완료! 당신만의 맞춤 리스트를 만나보세요." },
  human: { title: "인원별 추천 선택",   sub: "플레이 인원을 선택하고 맞춤형 리스트를 만나보세요." },
};
const NAV_TABS = [
  { method: "genre", label: "장르", icon: "images/icons/genre.png"   },
  { method: "human", label: "인원", icon: "images/icons/players.png" },
  { method: "ip",    label: "IP",   icon: "images/icons/IP.png"      },
  { method: "mbti",  label: "MBTI", icon: "images/icons/MBTI.png"    },
];

const HUMAN_NAV_TABS = [
  { value: "1인용",    label: "1인",  icon: "images/icons/players.png"  },
  { value: "2인용",    label: "2인",  icon: "images/icons/players2.png" },
  { value: "3인 이상", label: "3인+", icon: "images/icons/players3.png" },
];

const IP_NAV_TABS = [
  { value: "마리오",      label: "마리오",   icon: "images/icons/mario.png"      },
  { value: "젤다",        label: "젤다",     icon: "images/icons/zelda.png"      },
  { value: "포켓몬",      label: "포켓몬",   icon: "images/icons/pokemon.png"    },
  { value: "제노블레이드", label: "제노",     icon: "images/icons/xenoblade.png"  },
  { value: "스플래툰",    label: "스플래툰", icon: "images/icons/splatoon.png"   },
  { value: "커비",        label: "커비",     icon: "images/icons/kirby.png"      },
  { value: "기타",        label: "기타",     icon: "images/icons/other.png"      },
];

const MBTI_NAV_TABS = [
  { value: "XXTP", label: "XXTP", icon: "images/icons/xxtp.png" },
  { value: "XXFJ", label: "XXFJ", icon: "images/icons/xxfj.png" },
  { value: "XXFP", label: "XXFP", icon: "images/icons/xxfp.png" },
  { value: "XXTJ", label: "XXTJ", icon: "images/icons/xxtj.png" },
];

function catFor(method, value) { return (CATS[method] || []).find(c => c.value === value); }
function gamesFor(method, value) { const c = catFor(method, value); return c ? GAMES.filter(c.match) : []; }
function repGame(method, value) { return gamesFor(method, value)[0]; }

/* ============================ Live cover art ========================== */
const rawgMem = {};
function loadCache() { try { return JSON.parse(localStorage.getItem("rawgCovers") || "{}"); } catch (e) { return {}; } }
function saveCache(id, url) { try { const c = loadCache(); c[id] = url; localStorage.setItem("rawgCovers", JSON.stringify(c)); } catch (e) {} }

function fetchRawgCover(game) {
  if (!RAWG_KEY) return Promise.resolve(null);
  if (rawgMem[game.id] !== undefined) return Promise.resolve(rawgMem[game.id]);
  const cached = loadCache();
  if (game.id in cached) { rawgMem[game.id] = cached[game.id]; return Promise.resolve(cached[game.id]); }
  const url = "https://api.rawg.io/api/games?key=" + encodeURIComponent(RAWG_KEY) +
              "&search=" + encodeURIComponent(game.en || game.name) + "&page_size=1&search_precise=true";
  const p = fetch(url).then(r => r.ok ? r.json() : null).then(d => {
    const img = d && d.results && d.results[0] && d.results[0].background_image;
    const val = img || null; rawgMem[game.id] = val; saveCache(game.id, val); return val;
  }).catch(() => { rawgMem[game.id] = null; return null; });
  rawgMem[game.id] = p; return p;
}

function Cover({ game, alt, className }) {
  const localChain = ["images/" + game.id + ".avif", "images/" + game.id + ".png", "images/" + game.id + ".jpg"];
  const generated = "images/" + game.id + ".svg";
  const [remote, setRemote] = useState(null);
  useEffect(() => { let live = true; fetchRawgCover(game).then(u => { if (live && u) setRemote(u); }); return () => { live = false; }; }, [game.id]);
  const chain = localChain.concat(remote ? [remote] : []).concat([generated]);
  return h("img", {
    key: remote || "base", className, alt, loading: "lazy", src: chain[0], "data-chain": chain.join("|"),
    onError: (e) => {
      const list = (e.target.getAttribute("data-chain") || "").split("|");
      const i = Number(e.target.dataset.i || 0) + 1;
      if (i < list.length) { e.target.dataset.i = i; e.target.src = list[i]; }
    },
  });
}

/* ============================ SVG icons =============================== */
const ICONS = {
  // Main nav
  list: [
    ["line", { x1:3, y1:5,  x2:17, y2:5  }],
    ["line", { x1:3, y1:10, x2:17, y2:10 }],
    ["line", { x1:3, y1:15, x2:17, y2:15 }],
  ],
  grid: [
    ["rect", { x:3,  y:3,  width:6, height:6, rx:1 }],
    ["rect", { x:11, y:3,  width:6, height:6, rx:1 }],
    ["rect", { x:3,  y:11, width:6, height:6, rx:1 }],
    ["rect", { x:11, y:11, width:6, height:6, rx:1 }],
  ],
  users: [
    ["circle", { cx:7,  cy:6, r:3 }],
    ["path",   { d:"M1 18v-1a6 6 0 0 1 12 0v1" }],
    ["circle", { cx:14, cy:5, r:2 }],
    ["path",   { d:"M18 18v-1a4 4 0 0 0-3-3.8" }],
  ],
  star: [
    ["polygon", { points:"10,1.5 12.6,7.2 19,8.1 14.5,12.5 15.6,18.5 10,15.5 4.4,18.5 5.5,12.5 1,8.1 7.4,7.2" }],
  ],
  person: [
    ["circle", { cx:10, cy:6,  r:3 }],
    ["path",   { d:"M4 18v-1a6 6 0 0 1 12 0v1" }],
  ],
  // Genre sub-nav
  zap: [
    ["path", { d:"M11 2L4 11h6l-1 7 7-9h-6z" }],
  ],
  target: [
    ["circle", { cx:10, cy:10, r:7 }],
    ["circle", { cx:10, cy:10, r:3 }],
    ["path",   { d:"M10 1v4M10 15v4M1 10h4M15 10h4" }],
  ],
  sword: [
    ["path", { d:"M4 16L15 5" }],
    ["path", { d:"M15 5h-3V2h3" }],
    ["path", { d:"M4 16l-2 2" }],
    ["path", { d:"M7 13l2 2" }],
  ],
  flag: [
    ["path", { d:"M4 3v14M4 3l12 4-12 4" }],
  ],
  gem: [
    ["path", { d:"M3 8l7-6 7 6-7 10z" }],
    ["path", { d:"M3 8h14M7 2l-4 6M13 2l4 6" }],
  ],
  dice: [
    ["rect",   { x:2, y:2, width:16, height:16, rx:2 }],
    ["circle", { cx:7,  cy:7,  r:1, fill:"currentColor", stroke:"none" }],
    ["circle", { cx:13, cy:7,  r:1, fill:"currentColor", stroke:"none" }],
    ["circle", { cx:10, cy:10, r:1, fill:"currentColor", stroke:"none" }],
    ["circle", { cx:7,  cy:13, r:1, fill:"currentColor", stroke:"none" }],
    ["circle", { cx:13, cy:13, r:1, fill:"currentColor", stroke:"none" }],
  ],
  shield: [
    ["path", { d:"M10 2l7 3v4.5C17 14.5 10 18 10 18S3 14.5 3 9.5V5z" }],
  ],
};

function Icon({ name, size = 20 }) {
  return h("svg", {
    width: size, height: size,
    viewBox: "0 0 20 20",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  },
  ...(ICONS[name] || []).map(([tag, attrs], i) => h(tag, { key: i, ...attrs })));
}

/* ============================ Shared UI =============================== */
const Nlogo = () => h("span", { className: "nlogo" }, "Nintendo");

function TopBar({ onBack, onHome }) {
  return h("div", { className: "topbar" },
    onBack && h("button", { className: "icon-btn back", onClick: onBack }, h("span", { className: "glyph" }, "←"), "BACK"),
    h(Nlogo),
    onHome && h("button", { className: "icon-btn home", onClick: onHome }, h("span", { className: "glyph" }, "⌂"), "HOME"));
}

function BottomNav({ active, go }) {
  return h("div", { className: "bottom-nav" },
    NAV_TABS.map(t => h("div",
      { key: t.method, className: "bn-item" + (t.method === active ? " active" : ""),
        onClick: () => go({ name: "category", method: t.method }) },
      h("span", { className: "bn-icon" }, h("img", { src: t.icon, width: 22, height: 22, style: { objectFit: "contain" } })),
      h("span", { className: "bn-label" }, t.label))));
}

const GENRE_NAV_TABS = [
  { value: "action", label: "액션-MOBA",  icon: "images/icons/action.png"  },
  { value: "fps",    label: "슈팅",       icon: "images/icons/fps.png"     },
  { value: "rpg",    label: "RPG",        icon: "images/icons/rpg.png"     },
  { value: "sports", label: "스포츠",     icon: "images/icons/racing.png"  },
  { value: "indie",  label: "인디",       icon: "images/icons/indie.png"   },
  { value: "rogue",  label: "로그라이크",  icon: "images/icons/rogue.png"   },
];

function GenreBottomNav({ active, go }) {
  return h("div", { className: "bottom-nav genre-bottom-nav" },
    GENRE_NAV_TABS.map(t => h("div",
      { key: t.value, className: "bn-item" + (t.value === active ? " active" : ""),
        onClick: () => go({ name: "list", method: "genre", value: t.value }) },
      h("span", { className: "bn-icon" }, h("img", { src: t.icon, width: 18, height: 18, style: { objectFit: "contain" } })),
      h("span", { className: "bn-label" }, t.label))));
}

function MethodBottomNav({ tabs, method, active, go }) {
  const size = tabs.length >= 6 ? 18 : 22;
  return h("div", { className: "bottom-nav genre-bottom-nav", style: { gridTemplateColumns: `repeat(${tabs.length}, 1fr)` } },
    tabs.map(t => h("div",
      { key: t.value, className: "bn-item" + (t.value === active ? " active" : ""),
        onClick: () => go({ name: "list", method, value: t.value }) },
      h("span", { className: "bn-icon" }, h("img", { src: t.icon, width: size, height: size, style: { objectFit: "contain" } })),
      h("span", { className: "bn-label" }, t.label))));
}

/* Image card with caption overlay (used for category cards & picker). */
function ImageCard({ game, title, sub, badge, wide, tall, onClick }) {
  let cls = "img-card";
  if (wide) cls += " wide";
  if (tall) cls += " tall";

  return h("div", { className: cls, onClick },
    game ? h(Cover, { game, alt: title, className: "card-img" }) : null,
    h("div", { className: "card-shade" }),
    h("div", { className: "card-cap" },
      badge ? h("div", { className: "badge" }, badge) : null,
      h("div", { className: "cap-title" }, title),
      sub ? h("div", { className: "cap-sub" }, sub) : null));
}

function Picker({ go }) {
  const repPools = useMemo(() => ({
    genre: GENRE_CATS.map(c => repGame("genre", c.value)).filter(Boolean),
    human: HUMAN_CATS.map(c => repGame("human", c.value)).filter(Boolean),
    ip:    IP_CATS.map(c => repGame("ip", c.value)).filter(Boolean),
    mbti:  MBTI_CATS.map(c => repGame("mbti", c.value)).filter(Boolean),
  }), []);

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 10000);
    return () => clearInterval(id);
  }, []);

  const reps = {
    genre: repPools.genre[tick % repPools.genre.length],
    human: repPools.human[(tick + 1) % repPools.human.length],
    ip:    repPools.ip[(tick + 2) % repPools.ip.length],
    mbti:  repPools.mbti[(tick + 3) % repPools.mbti.length],
  };
  
  const card = (cls, method, badge, title, desc) =>
    h(ImageCard, { 
      wide: cls === "wide", 
      tall: cls === "tall", 
      game: reps[method], 
      badge, 
      title, 
      sub: desc,
      onClick: () => go({ name: "category", method }) 
    });

  return h("div", { className: "screen" },
    h("div", { className: "topbar" }, h(Nlogo)),
    h("h1", { className: "page-title" }, "추천 방식 선택"),
    h("p", { className: "page-sub" }, "\"오늘은 어떤 모험이 끌리시나요?\""),
    h("div", { className: "method-grid" },
      card("tall", "genre", "장르", "장르별 추천", "액션, RPG 등 취향대로!"),
      card("", "human", "인원", "인원별 추천", "혼자서 해도, 다같이 해도 즐거운 게임!"),
      card("", "ip", "IP", "대표 IP별 추천", "마리오, 젤다 등 인기 시리즈!"),
      card("wide", "mbti", "MBTI", "MBTI별 추천", "내 성향에 딱 맞는 맞춤 추천!")),
    h("button", { className: "view-all-btn", onClick: () => go({ name: "all-games" }) },
      h(Icon, { name: "list", size: 18 }),
      "전체 게임 목록 보기"));
}

/* Large result card (one game). */
function BigCard({ game, onClick }) {
  return h("div", { className: "big-card", onClick },
    h(Cover, { game, alt: game.name, className: "card-img" }),
    h("div", { className: "card-shade" }),
    h("div", { className: "card-cap" },
      h("div", { className: "cap-title" }, game.name),
      h("div", { className: "cap-sub" }, game.genre + " · " + game.players + (game.mbti ? " · " + game.mbti : ""))));
}

/* ============================ Screens ================================= */
function Landing({ go }) {
  return h("div", { className: "screen landing" },
    h("div", { className: "topbar" }, h(Nlogo)),
    h("div", { className: "landing-hero" },
      h("div", { className: "switch2" }, "Switch 2"),
      h("div", { className: "popup" }, "POPUP STORE"),
      h("div", { className: "lead-sm" }, "30초면 충분해요!"),
      h("div", { className: "lead-lg" }, "게임 추천 가이드"),
      h("div", { className: "desc" }, "MBTI부터 선호 장르까지,", h("br"), "당신에게 꼭 맞는 새로운 즐거움을 찾아보세요."),
      h("button", { className: "start-btn", onClick: () => go({ name: "picker" }) }, "시작하기")));
}

function Category({ method, go }) {
  const meta = CATEGORY_META[method];
  const list = CATS[method] || [];
  return h("div", { className: "screen has-nav" },
    h(TopBar, { onBack: () => go({ name: "picker" }), onHome: () => go({ name: "landing" }) }),
    h("h1", { className: "page-title" }, meta.title),
    h("p", { className: "page-sub" }, "\"" + meta.sub + "\""),
    h("div", { className: "cat-grid" },
      list.map((c, i) => h(ImageCard, {
        key: c.value, game: repGame(method, c.value),
        title: c.label, sub: c.sub,
        wide: (method === "genre" && (i === 0 || i === 3 || i === 6)) ||
              (method === "human" && i === 2) ||
              (method === "ip"    && i === 6),
        tall: (method === "human" && (i === 0 || i === 1)) ||
              (method === "ip"    && (i === 0 || i === 3)),
        onClick: () => go({ name: "list", method, value: c.value }),
      }))));
}

function Results({ method, value, go }) {
  const c = catFor(method, value);
  const title = (c && (c.title || c.label)) || "추천 게임";
  const list = gamesFor(method, value);
  return h("div", { className: "screen has-nav" },
    h(TopBar, { onBack: () => go({ name: "category", method }), onHome: () => go({ name: "landing" }) }),
    h("h1", { className: "page-title" }, title),
    c && c.sub ? h("p", { className: "page-sub" }, "\"" + c.sub + "\"") : null,
    h("div", { className: "big-list" },
      list.length === 0 ? h("div", { className: "empty" }, "해당 조건의 게임이 없어요.") : null,
      list.map(g => h(BigCard, { key: g.id, game: g, onClick: () => go({ name: "detail", id: g.id }) }))));
}

function Detail({ id, go }) {
  const g = GAMES.find(x => x.id === id);
  if (!g) return h("div", { className: "screen" }, h("p", { className: "empty" }, "게임을 찾을 수 없어요."));

  // Text formatting
  const summary = g.summary || "특수 경찰이 되어,\n인류를 위협하는 존재에 맞서라!";
  const recs = g.features.map(f => `"${f} 좋아하는 분"`);

  return h("div", { className: "screen has-nav detail-screen" },
    h(TopBar, { onBack: () => go({ name: "picker" }), onHome: () => go({ name: "landing" }) }),
    
    // Title & Tags area
    h("h1", { className: "detail-title" }, g.name),
    h("div", { className: "tags" },
      g.mbti ? h("span", { className: "tag genre" }, g.mbti + " 추천") : null,
      h("span", { className: "tag players" }, g.players)
    ),

    // Trailer area
    h("div", { className: "trailer-label" }, "공식 트레일러"),
    h("div", { className: "trailer" }, h("iframe", {
      src: g.youtube,
      title: g.name + " 트레일러",
      allowFullScreen: true,
      frameBorder: "0",
      allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
    })),

    // Section 1: Summary
    h("div", { className: "section-label" }, "🦑 3초 요약 줄거리"),
    h("div", { className: "summary" }, `"${summary}"`),

    // Section 2: Features Grid
    h("div", { className: "section-label" }, "🔫 핵심 게임 설명"),
    h("div", { className: "feature-grid" }, 
      g.features.map((f, i) => 
        h("div", { key: i, className: "feature" }, 
          h("div", { className: "ftitle" }, f),
          h("div", { className: "fbox" }, "게임의 핵심 재미를\n경험해보세요.")
        )
      )
    ),

    // Section 3: Recommendations
    h("div", { className: "section-label" }, "🎯 이런 분에게 강력 추천!"),
    h("div", { className: "recommends" }, recs.map((r, i) => h("p", { key: i }, r))),

  );
}
function AllGames({ go }) {
  return h("div", { className: "screen has-nav" },
    h(TopBar, { onBack: () => go({ name: "picker" }), onHome: () => go({ name: "landing" }) }),
    h("h1", { className: "page-title" }, "전체 게임 목록"),
    h("p", { className: "page-sub" }, '"Switch 2 팝업스토어의 모든 게임"'),
    h("div", { className: "big-list" },
      GAMES.map(g => h(BigCard, { key: g.id, game: g, onClick: () => go({ name: "detail", id: g.id }) }))));
}

/* ============================ Router ================================== */
function App() {
  const [route, setRoute] = useState({ name: "landing" });
  const go = (r) => {
    (document.querySelector('.app-frame') || window).scrollTo({ top: 0, behavior: 'instant' });
    setRoute(r);
  };
  
  const showNav    = route.name !== "landing" && route.name !== "picker";
  const activeMethod = (route.name === "category" || route.name === "list") ? route.method : null;
  const activeValue  = route.name === "list" ? route.value : null;

  let view;
  switch (route.name) {
    case "picker":    view = h(Picker, { go }); break;
    case "category":  view = h(Category, { method: route.method, go }); break;
    case "list":      view = h(Results, { method: route.method, value: route.value, go }); break;
    case "detail":    view = h(Detail, { id: route.id, go }); break;
    case "all-games": view = h(AllGames, { go }); break;
    default:          view = h(Landing, { go });
  }

  let nav = null;
  if (showNav) {
    if      (activeMethod === "genre") nav = h(GenreBottomNav,  { active: activeValue, go });
    else if (activeMethod === "human") nav = h(MethodBottomNav, { tabs: HUMAN_NAV_TABS, method: "human", active: activeValue, go });
    else if (activeMethod === "ip")    nav = h(MethodBottomNav, { tabs: IP_NAV_TABS,    method: "ip",    active: activeValue, go });
    else if (activeMethod === "mbti")  nav = h(MethodBottomNav, { tabs: MBTI_NAV_TABS,  method: "mbti",  active: activeValue, go });
    else                               nav = h(BottomNav,       { active: activeMethod, go });
  }

  return h("div", { className: "app-frame" }, view, nav);
}
ReactDOM.createRoot(document.getElementById("root")).render(h(App));
