// screens-desktop.jsx — five desktop screens for Lumis. Uses DATA from screens-mobile.

// ───────────────────────────────────────────────
// Desktop · Dashboard
// ───────────────────────────────────────────────
function DeskDashboard({ shared, set }) {
  const DATA = window.LUMIS_DATA;
  const { hidden, qa, barIdx, trendIdx } = shared;
  const cat = shared.catIdx != null ? DATA.categories[shared.catIdx] : null;

  return (
    <div className="col gap-16" style={{ padding: '20px 28px', height: '100%', overflowY: 'auto' }} >
      {/* topline */}
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="col gap-4">
          <span className="label-eyebrow">DASHBOARD</span>
          <span className="h-title" style={{ fontSize: 24, lineHeight: 1.2 }}>Good morning, Alex</span>
        </div>
        <div className="row gap-8">
          <div className="chip"><IcSearch size={11}/> Search ⌘K</div>
          <button className="eye-btn" style={{ width: 32, height: 32 }}><IcBell size={13}/></button>
          <button className="eye-btn" style={{ width: 32, height: 32 }}><IcSettings size={13}/></button>
        </div>
      </div>

      <div className="row gap-16" style={{ alignItems: 'stretch' }}>
        <div style={{ flex: '1 1 360px', minWidth: 320 }}>
          <BalanceCard value={DATA.balance} hidden={hidden}
            onToggle={() => set({ hidden: !hidden })}
            delta={DATA.delta}
            label="Primary Balance" sub="Total Net Worth · across 4 accounts"
            big/>
        </div>
        <div className="card" style={{ flex: '1 1 220px', minWidth: 200 }}>
          <div className="label-eyebrow">JUNE INCOME</div>
          <Money value={9400} size={28} hidden={hidden}/>
          <span className="chip is-positive" style={{ marginTop: 8 }}><IcArrowUp size={11}/> 4.1%</span>
        </div>
        <div className="card" style={{ flex: '1 1 220px', minWidth: 200 }}>
          <div className="label-eyebrow">JUNE OUTFLOW</div>
          <Money value={4202.41} size={28} hidden={hidden}/>
          <span className="chip is-negative" style={{ marginTop: 8 }}><IcArrowDown size={11}/> 8.4% vs avg</span>
        </div>
      </div>

      <div className="col gap-12">
        <span className="h-title" style={{ fontSize: 15 }}>Quick Actions</span>
        <QuickActionsRow activeId={qa} onPick={(id) => set({ qa: qa === id ? null : id })}
          ringSize={56}/>
      </div>

      <div className="row gap-16" style={{ alignItems: 'stretch' }}>
        <div className="card card-gold" style={{ flex: 2 }}>
          <div className="sec-head">
            <div className="col gap-4">
              <span className="h-title" style={{ fontSize: 16 }}>Spending Trends</span>
              <span className="tiny text-mute">12-month rolling</span>
            </div>
            <div className="row gap-8">
              <span className="chip is-gold">Interactive</span>
              <button className="more">Export <IcChevron size={11}/></button>
            </div>
          </div>
          <AreaChart data={DATA.trends} w={560} h={200} padding={28}
            highlightIdx={trendIdx}
            onPick={(i) => set({ trendIdx: i })}/>
        </div>
        <div className="card" style={{ flex: 1, minWidth: 240 }}>
          <div className="sec-head">
            <span className="h-title" style={{ fontSize: 14 }}>By Category</span>
            <span className="chip">{cat ? cat.label : 'Hover →'}</span>
          </div>
          <div className="row" style={{ justifyContent: 'center' }}>
            <Donut data={DATA.categories} size={190}
              activeIdx={shared.catIdx}
              onPick={(i) => set({ catIdx: i })}
              total={DATA.categories.reduce((s,c)=>s+c.value,0)}/>
          </div>
        </div>
      </div>

      <div className="row gap-16" style={{ alignItems: 'stretch' }}>
        <div className="card" style={{ flex: 1 }}>
          <div className="sec-head">
            <span className="h-title" style={{ fontSize: 14 }}>Account Summary</span>
            <button className="more">All</button>
          </div>
          <div className="col gap-10">
            {[
              { name: 'Checking · Lumière',    type: 'Operating', value: 8420.50, Ic: IcWallet },
              { name: 'High-Yield Savings',    type: '4.8% APY',  value: 6800.00, Ic: IcShield },
              { name: 'Equiting · Brokerage',  type: 'Invested',  value: 3230.22, Ic: IcBolt },
              { name: 'Lumis Vault',           type: 'Reserve',   value: 14000.00,Ic: IcLock },
            ].map((a, i) => (
              <div key={i} className="row" style={{ justifyContent: 'space-between' }}>
                <div className="row gap-12">
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: 'var(--surface-2)', border: '1px solid var(--line-soft)',
                    color: 'var(--gold)', display: 'grid', placeItems: 'center',
                  }}><a.Ic size={13}/></div>
                  <div className="col">
                    <span className="small fw-500">{a.name}</span>
                    <span className="tiny text-mute">{a.type}</span>
                  </div>
                </div>
                <span className="small fw-600">${a.value.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
              </div>
            ))}
            <div className="divider" style={{ margin: '4px 0' }}/>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span className="small fw-600">Total</span>
              <span className="text-gold fw-600" style={{ fontFamily: 'Marcellus', fontSize: 18 }}>$32,450.72</span>
            </div>
          </div>
        </div>

        <div className="card" style={{ flex: 1 }}>
          <div className="sec-head">
            <span className="h-title" style={{ fontSize: 14 }}>Upcoming Bills</span>
            <span className="chip is-gold">{DATA.upcoming.length}</span>
          </div>
          <div className="col gap-10">
            {DATA.upcoming.map((b, i) => (
              <div key={i} className="row" style={{ justifyContent: 'space-between' }}>
                <div className="row gap-12">
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: 'var(--surface-2)', border: '1px solid var(--line-soft)',
                    color: 'var(--gold)', display: 'grid', placeItems: 'center',
                  }}><IcReceipt size={13}/></div>
                  <div className="col">
                    <span className="small fw-500">{b.name}</span>
                    <span className="tiny text-mute">{b.date} · {b.tag}</span>
                  </div>
                </div>
                <span className="small fw-600">${b.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ flex: 1.2 }}>
          <div className="sec-head">
            <span className="h-title" style={{ fontSize: 14 }}>Goals at a Glance</span>
            <button className="more">View all</button>
          </div>
          <div className="col gap-12">
            {DATA.goals.slice(0, 3).map(g => {
              const pct = (g.saved / g.target) * 100;
              return (
                <div key={g.id} className="col gap-4">
                  <div className="row" style={{ justifyContent: 'space-between' }}>
                    <span className="small fw-500">{g.emoji} {g.name}</span>
                    <span className="tiny text-gold fw-600">{Math.round(pct)}%</span>
                  </div>
                  <div style={{ height: 5, background: 'rgba(255,255,255,0.04)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      width: `${pct}%`, height: '100%',
                      background: 'linear-gradient(90deg, var(--gold-deep), var(--gold-bright))',
                    }}/>
                  </div>
                  <div className="row" style={{ justifyContent: 'space-between' }}>
                    <span className="tiny text-mute">${g.saved.toLocaleString('en-US')} / ${g.target.toLocaleString('en-US')}</span>
                    <span className="tiny text-mute">{g.eta.split('·')[0].trim()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────
// Desktop · Payment Methods
// ───────────────────────────────────────────────
function DeskCards({ shared, set }) {
  const DATA = window.LUMIS_DATA;
  const { activeCardId, flippedId } = shared;
  const active = DATA.cards.find(c => c.id === activeCardId) || DATA.cards[0];

  return (
    <div className="col gap-20" style={{ padding: '20px 28px', height: '100%', overflowY: 'auto' }}>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div className="col gap-4">
          <span className="label-eyebrow">PAYMENT METHODS</span>
          <span className="h-title" style={{ fontSize: 26 }}>Cards & Vaults</span>
        </div>
        <button className="chip is-gold" style={{ padding: '6px 14px', height: 34, cursor: 'pointer' }}>
          <IcPlus size={12}/> Add Card
        </button>
      </div>

      <div className="row gap-20" style={{ alignItems: 'flex-start' }}>
        <div className="col gap-16" style={{ flex: '0 0 360px' }}>
          <CreditCard card={active}
            flipped={flippedId === active.id}
            onFlip={() => set({ flippedId: flippedId === active.id ? null : active.id })}
            width={360} height={220}/>
          <div className="card">
            <div className="label-eyebrow" style={{ marginBottom: 8 }}>CARD CONTROLS</div>
            {[
              { l: 'Card status',          v: 'Active', tone: 'positive' },
              { l: 'International',        v: 'Allowed' },
              { l: 'Contactless',          v: 'Enabled' },
              { l: 'Online purchases',     v: 'Enabled' },
              { l: 'Cash advance',         v: 'Blocked', tone: 'negative' },
            ].map((r, i) => (
              <div key={i} className="row" style={{ justifyContent: 'space-between', padding: '7px 0' }}>
                <span className="small text-dim">{r.l}</span>
                <span className={"chip " + (r.tone === 'positive' ? 'is-positive' : r.tone === 'negative' ? 'is-negative' : 'is-gold')}>
                  {r.v}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="col gap-16" style={{ flex: 1 }}>
          <div className="card">
            <div className="sec-head">
              <span className="h-title" style={{ fontSize: 14 }}>All Cards</span>
              <span className="tiny text-mute">Click to focus · Click card to flip</span>
            </div>
            <div className="col gap-10">
              {DATA.cards.map(c => (
                <button key={c.id}
                  onClick={() => set({ activeCardId: c.id })}
                  style={{
                    background: activeCardId === c.id ? 'rgba(230,198,135,0.06)' : 'transparent',
                    border: '1px solid ' + (activeCardId === c.id ? 'var(--line-strong)' : 'var(--line-soft)'),
                    borderRadius: 12,
                    padding: '12px 14px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background .15s, border-color .15s',
                  }}>
                  <div className="row" style={{ justifyContent: 'space-between' }}>
                    <div className="row gap-12">
                      <div style={{
                        width: 42, height: 28, borderRadius: 4,
                        background: c.variant === 'noir' ? 'linear-gradient(135deg, #1a1a1a, #050506)' :
                                   c.variant === 'platinum' ? 'linear-gradient(135deg, #2a2c30, #15171b)' :
                                   'linear-gradient(135deg, #2a221a, #100c08)',
                        border: '1px solid var(--line)',
                      }}/>
                      <div className="col">
                        <span className="small fw-600">{c.name}</span>
                        <span className="tiny text-mute" style={{ fontFamily: 'JetBrains Mono' }}>•••• {c.number.slice(-4)} · exp {c.expiry}</span>
                      </div>
                    </div>
                    <div className="col" style={{ alignItems: 'flex-end' }}>
                      <span className="small fw-600 text-gold">${(c.limit - c.used).toLocaleString('en-US')}</span>
                      <span className="tiny text-mute">available of ${c.limit.toLocaleString('en-US')}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="sec-head">
              <span className="h-title" style={{ fontSize: 14 }}>Card Activity · {active.name}</span>
              <button className="more">All <IcChevron size={11}/></button>
            </div>
            <div className="col">
              {DATA.transactions.slice(0, 5).map((tx, i) => (
                <React.Fragment key={i}>
                  <TxRow tx={tx}/>
                  {i < 4 && <div className="divider"/>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────
// Desktop · Analytics
// ───────────────────────────────────────────────
function DeskAnalytics({ shared, set }) {
  const DATA = window.LUMIS_DATA;
  const { catIdx, trendIdx } = shared;
  const cat = catIdx != null ? DATA.categories[catIdx] : null;
  const total = DATA.categories.reduce((s, c) => s + c.value, 0);
  return (
    <div className="col gap-20" style={{ padding: '20px 28px', height: '100%', overflowY: 'auto' }}>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div className="col gap-4">
          <span className="label-eyebrow">ANALYTICS</span>
          <span className="h-title" style={{ fontSize: 26 }}>Spending Intelligence</span>
        </div>
        <div className="row gap-8">
          <button className="chip is-gold" style={{ padding: '6px 12px', height: 30, cursor: 'pointer' }}>June 2026 <IcChevronDown size={11}/></button>
          <button className="chip" style={{ padding: '6px 12px', height: 30, cursor: 'pointer' }}>Compare</button>
        </div>
      </div>

      <div className="row gap-16" style={{ alignItems: 'stretch' }}>
        {[
          { l: 'TOTAL SPEND', v: total, sub: '−8.4% vs avg', tone: 'positive' },
          { l: 'TXNS',        v: 124,   sub: '+12 vs avg',   tone: 'gold' },
          { l: 'AVG TICKET',  v: 38.65, sub: 'flat',         tone: 'gold' },
          { l: 'SAVINGS RATE', v: 0.42,  sub: '+4 pts',       tone: 'positive', fmt: 'pct' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ flex: 1 }}>
            <div className="label-eyebrow">{s.l}</div>
            <div className="h-title" style={{ fontSize: 26, marginTop: 4 }}>
              {s.fmt === 'pct' ? `${(s.v * 100).toFixed(0)}%` :
               s.l === 'TXNS' ? s.v : `$${s.v.toLocaleString('en-US', {minimumFractionDigits: s.v < 1000 ? 2 : 0})}`}
            </div>
            <span className={"chip " + (s.tone === 'positive' ? 'is-positive' : 'is-gold')} style={{ marginTop: 6 }}>
              {s.sub}
            </span>
          </div>
        ))}
      </div>

      <div className="row gap-16" style={{ alignItems: 'stretch' }}>
        <div className="card card-gold" style={{ flex: 1 }}>
          <div className="sec-head">
            <div className="col gap-4">
              <span className="h-title" style={{ fontSize: 16 }}>By Category</span>
              <span className="tiny text-mute">Hover slices or click for breakdown</span>
            </div>
            <span className="chip is-gold">{cat ? cat.label : 'all categories'}</span>
          </div>
          <div className="row gap-20" style={{ alignItems: 'center' }}>
            <Donut data={DATA.categories} size={250}
              activeIdx={catIdx}
              onPick={(i) => set({ catIdx: i })}
              total={total}/>
            <div className="col gap-6" style={{ flex: 1 }}>
              {DATA.categories.map((c, i) => (
                <button key={c.label}
                  onClick={() => set({ catIdx: catIdx === i ? null : i })}
                  style={{
                    background: catIdx === i ? 'rgba(230,198,135,0.06)' : 'transparent',
                    border: '1px solid ' + (catIdx === i ? 'var(--line-strong)' : 'transparent'),
                    borderRadius: 8,
                    padding: '7px 10px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}>
                  <div className="row gap-12">
                    <span style={{
                      width: 10, height: 10, borderRadius: 3,
                      background: `linear-gradient(135deg, ${c.colorA}, ${c.colorB})`,
                    }}/>
                    <span className="small" style={{ flex: 1, color: catIdx === i ? 'var(--gold)' : 'var(--ivory)' }}>{c.label}</span>
                    <span className="tiny text-mute">${c.value.toLocaleString('en-US')}</span>
                    <span className="tiny text-gold" style={{ width: 36, textAlign: 'right' }}>{c.pct}%</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="card" style={{ flex: 1 }}>
          <div className="sec-head">
            <span className="h-title" style={{ fontSize: 16 }}>Monthly Cadence</span>
            <button className="more">Trend</button>
          </div>
          <BarChart data={DATA.bars} activeIdx={shared.barIdx}
            onPick={(i) => set({ barIdx: i })}
            height={150} barW={28}/>
          <div className="divider" style={{ margin: '16px 0' }}/>
          <div className="col gap-8">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span className="tiny text-mute">{DATA.bars[shared.barIdx].label} · total</span>
              <span className="small text-gold fw-600">${DATA.bars[shared.barIdx].value.toLocaleString('en-US')}</span>
            </div>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span className="tiny text-mute">avg per day</span>
              <span className="small text-dim">${(DATA.bars[shared.barIdx].value / 30).toFixed(2)}</span>
            </div>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span className="tiny text-mute">vs prior month</span>
              <span className="small text-pos">−6.2%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="sec-head">
          <span className="h-title" style={{ fontSize: 16 }}>12-Month Spending</span>
          <button className="more">Export CSV</button>
        </div>
        <AreaChart data={DATA.trends} w={960} h={220} padding={32}
          highlightIdx={trendIdx}
          onPick={(i) => set({ trendIdx: i })}/>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────
// Desktop · Savings Goals
// ───────────────────────────────────────────────
function DeskGoals({ shared, set }) {
  const DATA = window.LUMIS_DATA;
  const totalSaved = DATA.goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = DATA.goals.reduce((s, g) => s + g.target, 0);
  return (
    <div className="col gap-20" style={{ padding: '20px 28px', height: '100%', overflowY: 'auto' }}>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div className="col gap-4">
          <span className="label-eyebrow">SAVINGS GOALS</span>
          <span className="h-title" style={{ fontSize: 26 }}>Vessels & Reserves</span>
        </div>
        <button className="chip is-gold" style={{ padding: '6px 14px', height: 34, cursor: 'pointer' }}>
          <IcPlus size={12}/> New Vessel
        </button>
      </div>

      <div className="row gap-16">
        <div className="card" style={{ flex: 1 }}>
          <div className="label-eyebrow">TOTAL ALLOCATED</div>
          <Money value={totalSaved} size={28}/>
          <span className="chip is-gold" style={{ marginTop: 6 }}>
            {Math.round((totalSaved/totalTarget)*100)}% of ${totalTarget.toLocaleString('en-US')}
          </span>
        </div>
        <div className="card" style={{ flex: 1 }}>
          <div className="label-eyebrow">MONTHLY AUTO-DEPOSIT</div>
          <Money value={1850} size={28}/>
          <span className="chip is-positive" style={{ marginTop: 6 }}>4 active rules</span>
        </div>
        <div className="card" style={{ flex: 1 }}>
          <div className="label-eyebrow">PROJECTED YEAR-END</div>
          <Money value={106200} size={28}/>
          <span className="chip is-positive" style={{ marginTop: 6 }}>+$58,720 added</span>
        </div>
      </div>

      <div className="row gap-20" style={{ flexWrap: 'wrap', justifyContent: 'flex-start' }}>
        {DATA.goals.map(g => (
          <div key={g.id} className="card card-gold" style={{ flex: '1 1 220px', padding: 20 }}>
            <SavingsTank goal={g} animate size={170}
              onContribute={() => set({ contribute: g.id })}/>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="sec-head">
          <span className="h-title" style={{ fontSize: 16 }}>Auto-Deposit Rules</span>
          <button className="more">+ Add Rule</button>
        </div>
        <div className="col gap-10">
          {[
            { from: 'Salary · Lumière Co.', to: 'Kyoto Sabbatical', amt: 425, when: 'on payday' },
            { from: 'Checking',              to: 'Vintage 911',     amt: 600, when: '1st of month' },
            { from: 'Round-ups',             to: 'Down Payment',    amt: 'variable', when: 'per txn' },
            { from: 'Salary · Lumière Co.', to: 'Safety Reserve',  amt: 200, when: 'on payday' },
          ].map((r, i) => (
            <div key={i} className="row" style={{ justifyContent: 'space-between', padding: '6px 0' }}>
              <div className="row gap-12">
                <span className="small text-dim">{r.from}</span>
                <IcArrowRight size={12} stroke="var(--gold)"/>
                <span className="small fw-500">{r.to}</span>
              </div>
              <div className="row gap-16">
                <span className="tiny text-mute">{r.when}</span>
                <span className="small text-gold fw-600">
                  {typeof r.amt === 'number' ? `$${r.amt}` : r.amt}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────
// Desktop · Lumis AI
// ───────────────────────────────────────────────
function DeskAI({ shared, set }) {
  const DATA = window.LUMIS_DATA;
  const { messages, draft, thinking } = shared;
  const listRef = React.useRef();
  React.useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, thinking]);

  const send = () => {
    if (!draft.trim()) return;
    set({ messages: [...messages, { role: 'user', text: draft }], draft: '', thinking: true });
    setTimeout(() => {
      const reply = aiReply(draft);
      set(prev => ({ messages: [...prev.messages, { role: 'ai', text: reply }], thinking: false }));
    }, 1100);
  };

  return (
    <div className="row" style={{ height: '100%' }}>
      <div className="col" style={{ flex: 1, padding: '20px 28px' }}>
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 16 }}>
          <div className="row gap-12">
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: 'radial-gradient(circle at 30% 30%, var(--gold-bright), var(--gold-deep) 80%)',
              display: 'grid', placeItems: 'center',
              boxShadow: '0 0 20px var(--gold-glow)',
            }}>
              <IcSparkle size={22} stroke="#0a0a0a"/>
            </div>
            <div className="col gap-4">
              <span className="h-title" style={{ fontSize: 20 }}>Lumis AI</span>
              <span className="tiny text-mute"><span className="text-pos">●</span> Reasoning model · Reading 4 accounts</span>
            </div>
          </div>
          <div className="row gap-8">
            <button className="chip">New thread</button>
            <button className="chip">History</button>
          </div>
        </div>

        <div ref={listRef} className="col gap-12 scroll-y" style={{ flex: 1, overflowY: 'auto', paddingRight: 8 }}>
          {messages.map((m, i) => (
            <div key={i} className={"chat-bubble " + m.role} dangerouslySetInnerHTML={{ __html: formatMsg(m.text) }}/>
          ))}
          {thinking && (
            <div className="chat-bubble ai">
              <span className="typing-dot"/><span className="typing-dot"/><span className="typing-dot"/>
            </div>
          )}
        </div>

        <div className="row gap-8" style={{ padding: '12px 0' }}>
          {["What can I cut this month?", "Move surplus to Kyoto", "Forecast Dec balance", "Plan Kyoto trip", "Find duplicate subs"].map(p => (
            <button key={p} onClick={() => set({ draft: p })}
              style={{
                padding: '7px 12px', borderRadius: 999,
                border: '1px solid var(--line)', background: 'rgba(230,198,135,0.04)',
                color: 'var(--ivory-dim)', fontSize: 11, cursor: 'pointer',
              }}>{p}</button>
          ))}
        </div>

        <div className="row gap-8">
          <input
            value={draft}
            onChange={(e) => set({ draft: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Ask Lumis AI anything about your money…"
            style={{
              flex: 1,
              background: 'var(--surface-2)',
              border: '1px solid var(--line)',
              borderRadius: 999,
              padding: '14px 20px',
              color: 'var(--ivory)',
              fontFamily: 'inherit',
              fontSize: 14,
              outline: 'none',
            }}/>
          <button onClick={send}
            style={{
              width: 46, height: 46, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--gold-bright), var(--gold-deep))',
              border: 0, color: '#0a0a0a',
              display: 'grid', placeItems: 'center',
              cursor: 'pointer',
              boxShadow: '0 0 18px var(--gold-glow)',
            }}>
            <IcSend size={18}/>
          </button>
        </div>
      </div>

      <div className="col gap-16" style={{
        width: 280, borderLeft: '1px solid var(--line-soft)',
        padding: '20px 20px', background: '#0a0b0d',
      }}>
        <span className="label-eyebrow">CONTEXT IN VIEW</span>
        <div className="card" style={{ padding: 12 }}>
          <div className="label-eyebrow" style={{ marginBottom: 6 }}>NET WORTH</div>
          <Money value={DATA.balance} size={22}/>
          <span className="chip is-positive" style={{ marginTop: 8 }}><IcArrowUp size={10}/> 2.4%</span>
        </div>
        <div className="card" style={{ padding: 12 }}>
          <div className="label-eyebrow" style={{ marginBottom: 8 }}>TOP GOAL</div>
          <div className="row gap-8" style={{ marginBottom: 6 }}>
            <span className="small fw-500">⬡ Down Payment</span>
            <span className="tiny text-gold" style={{ marginLeft: 'auto' }}>60%</span>
          </div>
          <div style={{ height: 5, background: 'rgba(255,255,255,0.04)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: '60%', height: '100%', background: 'linear-gradient(90deg, var(--gold-deep), var(--gold-bright))' }}/>
          </div>
        </div>
        <div className="card" style={{ padding: 12 }}>
          <div className="label-eyebrow" style={{ marginBottom: 6 }}>RECOMMENDED ACTIONS</div>
          <div className="col gap-6 mt-8">
            <div className="row gap-8"><IcCheck size={12} stroke="var(--gold)"/><span className="tiny text-dim">Cancel unused Spotify</span></div>
            <div className="row gap-8"><IcCheck size={12} stroke="var(--gold)"/><span className="tiny text-dim">Boost Kyoto by $200</span></div>
            <div className="row gap-8"><IcCheck size={12} stroke="var(--gold)"/><span className="tiny text-dim">Review Equiting risk</span></div>
          </div>
        </div>
        <div className="card" style={{ padding: 12 }}>
          <div className="label-eyebrow" style={{ marginBottom: 6 }}>PRIVACY</div>
          <span className="tiny text-mute">All processing is local-first. Conversations encrypted with your device key.</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  DeskDashboard, DeskCards, DeskAnalytics, DeskGoals, DeskAI,
});
