// Brand mark adapted from docs/design-system.html (page 1 · cover + brand)
export default function Logo({ height = 40 }) {
  const width = (400 / 88) * height;
  return (
    <svg
      className="logo"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 88"
      width={width}
      height={height}
      role="img"
      aria-label="Colección videojuegos"
    >
      <g transform="translate(6,10)" fill="none" stroke="#0d1e38" strokeWidth="1.6" strokeLinejoin="round">
        <rect x="1" y="1" width="54" height="66" rx="6" />
        <rect x="8" y="8" width="40" height="28" fill="#e8eff7" stroke="none" />
        <rect x="8" y="8" width="40" height="28" />
        <line x1="10" y1="48" x2="20" y2="48" />
        <line x1="15" y1="43" x2="15" y2="53" />
        <circle cx="38" cy="46" r="2.5" />
        <circle cx="44" cy="52" r="2.5" fill="#1759d4" stroke="none" />
      </g>
      <text x="78" y="40" fontFamily="Fraunces, Georgia, serif" fontWeight="500" fontSize="30" fill="#0d1e38" letterSpacing="-0.01em">
        Colección
      </text>
      <text x="78" y="72" fontFamily="Fraunces, Georgia, serif" fontWeight="500" fontSize="30" fill="#1759d4" fontStyle="italic" letterSpacing="-0.01em">
        videojuegos
      </text>
    </svg>
  );
}
