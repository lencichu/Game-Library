export default function ConsolePanel({ data, stats }) {
  const chips = [
    ["Total", stats.total, "chip--accent"],
    ["Con caja", stats.withBox, "chip--success"],
    ["Sin caja", stats.noBox, "chip--muted"],
    ["Japoneses", stats.jp, "chip--warning"],
    ["Especiales", stats.special, "chip--info"],
  ];

  return (
    <div className="console-panel">
      <div className="console-card">
        <img
          className="console-card__photo"
          src={data.photo}
          alt={data.name}
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
        <div style={{ flex: 1, minWidth: 200 }}>
          <div className="console-card__head">
            <h2 className="h3" style={{ margin: 0 }}>{data.emoji} {data.name}</h2>
            <span className="console-card__year">{data.year}</span>
            <span className="console-card__case">{data.caseColor}</span>
          </div>
          <p className="console-card__desc">{data.desc}</p>
          <div className="chip-row">
            {chips.map(([label, value, cls]) => (
              <span key={label} className={`chip ${cls}`}>{label}: <strong>{value}</strong></span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
