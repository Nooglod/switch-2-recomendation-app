/* app.js — Switch 2 Popup Store · Game Recommendation Guide (React)
   Screens: Landing → Method picker → Filtered game list → Game detail.
   Game data comes from window.GAMES (see games.js). */

const { useState, useMemo } = React;
const GAMES = window.GAMES || [];

/* ---- derived filter option sets ------------------------------------- */
const PLAYER_OPTS = ["1인용", "2인용", "3인 이상"];
const GENRE_OPTS = Array.from(new Set(GAMES.map(g => g.genre))).filter(Boolean).sort();
const MBTI_OPTS = ["XXTP", "XXFJ", "XXFP", "XXTJ"];
const IP_OPTS = [
  { label: "마리오", key: "마리오" },
  { label: "젤다", key: "젤다" },
  { label: "포켓몬", key: "포켓" },
  { label: "커비", key: "커비" },
  { label: "스플래툰", key: "스플래" },
  { label: "제노블레이드", key: "제노" },
  { label: "메트로이드", key: "메트로이드" },
  { label: "F-ZERO", key: "F-ZERO" },
];

const METHODS = {
  human: { title: "인원별 추천 선택", sub: "플레이 인원을 선택하고 맞춤형 리스트를 만나보세요." },
  genre: { title: "장르별 추천 선택", sub: "원하는 장르를 골라 취향에 맞는 게임을 찾아보세요." },
  ip:    { title: "대표 IP별 추천 선택", sub: "좋아하는 시리즈를 골라보세요." },
  mbti:  { title: "MBTI별 추천 선택", sub: "내 성향에 딱 맞는 맞춤 추천을 받아보세요." },
};

/* ---- shared bits ----------------------------------------------------- */
function Nlogo() { return <span className="nlogo">Nintendo</span>; }

function TopBar({ onBack, onHome }) {
  return (
    <div className="topbar">
      {onBack && (
        <button className="icon-btn back" onClick={onBack}>
          <span className="glyph">←</span>BACK
        </button>
      )}
      <Nlogo />
      {onHome && (
        <button className="icon-btn home" onClick={onHome}>
          <span className="glyph">⌂</span>HOME
        </button>
      )}
    </div>
  );
}

/* ---- Landing --------------------------------------------------------- */
function Landing({ go }) {
  return (
    <div className="screen landing">
      <div className="topbar"><Nlogo /></div>
      <div className="landing-hero">
        <div className="switch2">Switch 2</div>
        <div className="popup">POPUP STORE</div>
        <div className="lead-sm">30초면 충분해요!</div>
        <div className="lead-lg">게임 추천 가이드</div>
        <div className="desc">MBTI부터 선호 장르까지,<br/>당신에게 꼭 맞는 새로운 즐거움을 찾아보세요.</div>
        <button className="start-btn" onClick={() => go({ name: "picker" })}>시작하기</button>
      </div>
    </div>
  );
}

/* ---- Method picker --------------------------------------------------- */
function Picker({ go }) {
  return (
    <div className="screen">
      <div className="topbar"><Nlogo /></div>
      <h1 className="page-title">추천 방식 선택</h1>
      <p className="page-sub">"오늘은 어떤 모험이 끌리시나요?"</p>
      <div className="method-grid">
        <div className="method-card tall" onClick={() => go({ name: "list", method: "genre" })}>
          <div className="badge">장르</div>
          <h3>장르별 추천</h3><p>액션, RPG 등 취향대로!</p>
        </div>
        <div className="method-card" onClick={() => go({ name: "list", method: "human" })}>
          <div className="badge">인원</div>
          <h3>인원별 추천</h3><p>혼자서 해도, 다같이 해도 즐거운 게임!</p>
        </div>
        <div className="method-card" onClick={() => go({ name: "list", method: "ip" })}>
          <div className="badge">IP</div>
          <h3>대표 IP별 추천</h3><p>마리오, 젤다 등 인기 시리즈!</p>
        </div>
        <div className="method-card wide" onClick={() => go({ name: "list", method: "mbti" })}>
          <div className="badge">MBTI</div>
          <h3>MBTI별 추천</h3><p>내 성향에 딱 맞는 맞춤 추천!</p>
        </div>
      </div>
    </div>
  );
}

