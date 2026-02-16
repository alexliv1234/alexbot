import FadeReveal from '../shared/FadeReveal';

export default function Slide13Architecture() {
  return (
    <>
      <FadeReveal revealKey="s13-title">
        <div className="slide-title">Under the Hood (Speed Round)</div>
      </FadeReveal>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, flex: 1, minHeight: 0, alignContent: 'center' }}>
        <FadeReveal revealKey="s13-agents">
          <div className="card">
            <div style={{ fontSize: 14, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, fontWeight: 700 }}>
              4 Agents
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 16 }}>
              <div><strong>Main</strong> (Claude Opus 4.5) — complex tasks</div>
              <div><strong>Fast</strong> (Claude Sonnet 4.5) — the game</div>
              <div><strong>Bot Handler</strong> (Sonnet) — bot-to-bot</div>
              <div><strong>Learning</strong> (Sonnet) — education</div>
            </div>
          </div>
        </FadeReveal>

        <FadeReveal revealKey="s13-pipeline">
          <div className="card">
            <div style={{ fontSize: 14, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, fontWeight: 700 }}>
              3 Security Extensions
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 16, flexWrap: 'wrap' }}>
              <span className="card" style={{ padding: '6px 12px', background: 'rgba(0,188,212,0.15)' }}>Group Guardian</span>
              <span style={{ color: 'var(--text-muted)' }}>→</span>
              <span className="card" style={{ padding: '6px 12px', background: 'rgba(0,188,212,0.15)' }}>Prompt Protection</span>
              <span style={{ color: 'var(--text-muted)' }}>→</span>
              <span className="card" style={{ padding: '6px 12px', background: 'rgba(0,188,212,0.15)' }}>Humor Errors</span>
            </div>
          </div>
        </FadeReveal>

        <FadeReveal revealKey="s13-memory">
          <div className="card" style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 20, textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--cyan)' }}>9,400+</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>session files</div>
              </div>
              <div>
                <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--cyan)' }}>18</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>skills</div>
              </div>
              <div>
                <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--cyan)' }}>52+</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>automation scripts</div>
              </div>
              <div>
                <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--cyan)' }}>15+</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>cron jobs</div>
              </div>
            </div>
          </div>
        </FadeReveal>
      </div>
    </>
  );
}
