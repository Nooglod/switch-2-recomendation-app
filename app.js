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
const INDIE = new Set(["game4","game5","game7","game11","game12","game38","game39","game40","game41"]);
const ROGUE = new Set(["game4","game11","game12","game41","game21"]);

const GENRE_CATS = [
  { value: "action", label: "액션 게임 추천",        sub: "짜릿한 손맛과 타격감! 당신의 한계를 시험할 다이내믹한 플레이",   match: g => /액션/.test(g.genre) },
  { value: "fps",    label: "슈팅/FPS 게임 추천",     sub: "시원하게 터지는 쾌감과 전장을 지배하는 짜릿함",   match: g => /슈팅|FPS/.test(g.genre) },
  { value: "rpg",    label: "RPG 게임 추천",          sub: "당신이 주인공이 되는 방대한 이야기",     match: g => /RPG/.test(g.genre) },
  { value: "sports", label: "스포츠/레이싱 게임 추천", sub: "0.1초의 승부! 심장을 뛰게 할 압도적인 스피드와 승리의 쾌감", match: g => /스포츠|레이싱/.test(g.genre) },
  { value: "indie",  label: "인디 게임 추천",         sub: "세상에 없던 독창적인 아이디어와 감성",     match: g => INDIE.has(g.id) },
  { value: "rogue",  label: "로그라이크 게임 추천",    sub: "매번 새로워지는 던전과 예측 불가의 모험",     match: g => /로그라이/.test(g.genre) || ROGUE.has(g.id) },
  { value: "moba",   label: "MOBA 게임 추천",         sub: "협동이 곧 승리! 실시간으로 펼쳐지는 완벽한 팀플레이와 전략 싸움",     match: g => /MOBA/.test(g.genre) },
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
  { method: "genre", label: "장르", icon: "🎮" },
  { method: "human", label: "인원", icon: "👥" },
  { method: "ip",    label: "IP",   icon: "🌟" },
  { method: "mbti",  label: "MBTI", icon: "🧬" },
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
  const localChain = ["images/" + game.id + ".png", "images/" + game.id + ".jpg"];
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
      h("span", { className: "bn-icon" }, t.icon), h("span", { className: "bn-label" }, t.label))));
}

/* Image card with caption overlay (used for category cards & picker). */
/* 1. ImageCard 업데이트 (tall 속성 추가) */
function ImageCard({ game, title, sub, badge, wide, tall, onClick }) {
  let cls = "img-card";
  if (wide) cls += " wide";
  if (tall) cls += " tall"; // 세로로 2칸을 차지하는 카드용
  
  return h("div", { className: cls, onClick },
    game ? h(Cover, { game, alt: title, className: "card-img" }) : null,
    h("div", { className: "card-shade" }),
    h("div", { className: "card-cap" },
      badge ? h("div", { className: "badge" }, badge) : null,
      h("div", { className: "cap-title" }, title),
      sub ? h("div", { className: "cap-sub" }, sub) : null));
}

function Picker({ go }) {
  const reps = {
    genre: repGame("genre", "action"),
    human: repGame("human", "3인 이상"),
    ip:    repGame("ip", "마리오"),
    mbti:  repGame("mbti", "XXTP"),
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

  return h("div", { className: "screen has-nav" },
    h("div", { className: "topbar" }, h(Nlogo)),
    h("h1", { className: "page-title" }, "추천 방식 선택"),
    h("p", { className: "page-sub" }, "\"오늘은 어떤 모험이 끌리시나요?\""),
    h("div", { className: "method-grid" },
      // 스크린샷과 정확히 일치하는 텍스트와 그리드 클래스
      card("tall", "genre", "장르", "장르별 추천", "액션, RPG 등 취향대로!"),
      card("", "human", "인원", "인원별 추천", "혼자서 해도, 다같이 해도 즐거운 게임!"),
      card("", "ip", "IP", "대표 IP별 추천", "마리오, 젤다 등 인기 시리즈!"),
      card("wide", "mbti", "MBTI", "MBTI별 추천", "내 성향에 딱 맞는 맞춤 추천!")));
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
        tall: (method === "human" && i === 1) ||
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

  // Genre icon mapping
  const genreIcons = { action: "🍄", fps: "🔫", rpg: "⚔️", sports: "🏎️", indie: "⭐", rogue: "💀", moba: "🏰" };

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

    // Bottom Genre Navigation (The red grid)
    h("div", { className: "detail-genre-nav" },
      GENRE_CATS.map(c => 
        h("div", { 
          key: c.value, 
          className: "d-genre-item", 
          onClick: () => go({ name: "list", method: "genre", value: c.value }) 
        },
          h("div", { className: "icon" }, genreIcons[c.value] || "🎮"),
          h("div", { className: "label" }, c.label.replace(" 게임 추천", "").replace(" 게임", ""))
        )
      )
    ),
    
    h("p", { className: "footnote" }, "트레일러 영상은 placeholder 입니다 · games.js의 youtube 값을 실제 YouTube embed ID로 교체하세요.")
  );
}
/* ============================ Router ================================== */
function App() {
  const [route, setRoute] = useState({ name: "landing" });
  const go = (r) => {
    (document.querySelector('.app-frame') || window).scrollTo({ top: 0, behavior: 'instant' });
    setRoute(r);
  };
  const showNav = route.name !== "landing";
  const navActive = (route.name === "category" || route.name === "list") ? route.method : null;
  let view;
  switch (route.name) {
    case "picker":   view = h(Picker, { go }); break;
    case "category": view = h(Category, { method: route.method, go }); break;
    case "list":     view = h(Results, { method: route.method, value: route.value, go }); break;
    case "detail":   view = h(Detail, { id: route.id, go }); break;
    default:         view = h(Landing, { go });
  }
  return h("div", { className: "app-frame" },
    view,
    showNav ? h(BottomNav, { active: navActive, go }) : null);
}
ReactDOM.createRoot(document.getElementById("root")).render(h(App));
