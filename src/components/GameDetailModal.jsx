import { useEffect } from "react";

const SAGA_LABEL = "Saga";

export default function GameDetailModal({ game, consoleData, coverUrl, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!game) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={game.t}>
        <button className="modal-close" onClick={onClose} aria-label="Cerrar">✕</button>

        <div className="modal-body">
          <div className="modal-cover">
            {coverUrl ? (
              <img src={coverUrl} alt={game.t} />
            ) : (
              <div className="modal-cover__placeholder">🎮</div>
            )}
          </div>

          <div className="modal-info">
            <div className="eyebrow">{consoleData ? `${consoleData.emoji} ${consoleData.name}` : "Consola"}</div>
            <h2 className="h2" style={{ margin: "0.2rem 0 0.1rem" }}>{game.t}</h2>
            {game.jp && game.jt && <div className="modal-jp-title">{game.jt}</div>}

            <div className="chip-row" style={{ marginTop: "0.9rem" }}>
              <span className="chip chip--muted">{SAGA_LABEL}: <strong>{game.saga || "Otros"}</strong></span>
              <span className="chip chip--muted">Año: <strong>{game.y}</strong></span>
              {game.platform && <span className="chip chip--muted">{game.platform}</span>}
            </div>

            <div className="chip-row" style={{ marginTop: "0.5rem" }}>
              <span className={`chip ${game.b ? "chip--success" : "chip--muted"}`}>
                {game.b ? "📦 Con caja" : "Sin caja"}
              </span>
              {game.jp && <span className="chip chip--warning">🇯🇵 Versión japonesa</span>}
              {game.sp === "col" && <span className="chip chip--info">★ Edición especial</span>}
              {game.dup && <span className="chip chip--danger">×2 Duplicado</span>}
            </div>

            <p className="p-sm" style={{ marginTop: "1rem" }}>
              {consoleData?.desc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
