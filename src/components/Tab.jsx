export default function Tab({ label, active, onClick }) {
  return (
    <button className={`tab${active ? " is-active" : ""}`} onClick={onClick}>
      {label}
    </button>
  );
}
