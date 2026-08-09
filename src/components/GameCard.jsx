import { useEffect, useRef, useState } from "react";

export default function GameCard({ game, requestCover, covers, loadingCovers, onOpen }) {
  const ref = useRef(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          requestCover(game);
          obs.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [game, requestCover]);

  const coverUrl = covers[game.id];
  const isLoading = loadingCovers[game.id];
  const showImage = coverUrl && !imgError;

  return (
    <div
      ref={ref}
      className="game-card"
      role="button"
      tabIndex={0}
      onClick={() => onOpen(game)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(game);
        }
      }}
    >
      <div className="game-card__badges">
        {game.jp && <span className="badge badge--jp">JP</span>}
        {game.dup && <span className="badge badge--dup">×2</span>}
        {game.sp === "col" && <span className="badge badge--special">★</span>}
      </div>
      <div className="game-card__year">{game.y}</div>

      <div className="game-card__cover">
        {isLoading && !showImage && <span className="game-card__spinner">⏳</span>}
        {showImage && (
          <img src={coverUrl} alt={game.t} loading="lazy" onError={() => setImgError(true)} />
        )}
        {!showImage && !isLoading && (
          <div className="game-card__placeholder">
            <span className="game-card__placeholder-icon">🎮</span>
            <span className="game-card__placeholder-title">{game.t}</span>
          </div>
        )}
      </div>

      <div className={`game-card__format-bar ${game.b ? "has-box" : "no-box"}`} />

      <div className="game-card__title">
        {game.t}
        {game.jp && game.jt && <div className="game-card__title-jp">{game.jt}</div>}
      </div>
    </div>
  );
}
