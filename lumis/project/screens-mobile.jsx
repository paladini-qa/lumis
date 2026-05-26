// screens-mobile.jsx — five mobile screens for Lumis
const { useState: useStateM, useEffect: useEffectM } = React;

// ───── Data (shared between mobile + desktop) ─────
const DATA = {
  balance: 18450.72,
  delta: 2.4,
  bars: [
    { label: 'Jan', value: 2840 },
    { label: 'Feb', value: 1980 },
    { label: 'Mar', value: 2210 },
    { label: 'Apr', value: 3120 },
    { label: 'May', value: 2740 },
    { label: 'Jun', value: 2100 },
    { label: 'Jul', value: 2580 },
  ],
  trends: [
    { label: 'Jan', value: 2840 }, { label: 'Feb', value: 1980 },
    { label: 'Mar', value: 2210 }, { label: 'Apr', value: 3120 },
    { label: 'May', value: 2740 }, { label: 'Jun', value: 2100 },
    { label: 'Jul', value: 2580 }, { label: 'Aug', value: 2920 },
    { label: 'Sep', value: 2380 }, { label: 'Oct', value: 3450 },
    { label: 'Nov', value: 2810 }, { label: 'Dec', value: 3180 },
  ],
  categories: [
    { label: 'Housing',    value: 1840, pct: 38, Ic: IcHome,   colorA: '#f3d99a', colorB: '#c9a961' },
    { label: 'Dining',     value: 620,  pct: 13, Ic: IcCoffee, colorA: '#e6c687', colorB: '#9c8044' },
    { label: 'Shopping',   value: 540,  pct: 11, Ic: IcCart,   colorA: '#d4b070', colorB: '#7a6336' },
    { label: 'Transport',  value: 420,  pct: 9,  Ic: IcCar,    colorA: '#b89657', colorB: '#5a4929' },
    { label: 'Travel',     value: 380,  pct: 8,  Ic: IcPlane,  colorA: '#a8854a', colorB: '#4a3c22' },
    { label: 'Entertainment', value: 280, pct: 6, Ic: IcMusic, colorA: '#977542', colorB: '#3a2f1a' },
    { label: 'Other',      value: 720,  pct: 15, Ic: IcMore,   colorA: '#856439', colorB: '#2a2214' },
  ],
  cards: [
    { id: 'noir',     name: 'Lumis Noir Reserve', tier: 'OBSIDIAN · INVITE-ONLY', holder: 'A. CASTELLAN', number: '4485 0000 0000 3142', expiry: '12/28', network: 'LUMIS·INFINITE', variant: 'noir', limit: 50000, used: 12300, closure: 24, due: 5 },
    { id: 'gold',     name: 'Lumis Gold',          tier: 'PREMIUM', holder: 'A. CASTELLAN', number: '5412 0000 0000 7821', expiry: '08/27', network: 'LUMIS·GOLD', variant: 'gold', limit: 20000, used: 4520, closure: 14, due: 25 },
    { id: 'platinum', name: 'Lumis Platinum',      tier: 'PRIVATE BANKING', holder: 'A. CASTELLAN', number: '3782 000000 09876', expiry: '03/29', network: 'LUMIS·EXPRESS', variant: 'platinum', limit: 35000, used: 8240, closure: 20, due: 10 },
  ],
  goals: [
    { id: 'kyoto',   name: 'Kyoto Sabbatical', emoji: '✦', saved: 6800, target: 12000, eta: 'On track · Sep 2026' },
    { id: 'porsche', name: 'Vintage 911',      emoji: '◈', saved: 24500, target: 60000, eta: 'Behind · Q3 2027' },
    { id: 'house',   name: 'Down Payment',     emoji: '⬡', saved: 48200, target: 80000, eta: 'On track · Mar 2027' },
    { id: 'safety',  name: 'Safety Reserve',   emoji: '◉', saved: 14000, target: 15000, eta: 'Almost there' },
  ],
  transactions: [
    { name: 'Equiting Capital',   cat: 'Investment',  date: '20 Jun',  amount: -1820.00, method: 'Lumis Noir',    Ic: IcShield },
    { name: 'Aman Resort, Kyoto', cat: 'Travel',      date: '18 Jun',  amount: -2840.00, method: 'Lumis Platinum',Ic: IcPlane },
    { name: 'Whole Foods Market', cat: 'Groceries',   date: '17 Jun',  amount: -148.92,  method: 'Lumis Gold',    Ic: IcCart },
    { name: 'Salary · Lumière Co.', cat: 'Income',    date: '15 Jun',  amount:  9400.00, method: 'ACH Direct',    Ic: IcBolt },
    { name: 'Blue Bottle Coffee', cat: 'Dining',      date: '14 Jun',  amount: -28.50,   method: 'Lumis Gold',    Ic: IcCoffee },
    { name: 'Spotify · Family',   cat: 'Subscription',date: '14 Jun',  amount: -16.99,   method: 'Lumis Gold',    Ic: IcMusic },
  ],
  upcoming: [
    { name: 'Equiting Capital',   amount: 1820.00, date: '20 Jun', tag: 'Auto-pay' },
    { name: 'PG&E Utilities',     amount: 184.32,  date: '24 Jun', tag: 'Manual' },
    { name: 'Aman Stay · Final',  amount: 1200.00, date: '27 Jun', tag: 'Auto-pay' },
    { name: 'AppleCare+',         amount: 9.99,    date: '28 Jun', tag: 'Auto-pay' },
  ],
  aiSeed: [
    { role: 'ai', text: "Good morning, Alex. Your June spend is **8.4%** below your trailing average — the Kyoto reserve has $1,840 of headroom this month if you'd like to move it." },
  ],
};

