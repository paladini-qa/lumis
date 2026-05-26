// app.jsx — Lumis main composition (mobile + desktop side-by-side)
const { useState: useStateApp, useEffect: useEffectApp } = React;

const TABS = [
  { id: 'dash',  label: 'Dashboard',      mobileLabel: 'Dashboard',  Ic: IcDashboard, Mob: window.MobDashboard, Desk: window.DeskDashboard },
  { id: 'cards', label: 'Payment Methods',mobileLabel: 'Payment\nMethods', Ic: IcCard,     Mob: window.MobCards,     Desk: window.DeskCards },
  { id: 'ana',   label: 'Analytics',      mobileLabel: 'Analytics',  Ic: IcAnalytics, Mob: window.MobAnalytics, Desk: window.DeskAnalytics },
  { id: 'goals', label: 'Savings Goals',  mobileLabel: 'Savings\nGoals', Ic: IcGoals,     Mob: window.MobGoals,     Desk: window.DeskGoals },
  { id: 'ai',    label: 'Lumis AI',       mobileLabel: 'Lumis AI',   Ic: IcSparkle,   Mob: window.MobAI,        Desk: window.DeskAI },
];

function LumisApp() {
  const [tab, setTab] = useStateApp('dash');
  const sceneRef = React.useRef(null);

  // Scale-to-fit: 1720px design width → fits any viewport
  useEffectApp(() => {
    const fit = () => {
      if (!sceneRef.current) return;
      const designW = 1720;
      const vw = window.innerWidth;
      const scale = Math.min(1, vw / designW);
      sceneRef.current.style.transform = `scale(${scale})`;
      // pin parent height to scaled child to avoid extra whitespace
      const childH = sceneRef.current.scrollHeight;
      sceneRef.current.parentElement.style.height = (childH * scale) + 'px';
    };
    fit();
    window.addEventListener('resize', fit);
    const obs = new ResizeObserver(fit);
    if (sceneRef.current) obs.observe(sceneRef.current);
    return () => { window.removeEventListener('resize', fit); obs.disconnect(); };
  });

  // Single shared state — drives BOTH mobile and desktop simultaneously
  const [shared, setShared] = useStateApp({
    hidden: false,
    qa: null,
    barIdx: 4,         // May
    trendIdx: 9,       // Oct
    catIdx: null,
    goalIdx: 0,
    activeCardId: 'noir',
    flippedId: null,
    contribute: null,
    messages: window.LUMIS_DATA.aiSeed,
    draft: '',
    thinking: false,
  });

  // accepts patch object OR (prev) => patch  for async updates
  const set = (patch) => {
    if (typeof patch === 'function') setShared(prev => ({ ...prev, ...patch(prev) }));
    else setShared(prev => ({ ...prev, ...patch }));
  };

  const t = TABS.find(t => t.id === tab);

  return (
    <div className="stage">
      <div className="scene-fit">
      <div className="scene" ref={sceneRef} data-screen-label="01 Lumis Dashboard">
        {/* Brand header */}
        <div className="brand-row">
          <div className="rule"/>
          <div className="wordmark">
            <LumisMark size={28}/>
            <span>LUMIS</span>
            <span className="wordmark-tag">Private Finance · Est. 2026</span>
          </div>
          <div className="rule"/>
        </div>

        {/* Tab strip — drives both screens */}
        <div className="row" style={{ justifyContent: 'center' }}>
          <div className="row gap-4" style={{
            padding: 6,
            border: '1px solid var(--line)',
            borderRadius: 999,
            background: 'rgba(16,17,19,0.6)',
            backdropFilter: 'blur(14px)',
          }}>
            {TABS.map(x => {
              const active = x.id === tab;
              return (
                <button key={x.id}
                  onClick={() => setTab(x.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '9px 18px',
                    borderRadius: 999,
                    border: 0,
                    background: active
                      ? 'linear-gradient(135deg, rgba(230,198,135,0.18), rgba(230,198,135,0.06))'
                      : 'transparent',
                    color: active ? 'var(--gold)' : 'var(--ivory-mute)',
                    fontSize: 12,
                    fontWeight: 500,
                    letterSpacing: '0.04em',
                    cursor: 'pointer',
                    transition: 'background .15s, color .15s',
                    boxShadow: active ? 'inset 0 0 0 1px rgba(230,198,135,0.2)' : 'none',
                  }}>
                  <x.Ic size={14}/>
                  {x.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile + Desktop duo */}
        <div className="duo">
          {/* MOBILE */}
          <div className="phone-cradle">
            <div className="phone">
              <div className="phone-screen">
                <div className="phone-island"/>
                <div className="phone-status">
                  <span>9:41</span>
                  <span className="row gap-4" style={{ fontSize: 12 }}>
                    <svg width="16" height="10" viewBox="0 0 16 10" fill="currentColor">
                      <rect x="0" y="6" width="2.5" height="4" rx="0.4"/>
                      <rect x="3.5" y="4" width="2.5" height="6" rx="0.4"/>
                      <rect x="7" y="2" width="2.5" height="8" rx="0.4"/>
                      <rect x="10.5" y="0" width="2.5" height="10" rx="0.4"/>
                    </svg>
                    <svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor">
                      <path d="M7 2.7c1.9 0 3.6.7 4.8 2L13 3.5C11.4 2 9.3 1 7 1S2.6 2 1 3.5L2.2 4.7C3.4 3.4 5.1 2.7 7 2.7z"/>
                      <path d="M7 5.5c1.1 0 2.1.4 2.9 1.2l1.2-1.2C10 4.5 8.5 4 7 4s-3 .5-4.1 1.5l1.2 1.2C5 5.9 6 5.5 7 5.5z"/>
                      <circle cx="7" cy="8.5" r="1.3"/>
                    </svg>
                    <svg width="22" height="11" viewBox="0 0 22 11" fill="none">
                      <rect x="0.5" y="0.5" width="18" height="10" rx="2.5" stroke="currentColor" strokeOpacity="0.5"/>
                      <rect x="2" y="2" width="15" height="7" rx="1.2" fill="currentColor"/>
                      <path d="M20 4v3c.7-.2 1.3-1 1.3-1.5S20.7 4.2 20 4z" fill="currentColor" fillOpacity="0.6"/>
                    </svg>
                  </span>
                </div>

                <div className="scroll-y" style={{
                  position: 'absolute',
                  top: 56, left: 0, right: 0, bottom: 0,
                  overflowY: 'auto', paddingTop: 12,
                  display: 'flex', flexDirection: 'column',
                }}>
                  <t.Mob shared={shared} set={set} />
                </div>

                {/* Bottom tab bar */}
                <div className="mob-tabbar">
                  {TABS.map(x => {
                    const active = x.id === tab;
                    return (
                      <button key={x.id}
                        onClick={() => setTab(x.id)}
                        className={"mob-tab" + (active ? ' active' : '')}>
                        <x.Ic className="ic"/>
                        <span style={{ whiteSpace: 'pre-line' }}>{x.mobileLabel}</span>
                        <span className="dot"/>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* DESKTOP */}
          <div className="desk-cradle">
            <div className="desk">
              <div className="desk-titlebar">
                <div className="dots">
                  <div className="dot dot-r"/><div className="dot dot-y"/><div className="dot dot-g"/>
                </div>
                <div className="url">
                  <span className="lock">⌬</span>
                  app.<span className="domain">lumis</span>.finance / {t.label.toLowerCase().replace(/\s/g, '-')}
                </div>
                <div className="row gap-8">
                  <span className="chip" style={{ height: 22, fontSize: 10 }}>v2.4</span>
                </div>
              </div>
              <div className="desk-body">
                <nav className="side-nav">
                  <div className="brand">
                    <span className="mark"/>
                    LUMIS
                  </div>
                  {TABS.map(x => {
                    const active = x.id === tab;
                    return (
                      <button key={x.id}
                        onClick={() => setTab(x.id)}
                        className={"nav-item" + (active ? ' active' : '')}>
                        <x.Ic className="ic"/>
                        <span>{x.label}</span>
                        {active && <span style={{
                          marginLeft: 'auto',
                          width: 4, height: 14, borderRadius: 2,
                          background: 'var(--gold)',
                          boxShadow: '0 0 8px var(--gold)',
                        }}/>}
                      </button>
                    );
                  })}

                  <div className="nav-foot">
                    <div className="avatar">A</div>
                    <div className="user-meta">
                      <div className="name">Alex Castellan</div>
                      <div className="plan">Lumis Private</div>
                    </div>
                  </div>
                </nav>

                <main style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <t.Desk shared={shared} set={set} />
                </main>
              </div>
            </div>
          </div>
        </div>

        {/* Footer brand */}
        <div className="brand-row" style={{ opacity: 0.5 }}>
          <div className="rule"/>
          <span style={{
            fontFamily: 'Marcellus, serif',
            fontSize: 18,
            color: 'var(--ivory-mute)',
            letterSpacing: '0.3em',
          }}>L · U · M · I · S</span>
          <div className="rule"/>
        </div>
      </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<LumisApp />);
