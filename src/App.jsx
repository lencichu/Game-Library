import { useMemo, useState } from "react";
import { CONSOLES } from "./data/consoles.js";
import { GAMES_BY_CONSOLE } from "./data/games.js";
import { useCovers } from "./hooks/useCovers.js";
import Logo from "./components/Logo.jsx";
import Tab from "./components/Tab.jsx";
import ConsolePanel from "./components/ConsolePanel.jsx";
import { SagaView, GridView } from "./components/GamesView.jsx";

const LEGEND = [
  ["JP", "Versión japonesa"],
  ["📦", "Con caja original"],
  ["×2", "Repetido"],
  ["★", "Edición especial"],
];

function computeStats(games) {
  return {
    total: games.length,
    withBox: games.filter((g) => g.b).length,
    noBox: games.filter((g) => !g.b).length,
    jp: games.filter((g) => g.jp).length,
    special: games.filter((g) => g.sp).length,
  };
}

export default function App() {
  const [activeConsole, setActiveConsole] = useState("all");
  const [searchQ, setSearchQ] = useState("");
  const [sortMode, setSortMode] = useState("saga"); // saga | year | alpha
  const [filterJP, setFilterJP] = useState(false);
  const [filterBox, setFilterBox] = useState(false);
  const [filterSpecial, setFilterSpecial] = useState(false);
  const { covers, loadingCovers, requestCover } = useCovers();

  const allGames = useMemo(
    () =>
      Object.entries(GAMES_BY_CONSOLE).flatMap(([cid, games]) =>
        games.map((g) => ({ ...g, consoleId: cid }))
      ),
    []
  );

  const statsByConsole = useMemo(() => {
    const map = {};
    CONSOLES.forEach((c) => {
      map[c.id] = computeStats(GAMES_BY_CONSOLE[c.id] || []);
    });
    return map;
  }, []);

  const totalStats = useMemo(() => computeStats(allGames), [allGames]);

  const activeConsoleData = CONSOLES.find((c) => c.id === activeConsole);
  const stats = activeConsole === "all" ? totalStats : statsByConsole[activeConsole] || totalStats;

  const displayGames = useMemo(() => {
    let games =
      activeConsole === "all"
        ? allGames
        : (GAMES_BY_CONSOLE[activeConsole] || []).map((g) => ({ ...g, consoleId: activeConsole }));

    if (searchQ) {
      const q = searchQ.toLowerCase();
      games = games.filter((g) => g.t.toLowerCase().includes(q) || (g.jt && g.jt.includes(searchQ)));
    }
    if (filterJP) games = games.filter((g) => g.jp);
    if (filterBox) games = games.filter((g) => g.b);
    if (filterSpecial) games = games.filter((g) => g.sp);
    return games;
  }, [activeConsole, allGames, searchQ, filterJP, filterBox, filterSpecial]);

  const sortedGames = useMemo(() => {
    if (sortMode === "year") return [...displayGames].sort((a, b) => a.y - b.y);
    if (sortMode === "alpha") return [...displayGames].sort((a, b) => a.t.localeCompare(b.t));
    return displayGames;
  }, [displayGames, sortMode]);

  const noFiltersActive = !searchQ && !filterJP && !filterBox && !filterSpecial;
  const showSagaView = sortMode === "saga" && noFiltersActive;

  return (
    <div className="app">
      <header className="site-header">
        <div className="eyebrow" style={{ marginBottom: "0.6rem" }}>Catálogo personal</div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Logo height={56} />
        </div>
        <p className="p-lg">Con carátulas · Japoneses diferenciados · Ordenado por sagas</p>
      </header>

      <div className="stats-row">
        {[
          ["Juegos totales", stats.total],
          ["Con caja", stats.withBox],
          ["Sin caja", stats.noBox],
          ["Japoneses", stats.jp],
          ["Ed. especiales", stats.special],
        ].map(([label, val]) => (
          <div key={label} className="stat-tile">
            <div className="stat-tile__value">{val}</div>
            <div className="stat-tile__label">{label}</div>
          </div>
        ))}
      </div>

      <div className="legend">
        {LEGEND.map(([icon, label]) => (
          <span key={label} className="legend__item">
            <span className="legend__badge">{icon}</span> {label}
          </span>
        ))}
      </div>

      <div className="toolbar">
        <input
          type="search"
          className="search-input"
          placeholder="🔍 Buscar juego…"
          value={searchQ}
          onChange={(e) => setSearchQ(e.target.value)}
        />
        {[
          ["year", "📅 Por fecha"],
          ["saga", "📚 Por saga"],
          ["alpha", "🔤 A-Z"],
        ].map(([val, label]) => (
          <button
            key={val}
            className={`pill${sortMode === val ? " is-active" : ""}`}
            onClick={() => setSortMode(val)}
          >
            {label}
          </button>
        ))}
        <button
          className={`pill pill--warning${filterJP ? " is-active" : ""}`}
          onClick={() => setFilterJP((v) => !v)}
        >
          JP 🇯🇵
        </button>
        <button
          className={`pill pill--success${filterBox ? " is-active" : ""}`}
          onClick={() => setFilterBox((v) => !v)}
        >
          Caja 📦
        </button>
        <button
          className={`pill${filterSpecial ? " is-active" : ""}`}
          onClick={() => setFilterSpecial((v) => !v)}
        >
          ★ Especial
        </button>
      </div>

      <nav className="tabs-bar">
        <div className="tabs-bar__row">
          <Tab label="⭐ Todas" active={activeConsole === "all"} onClick={() => setActiveConsole("all")} />
          {CONSOLES.map((c) => (
            <Tab
              key={c.id}
              label={`${c.emoji} ${c.name}`}
              active={activeConsole === c.id}
              onClick={() => setActiveConsole(c.id)}
            />
          ))}
        </div>
      </nav>

      {activeConsoleData && <ConsolePanel data={activeConsoleData} stats={stats} />}

      <main className="catalog">
        {showSagaView ? (
          <SagaView games={displayGames} requestCover={requestCover} covers={covers} loadingCovers={loadingCovers} />
        ) : (
          <GridView games={sortedGames} requestCover={requestCover} covers={covers} loadingCovers={loadingCovers} />
        )}
        {displayGames.length === 0 && <p className="empty-state">No se encontraron juegos.</p>}
      </main>

      <footer className="site-footer">
        {allGames.length} juegos · {CONSOLES.length} consolas · Colección personal {new Date().getFullYear()}
      </footer>
    </div>
  );
}
