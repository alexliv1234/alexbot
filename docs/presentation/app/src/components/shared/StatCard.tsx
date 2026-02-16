interface Props {
  number: string;
  label: string;
  color: string;
}

export default function StatCard({ number, label, color }: Props) {
  return (
    <div className="card stat-card">
      <div className="stat-number" style={{ color }}>{number}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