window.LUMIS_DATA = DATA;

// ───────────────────────────────────────────────
// Mobile · Dashboard
// ───────────────────────────────────────────────
function MobDashboard({ shared, set }) {
  const { hidden, qa, barIdx } = shared;
  return (
    <div className="col gap-16" style={{ padding: '0 18px' }}>
      <BalanceCard value={DATA.balance} hidden={hidden}
        onToggle={() => set({ hidden: !hidden })}
        delta={DATA.delta} big />

      <div className="col gap-12">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span className="h-title" style={{ fontSize: 16 }}>Quick Actions</span>
          <span className="label-eyebrow">SWIPE →</span>
        </div>
        <QuickActionsRow activeId={qa} onPick={(id) => set({ qa: qa === id ? null : id })} />
      </div>

      <div className="card card-gold fade-up fade-up-1">
        <div className="sec-head">
          <div className="col gap-4">
            <span className="h-title" style={{ fontSize: 15 }}>Recent Spending</span>
            <span className="tiny text-mute">Last 7 months</span>
          </div>
          <button className="more">Chart <IcChevron size={11}/></button>
        </div>
        <BarChart data={DATA.bars} activeIdx={barIdx}
          onPick={(i) => set({ barIdx: i })}
          height={100} barW={20} />
        <div className="divider" style={{ margin: '12px 0 8px' }}/>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span className="tiny text-mute">{DATA.bars[barIdx].label} · spending</span>
          <span className="small text-gold fw-600">${DATA.bars[barIdx].value.toLocaleString('en-US')}</span>
        </div>
      </div>

      <div className="card fade-up fade-up-2">
        <div className="sec-head">
          <span className="h-title" style={{ fontSize: 15 }}>Budget Overview</span>
          <button className="more">Details <IcChevron size={11}/></button>
        </div>
        <div className="col gap-12">
          {[
            { label: 'Essentials', used: 1840, cap: 2400 },
            { label: 'Lifestyle',  used: 680, cap: 1200 },
            { label: 'Investments',used: 1820, cap: 2000 },
          ].map(b => {
            const pct = Math.min(100, (b.used / b.cap) * 100);
            return (
              <div key={b.label} className="col gap-4">
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <span className="small fw-500">{b.label}</span>
                  <span className="tiny text-mute">
                    <span className="text-dim">${b.used.toLocaleString('en-US')}</span> / ${b.cap.toLocaleString('en-US')}
                  </span>
                </div>
                <div style={{ height: 5, background: 'rgba(255,255,255,0.04)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    width: `${pct}%`, height: '100%',
                    background: 'linear-gradient(90deg, var(--gold-deep), var(--gold))',
                    boxShadow: '0 0 6px var(--gold-shadow)',
                  }}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card fade-up fade-up-3">
        <div className="sec-head">
          <span className="h-title" style={{ fontSize: 15 }}>Savings Progress</span>
          <button className="more"><IcChevron size={11}/></button>
        </div>
        <div className="col gap-12">
          {DATA.goals.slice(0, 2).map(g => {
            const pct = (g.saved / g.target) * 100;
            return (
              <div key={g.id} className="col gap-4">
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <span className="small fw-500">{g.emoji} {g.name}</span>
                  <span className="tiny text-gold">{Math.round(pct)}%</span>
                </div>
                <div style={{ height: 5, background: 'rgba(255,255,255,0.04)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    width: `${pct}%`, height: '100%',
                    background: 'linear-gradient(90deg, var(--gold-deep), var(--gold-bright))',
                  }}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card fade-up fade-up-4">
        <div className="sec-head">
          <span className="h-title" style={{ fontSize: 15 }}>Recent Activity</span>
          <button className="more">All <IcChevron size={11}/></button>
        </div>
        <div className="col">
          {DATA.transactions.slice(0, 4).map((tx, i) => (
            <React.Fragment key={i}>
              <TxRow tx={tx} compact/>
              {i < 3 && <div className="divider"/>}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={{ height: 90 }}/>{/* bottom nav clearance */}
    </div>
  );
}

// ───────────────────────────────────────────────
// Mobile · Payment Methods
// ───────────────────────────────────────────────
function MobCards({ shared, set }) {
  const { activeCardId, flippedId } = shared;
  return (
    <div className="col gap-16" style={{ padding: '0 18px' }}>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="col gap-4">
          <span className="h-title" style={{ fontSize: 22 }}>Payment Methods</span>
          <span className="tiny text-mute">Tap a card to flip · {DATA.cards.length} cards</span>
        </div>
        <button className="eye-btn" style={{ width: 36, height: 36, color: 'var(--gold)' }}>
          <IcPlus size={16}/>
        </button>
      </div>

      <div className="col gap-16">
        {DATA.cards.map(c => (
          <div key={c.id} onClick={() => set({ activeCardId: c.id })}
            style={{ transform: activeCardId === c.id ? 'scale(1)' : 'scale(0.97)', transition: 'transform .25s' }}>
            <CreditCard card={c}
              flipped={flippedId === c.id}
              onFlip={() => set({ flippedId: flippedId === c.id ? null : c.id })}
              width={'100%'}
              height={200}
            />
          </div>
        ))}
      </div>

      <div className="card fade-up fade-up-1">
        <div className="sec-head">
          <span className="h-title" style={{ fontSize: 15 }}>Card Activity</span>
          <span className="chip is-gold">Live</span>
        </div>
        <div className="col">
          {DATA.transactions.slice(0, 3).map((tx, i) => (
            <React.Fragment key={i}>
              <TxRow tx={tx} compact/>
              {i < 2 && <div className="divider"/>}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={{ height: 90 }}/>
    </div>
  );
}

// ───────────────────────────────────────────────
// Mobile · Analytics
// ───────────────────────────────────────────────
function MobAnalytics({ shared, set }) {
  const { catIdx } = shared;
  const cat = catIdx != null ? DATA.categories[catIdx] : null;
  const totalSpent = DATA.categories.reduce((s, c) => s + c.value, 0);
  return (
    <div className="col gap-16" style={{ padding: '0 18px' }}>
      <div className="col gap-4">
        <span className="h-title" style={{ fontSize: 22 }}>Analytics</span>
        <span className="tiny text-mute">June 2026 · spending</span>
      </div>

      <div className="card card-gold" style={{ padding: 18 }}>
        <div className="sec-head">
          <span className="h-title" style={{ fontSize: 14 }}>By Category</span>
          <span className="chip">Tap to flip</span>
        </div>
        <div className="row" style={{ justifyContent: 'center' }}>
          <div className="flip-host" style={{ width: 240, height: 240 }}>
            <div className={"flip-inner" + (cat ? ' is-flipped' : '')}>
              <div className="flip-face">
                <Donut data={DATA.categories} size={240} total={totalSpent}
                  activeIdx={null}
                  onPick={(i) => set({ catIdx: i })}/>
              </div>
              <div className="flip-face back">
                {cat && (
                  <div className="card" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }} onClick={() => set({ catIdx: null })}>
                    <div className="col gap-8" style={{ alignItems: 'center' }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: `linear-gradient(135deg, ${cat.colorA}, ${cat.colorB})`,
                        display: 'grid', placeItems: 'center',
                        boxShadow: '0 0 18px var(--gold-shadow)',
                      }}>
                        <cat.Ic size={22} stroke="#0a0a0a"/>
                      </div>
                      <span className="label-eyebrow">{cat.label.toUpperCase()}</span>
                      <span className="h-title" style={{ fontSize: 26 }}>${cat.value.toLocaleString('en-US')}</span>
                      <span className="tiny text-gold">{((cat.value/totalSpent)*100).toFixed(1)}% of spend</span>
                    </div>
                    <div className="divider" style={{ margin: '14px 0' }}/>
                    <div className="col gap-6">
                      <div className="row" style={{ justifyContent: 'space-between' }}>
                        <span className="tiny text-mute">Noir Reserve</span>
                        <span className="tiny text-dim">${Math.round(cat.value * 0.5)}</span>
                      </div>
                      <div className="row" style={{ justifyContent: 'space-between' }}>
                        <span className="tiny text-mute">Gold</span>
                        <span className="tiny text-dim">${Math.round(cat.value * 0.3)}</span>
                      </div>
                      <div className="row" style={{ justifyContent: 'space-between' }}>
                        <span className="tiny text-mute">Platinum</span>
                        <span className="tiny text-dim">${Math.round(cat.value * 0.2)}</span>
                      </div>
                    </div>
                    <div className="tiny text-gold" style={{ textAlign: 'center', marginTop: 12, letterSpacing: '0.1em' }}>
                      ← TAP TO RETURN
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col gap-8" style={{ marginTop: 16 }}>
          {DATA.categories.slice(0, 5).map((c, i) => (
            <button key={c.label}
              onClick={() => set({ catIdx: catIdx === i ? null : i })}
              style={{
                background: 'transparent', border: 0,
                padding: '8px 4px', cursor: 'pointer',
                borderRadius: 8, textAlign: 'left',
                outline: catIdx === i ? '1px solid var(--line-strong)' : 'none',
              }}>
              <div className="row gap-12">
                <span style={{
                  width: 8, height: 8, borderRadius: 2,
                  background: `linear-gradient(135deg, ${c.colorA}, ${c.colorB})`,
                }}/>
                <span className="small" style={{ flex: 1, color: 'var(--ivory)' }}>{c.label}</span>
                <span className="tiny text-mute">${c.value.toLocaleString('en-US')}</span>
                <span className="tiny text-gold" style={{ width: 36, textAlign: 'right' }}>{c.pct}%</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="sec-head">
          <span className="h-title" style={{ fontSize: 14 }}>12-Month Trend</span>
          <button className="more">Export</button>
        </div>
        <AreaChart data={DATA.trends} w={320} h={150} padding={20}
          highlightIdx={shared.trendIdx}
          onPick={(i) => set({ trendIdx: i })}/>
      </div>

      <div style={{ height: 90 }}/>
    </div>
  );
}

// ───────────────────────────────────────────────
// Mobile · Savings Goals
// ───────────────────────────────────────────────
function MobGoals({ shared, set }) {
  return (
    <div className="col gap-16" style={{ padding: '0 18px' }}>
      <div className="col gap-4">
        <span className="h-title" style={{ fontSize: 22 }}>Savings Goals</span>
        <span className="tiny text-mute">{DATA.goals.length} active · ${DATA.goals.reduce((s,g)=>s+g.saved,0).toLocaleString('en-US')} saved</span>
      </div>

      <div className="card card-gold" style={{ padding: 20 }}>
        <SavingsTank goal={DATA.goals[shared.goalIdx]}
          animate
          size={200}
          onContribute={() => set({ contribute: DATA.goals[shared.goalIdx].id })}/>
      </div>

      <div className="row gap-8 scroll-x" style={{ padding: '4px 0' }}>
        {DATA.goals.map((g, i) => (
          <button key={g.id}
            onClick={() => set({ goalIdx: i })}
            style={{
              flexShrink: 0,
              padding: '10px 14px',
              borderRadius: 12,
              border: '1px solid ' + (shared.goalIdx === i ? 'var(--line-strong)' : 'var(--line-soft)'),
              background: shared.goalIdx === i ? 'rgba(230,198,135,0.06)' : 'var(--surface)',
              color: shared.goalIdx === i ? 'var(--gold)' : 'var(--ivory-dim)',
              cursor: 'pointer',
              minWidth: 110,
              textAlign: 'left',
            }}>
            <div className="tiny" style={{ marginBottom: 2 }}>{g.emoji}</div>
            <div className="small fw-600">{g.name}</div>
            <div className="tiny text-mute" style={{ marginTop: 4 }}>
              {Math.round((g.saved/g.target)*100)}%
            </div>
          </button>
        ))}
      </div>

      <div className="card">
        <div className="sec-head">
          <span className="h-title" style={{ fontSize: 14 }}>All Vessels</span>
          <button className="more"><IcPlus size={11}/> New</button>
        </div>
        <div className="col gap-16">
          {DATA.goals.map(g => {
            const pct = (g.saved / g.target) * 100;
            return (
              <div key={g.id} className="col gap-6">
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <span className="small fw-500">{g.emoji} {g.name}</span>
                  <span className="tiny text-gold fw-600">{Math.round(pct)}%</span>
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    width: `${pct}%`, height: '100%',
                    background: 'linear-gradient(90deg, var(--gold-deep), var(--gold-bright))',
                    boxShadow: '0 0 8px var(--gold-shadow)',
                  }}/>
                </div>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <span className="tiny text-mute">${g.saved.toLocaleString('en-US')} / ${g.target.toLocaleString('en-US')}</span>
                  <span className="tiny text-mute">{g.eta}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ height: 90 }}/>
    </div>
  );
}

// ───────────────────────────────────────────────
// Mobile · Lumis AI
// ───────────────────────────────────────────────
function MobAI({ shared, set }) {
  const { messages, draft, thinking } = shared;
  const listRef = React.useRef();
  React.useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, thinking]);

  const send = () => {
    if (!draft.trim()) return;
    const userMsg = { role: 'user', text: draft };
    set({ messages: [...messages, userMsg], draft: '', thinking: true });
    setTimeout(() => {
      const reply = aiReply(draft);
      set(prev => ({ messages: [...prev.messages, { role: 'ai', text: reply }], thinking: false }));
    }, 1100);
  };

  const presets = [
    "What can I cut this month?",
    "Move surplus to Kyoto",
    "Forecast Dec balance",
  ];

  return (
    <div className="col" style={{ padding: '0 18px', height: '100%' }}>
      <div className="row gap-12" style={{ marginBottom: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: 'radial-gradient(circle at 30% 30%, var(--gold-bright), var(--gold-deep) 80%)',
          display: 'grid', placeItems: 'center',
          boxShadow: '0 0 16px var(--gold-glow)',
        }}>
          <IcSparkle size={20} stroke="#0a0a0a"/>
        </div>
        <div className="col gap-4">
          <span className="h-title" style={{ fontSize: 18 }}>Lumis AI</span>
          <span className="tiny text-mute">
            <span className="text-pos">●</span> Online · Reasoning model
          </span>
        </div>
      </div>

      <div ref={listRef} className="col gap-12 scroll-y" style={{ flex: 1, overflowY: 'auto', paddingRight: 4, paddingBottom: 8 }}>
        {messages.map((m, i) => (
          <div key={i} className={"chat-bubble " + m.role} dangerouslySetInnerHTML={{ __html: formatMsg(m.text) }}/>
        ))}
        {thinking && (
          <div className="chat-bubble ai">
            <span className="typing-dot"/><span className="typing-dot"/><span className="typing-dot"/>
          </div>
        )}
      </div>

      <div className="row gap-8 scroll-x" style={{ padding: '12px 0' }}>
        {presets.map(p => (
          <button key={p}
            onClick={() => set({ draft: p })}
            style={{
              flexShrink: 0,
              padding: '7px 12px', borderRadius: 999,
              border: '1px solid var(--line)', background: 'rgba(230,198,135,0.04)',
              color: 'var(--ivory-dim)', fontSize: 11, cursor: 'pointer',
            }}>{p}</button>
        ))}
      </div>

      <div className="row gap-8" style={{ marginBottom: 100 }}>
        <input
          value={draft}
          onChange={(e) => set({ draft: e.target.value })}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Ask anything about your money…"
          style={{
            flex: 1,
            background: 'var(--surface-2)',
            border: '1px solid var(--line)',
            borderRadius: 999,
            padding: '12px 16px',
            color: 'var(--ivory)',
            fontFamily: 'inherit',
            fontSize: 13,
            outline: 'none',
          }}/>
        <button onClick={send}
          style={{
            width: 42, height: 42, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--gold-bright), var(--gold-deep))',
            border: 0, color: '#0a0a0a',
            display: 'grid', placeItems: 'center',
            cursor: 'pointer',
            boxShadow: '0 0 18px var(--gold-glow)',
          }}>
          <IcSend size={16}/>
        </button>
      </div>
    </div>
  );
}

function formatMsg(text) {
  // markdown-lite: **bold** and $X amounts
  return text
    .replace(/\*\*(.+?)\*\*/g, '<span class="accent">$1</span>')
    .replace(/\$([0-9,]+(?:\.[0-9]+)?)/g, '<span class="accent">$$$1</span>');
}

function aiReply(q) {
  const lower = q.toLowerCase();
  if (lower.includes('cut') || lower.includes('save'))
    return "Three quiet wins: **Spotify Family** ($16.99) — you haven't streamed in 14 days. **DoorDash credits** ($240/mo unused). Trimming both saves ~$257/mo, or **$3,084/yr** routed to Kyoto.";
  if (lower.includes('kyoto') || lower.includes('move'))
    return "Moving $1,840 surplus to **Kyoto Sabbatical** — that puts you at **72%**, ahead of schedule by 3 weeks. Want me to also automate $400/mo from here forward?";
  if (lower.includes('forecast') || lower.includes('december') || lower.includes('dec'))
    return "Projected Dec 31 net worth: **$24,180** (±$820). That's +$5,730 from today — driven by recurring savings + 4% return on Equiting position. Recession scenario: $21,400.";
  if (lower.includes('kyoto'))
    return "**Kyoto Sabbatical**: $6,800 of $12,000. On track for Sep 2026 at current pace ($425/mo). Add $200 to finish a month early.";
  return "I can read your accounts, forecast cash, find subscriptions, and route surplus to goals. Try: \"What did I spend on dining this month?\" or \"Plan a Kyoto trip\".";
}

Object.assign(window, {
  MobDashboard, MobCards, MobAnalytics, MobGoals, MobAI, formatMsg, aiReply,
});