/* ---- Game list (filtered) ------------------------------------------- */
function GameList({ method, preset, go }) {
  const opts = method === "human" ? PLAYER_OPTS
    : method === "genre" ? GENRE_OPTS
    : method === "mbti" ? MBTI_OPTS
    : IP_OPTS.map(o => o.label);
  const [sel, setSel] = useState(preset || opts[0]);

  const filtered = useMemo(() => {
    if (method === "human") return GAMES.filter(g => g.players === sel);
    if (method === "genre") return GAMES.filter(g => g.genre === sel);
    if (method === "mbti")  return GAMES.filter(g => g.mbti === sel);
    const key = (IP_OPTS.find(o => o.label === sel) || {}).key || sel;
    return GAMES.filter(g => g.name.includes(key));
  }, [method, sel]);

  const meta = METHODS[method];
  return (
    <div className="screen">
      <TopBar onBack={() => go({ name: "picker" })} onHome={() => go({ name: "landing" })} />
      <h1 className="page-title">{meta.title}</h1>
      <p className="page-sub">"{meta.sub}"</p>
      <div className="chips">
        {opts.map(o => (
          <div key={o} className={"chip" + (o === sel ? " active" : "")} onClick={() => setSel(o)}>{o}</div>
        ))}
      </div>
      <div className="game-list">
        {filtered.length === 0 && <div className="empty">해당 조건의 게임이 없어요.</div>}
        {filtered.map(g => (
          <div key={g.id} className="game-row" onClick={() => go({ name: "detail", id: g.id })}>
            <div className="gi">
              <div className="gname">{g.name}</div>
              <div className="gmeta">{g.genre} · {g.players}{g.mbti ? " · " + g.mbti : ""}</div>
            </div>
            <span className="arrow">›</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- Game detail ----------------------------------------------------- */
function Detail({ id, go }) {
  const g = GAMES.find(x => x.id === id);
  if (!g) return <div className="screen"><p className="empty">게임을 찾을 수 없어요.</p></div>;

  const summary = g.summary || `${g.genre} 장르의 ${g.players} 추천작!\n${g.features.join(", ")}을(를) 즐길 수 있어요.`;
  const recs = g.features.map(f => `${f}을(를) 좋아하는 분`);

  return (
    <div className="screen">
      <TopBar onBack={() => go({ name: "picker" })} onHome={() => go({ name: "landing" })} />
      <h1 className="detail-title">{g.name}</h1>
      <div className="tags">
        <span className="tag genre">{g.genre}</span>
        <span className="tag players">{g.players}</span>
      </div>

      <span className="trailer-label">공식 트레일러</span>
      <div className="trailer">
        <iframe src={g.youtube} title={g.name + " 트레일러"} allowFullScreen></iframe>
      </div>

      <div className="section-label">🦑 3초 요약 줄거리</div>
      <div className="summary">{summary}</div>

      <div className="section-label">🔫 핵심 게임 설명</div>
      <div className="feature-grid">
        {g.features.map((f, i) => (
          <div key={i} className="feature">
            <div className="fbox">{f}</div>
          </div>
        ))}
      </div>

      <div className="section-label">🎯 이런 분에게 강력 추천!</div>
      <div className="recommends">
        {recs.map((r, i) => <p key={i}>{r}</p>)}
      </div>

      <div className="mbti-nav">
        {MBTI_OPTS.map(m => (
          <div key={m}
               className={"mbti-item" + (m === g.mbti ? " active" : "")}
               onClick={() => go({ name: "list", method: "mbti", preset: m })}>
            <div className="big">{m.slice(2)}</div>
            <div className="small">{m}</div>
          </div>
        ))}
      </div>

      <p className="footnote">트레일러 영상은 placeholder 입니다 · games.js의 youtube 값을 실제 YouTube embed ID로 교체하세요.</p>
    </div>
  );
}

/* ---- Root router ----------------------------------------------------- */
function App() {
  const [route, setRoute] = useState({ name: "landing" });
  const go = (r) => { window.scrollTo(0, 0); setRoute(r); };

  let view;
  switch (route.name) {
    case "picker": view = <Picker go={go} />; break;
    case "list":   view = <GameList method={route.method} preset={route.preset} go={go} />; break;
    case "detail": view = <Detail id={route.id} go={go} />; break;
    default:       view = <Landing go={go} />;
  }
  return <div className="app-frame">{view}</div>;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
