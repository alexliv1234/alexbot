import FadeReveal from '../shared/FadeReveal';

export default function Slide06Scoring() {
  return (
    <>
      <FadeReveal revealKey="s06-title">
        <div className="slide-title">Every Message Gets a Score Out of 70</div>
      </FadeReveal>

      <div className="slide-columns slide-columns-2">
        <div>
          <FadeReveal revealKey="s06-scoring">
            <div className="card" style={{ fontSize: 16 }}>
              <div style={{ fontSize: 14, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
                7 Categories
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {[
                    ['🎨', 'Creativity', 'Original thinking'],
                    ['🧠', 'Challenge', 'How hard they made the bot think'],
                    ['😂', 'Humor', 'Made people laugh'],
                    ['💡', 'Cleverness', 'Smart tricks'],
                    ['🔥', 'Engagement', 'How engaging the interaction'],
                    ['🚨', 'Broke', 'Successfully caused errors'],
                    ['🔓', 'Hacked', 'Actual jailbreak success'],
                  ].map(([emoji, cat, desc]) => (
                    <tr key={cat} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '6px 0', width: 30 }}>{emoji}</td>
                      <td style={{ fontWeight: 600, padding: '6px 8px' }}>{cat}</td>
                      <td style={{ color: 'var(--text-muted)', padding: '6px 0' }}>{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: 12, color: 'var(--gold)', fontStyle: 'italic', fontSize: 14 }}>
                The bot scores its own attackers. Honestly.
              </div>
            </div>
          </FadeReveal>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <FadeReveal revealKey="s06-daily">
            <div className="card">
              <div style={{ fontSize: 14, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
                Daily Rituals
              </div>
              <div style={{ fontSize: 18, lineHeight: 2 }}>
                <div>☀️ 08:00 — Arena art + daily challenge</div>
                <div>⚔️ All day — Real-time scoring</div>
                <div>🌙 23:00 — Winners + dramatic generated art</div>
              </div>
            </div>
          </FadeReveal>

          <FadeReveal revealKey="s06-leaderboard">
            <div className="card">
              <div style={{ fontSize: 14, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
                Leaderboard
              </div>
              <div style={{ fontSize: 20, lineHeight: 2 }}>
                <div>🥇 Gil — <strong>2,493 pts</strong> / 106 messages</div>
                <div>🥈 Gal Abrass — 745 pts</div>
                <div>🥉 Amir Luzon — 611 pts</div>
              </div>
            </div>
          </FadeReveal>
        </div>
      </div>
    </>
  );
}
