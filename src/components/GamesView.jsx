import GameCard from "./GameCard.jsx";

function groupBySaga(games) {
  const groups = {};
  games.forEach((g) => {
    const key = g.saga || "Otros";
    if (!groups[key]) groups[key] = [];
    groups[key].push(g);
  });
  Object.values(groups).forEach((arr) => arr.sort((a, b) => a.y - b.y));
  return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
}

export function SagaView({ games, requestCover, covers, loadingCovers, onOpenGame }) {
  const groups = groupBySaga(games);
  return (
    <div>
      {groups.map(([saga, list]) => (
        <div key={saga} className="saga-group">
          <div className="saga-heading">
            {saga}
            <div className="saga-heading__rule" />
            <span className="saga-heading__count">{list.length}</span>
          </div>
          <div className="game-grid">
            {list.map((g) => (
              <GameCard key={g.id} game={g} requestCover={requestCover} covers={covers} loadingCovers={loadingCovers} onOpen={onOpenGame} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function GridView({ games, requestCover, covers, loadingCovers, onOpenGame }) {
  return (
    <div className="game-grid">
      {games.map((g) => (
        <GameCard key={g.id} game={g} requestCover={requestCover} covers={covers} loadingCovers={loadingCovers} onOpen={onOpenGame} />
      ))}
    </div>
  );
}
