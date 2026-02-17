interface Props {
  text: string;
  hebrew?: string;
  color?: string;
  source?: string;
}

export default function QuoteCard({
  text,
  hebrew,
  color = "var(--cyan)",
  source,
}: Props) {
  return (
    <div style={{ borderLeft: `3px solid ${color}`, paddingLeft: 16 }}>
      {hebrew && <div className="quote-hebrew">{hebrew}</div>}
      <div
        style={{
          fontStyle: "italic",
          color: "var(--text-secondary)",
          lineHeight: 1.5,
          fontSize: 16,
        }}
      >
        "{text}"
      </div>
      {source && (
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
          — {source}
        </div>
      )}
    </div>
  );
}
