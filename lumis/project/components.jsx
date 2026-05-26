// components.jsx — shared UI for Lumis (balance card, quick actions, charts, cards, tanks, ai)
const { useState, useEffect, useRef, useMemo } = React;

// ─────────────────────────────────────────────
// Format helpers
// ─────────────────────────────────────────────
const fmtMoney = (n, withCents = true) => {
  const abs = Math.abs(n);
  const dollars = Math.floor(abs);
  const cents = Math.round((abs - dollars) * 100).toString().padStart(2, '0');
  const dStr = dollars.toLocaleString('en-US');
  return withCents ? { dollars: dStr, cents } : { dollars: dStr, cents: null };
};
const Money = ({ value, size = 32, hidden = false }) => {
  const { dollars, cents } = fmtMoney(value, true);
  return (
    <span className="num-display" style={{ fontSize: size }}>
      <span className="num-currency">$</span>
      {hidden ? '•••••' : <>{dollars}<span className="num-cents">.{cents}</span></>}
    </span>
  );
};

// ─────────────────────────────────────────────
// Balance card (glass)
// ─────────────────────────────────────────────
function BalanceCard({ value, hidden, onToggle, label = "Primary Balance", sub = "Total Net Worth", delta, big = false }) {
  return (
    <div className="card card-glass" style={{ borderRadius: 22, padding: big ? '22px 26px' : '18px 20px' }}>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="col gap-4">
          <div className="label-eyebrow">{label}</div>
          <Money value={value} size={big ? 44 : 36} hidden={hidden} />
          <div className="row gap-12" style={{ marginTop: 6 }}>
            <span className="tiny text-mute">{sub}</span>
            {delta != null && (
              <span className={"chip " + (delta >= 0 ? 'is-positive' : 'is-negative')}>
                {delta >= 0 ? <IcArrowUp size={11}/> : <IcArrowDown size={11}/>}
                {Math.abs(delta).toFixed(2)}%
              </span>
            )}
          </div>
        </div>
        <button className="eye-btn" onClick={onToggle} aria-label="Toggle balance privacy">
          {hidden ? <IcEyeOff size={14}/> : <IcEyeOn size={14}/>}
        </button>
      </div>
      <div className="row gap-4" style={{ justifyContent: 'center', marginTop: big ? 14 : 10 }}>
        <span style={{ width: 14, height: 4, borderRadius: 2, background: 'var(--gold)' }} />
        <span style={{ width: 4, height: 4, borderRadius: 2, background: 'rgba(230,198,135,0.3)' }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Quick actions
// ─────────────────────────────────────────────
const QUICK_ACTIONS = [
  { id: 'log',     label: 'Log Entry',    Ic: IcEdit },
  { id: 'receipt', label: 'Receipt Scan', Ic: IcReceipt },
  { id: 'voice',   label: 'Voice Note',   Ic: IcMic },
  { id: 'settle',  label: 'Settle Bill',  Ic: IcSplit },
  { id: 'goal',    label: 'Add Goal',     Ic: IcTarget },
];
function QuickActionsRow({ activeId, onPick, compact = false, ringSize = 56 }) {
  return (
    <div className="row gap-12 scroll-x" style={{ padding: '4px 2px' }}>
      {QUICK_ACTIONS.map(a => (
        <button key={a.id}
          className={"qa" + (activeId === a.id ? ' is-active' : '')}
          onClick={() => onPick && onPick(a.id)}
          style={{ minWidth: ringSize + 8 }}>
          <span className="ring" style={{ width: ringSize, height: ringSize }}>
            <a.Ic size={Math.round(ringSize * 0.38)} />
          </span>
          <span className="label" style={{ maxWidth: ringSize + 8 }}>{a.label}</span>
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Bar chart (monthly spending)
// ─────────────────────────────────────────────
function BarChart({ data, activeIdx, onPick, height = 110, barW = 22 }) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div className="row" style={{ alignItems: 'flex-end', gap: 10, height: height + 28, justifyContent: 'space-between' }}>
      {data.map((d, i) => {
        const h = (d.value / max) * height;
        return (
          <button key={d.label}
            onClick={() => onPick && onPick(i)}
            style={{
              background: 'transparent', border: 0, padding: 0, cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            }}>
            <span className={"bar" + (i === activeIdx ? ' is-active' : '')}
              style={{ width: barW, height: h }} />
            <span className="tiny" style={{
              color: i === activeIdx ? 'var(--gold)' : 'var(--ivory-mute)',
              fontWeight: i === activeIdx ? 600 : 400,
            }}>{d.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
// Line / area chart (spending trends)
// ─────────────────────────────────────────────
function AreaChart({ data, w = 520, h = 200, padding = 24, highlightIdx, onPick }) {
  const max = Math.max(...data.map(d => d.value)) * 1.1;
  const min = 0;
  const xStep = (w - padding * 2) / (data.length - 1);
  const yFor = v => h - padding - ((v - min) / (max - min)) * (h - padding * 2);
  const xFor = i => padding + i * xStep;
  // Smooth path via Catmull-Rom
  const pts = data.map((d, i) => [xFor(i), yFor(d.value)]);
  const path = pts.map((p, i) => {
    if (i === 0) return `M ${p[0]} ${p[1]}`;
    const prev = pts[i - 1];
    const cp1x = prev[0] + xStep / 2;
    const cp1y = prev[1];
    const cp2x = p[0] - xStep / 2;
    const cp2y = p[1];
    return `C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p[0]} ${p[1]}`;
  }).join(' ');
  const area = path + ` L ${xFor(data.length - 1)} ${h - padding} L ${padding} ${h - padding} Z`;

  // y grid lines
  const grid = [0.25, 0.5, 0.75, 1].map(t => h - padding - t * (h - padding * 2));

  const hi = highlightIdx != null ? data[highlightIdx] : null;
  const hx = highlightIdx != null ? xFor(highlightIdx) : null;
  const hy = highlightIdx != null ? yFor(hi.value) : null;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="lumis-area" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#e6c687" stopOpacity="0.32"/>
          <stop offset="100%" stopColor="#e6c687" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="lumis-line" x1="0" x2="1">
          <stop offset="0%" stopColor="#c9a961"/>
          <stop offset="50%" stopColor="#f3d99a"/>
          <stop offset="100%" stopColor="#c9a961"/>
        </linearGradient>
      </defs>
      {grid.map((y, i) => (
        <line key={i} x1={padding} x2={w - padding} y1={y} y2={y} stroke="rgba(245,239,224,0.05)" strokeDasharray="2 4"/>
      ))}
      <path d={area} fill="url(#lumis-area)"/>
      <path d={path} fill="none" stroke="url(#lumis-line)" strokeWidth="2"/>
      {data.map((d, i) => (
        <circle key={i} cx={xFor(i)} cy={yFor(d.value)} r="3"
          fill={i === highlightIdx ? '#f3d99a' : '#0c0d10'}
          stroke="#e6c687" strokeWidth="1.5"
          style={{ cursor: 'pointer' }}
          onMouseEnter={() => onPick && onPick(i)}
        />
      ))}
      {/* x labels */}
      {data.map((d, i) => (
        <text key={i} x={xFor(i)} y={h - 4}
          textAnchor="middle" fontSize="10" fontFamily="Manrope"
          fill={i === highlightIdx ? '#e6c687' : '#8a857a'}>{d.label}</text>
      ))}
      {/* y labels (left) */}
      {[0.25, 0.5, 0.75, 1].map((t, i) => {
        const v = max * t;
        return <text key={i} x={padding - 8} y={h - padding - t * (h - padding*2) + 3}
          textAnchor="end" fontSize="9" fontFamily="JetBrains Mono"
          fill="#5a564e">{Math.round(v)}</text>;
      })}
      {/* highlight */}
      {hi && (
        <g>
          <line x1={hx} x2={hx} y1={hy} y2={h - padding} stroke="#e6c687" strokeOpacity="0.3" strokeDasharray="2 3"/>
          <circle cx={hx} cy={hy} r="5" fill="#f3d99a" filter="url(#glow)"/>
          <g transform={`translate(${hx},${hy - 14})`}>
            <rect x="-40" y="-18" width="80" height="20" rx="6"
              fill="#16181c" stroke="rgba(230,198,135,0.4)"/>
            <text x="0" y="-4" textAnchor="middle" fontSize="10" fontFamily="JetBrains Mono"
              fill="#f5efe0" fontWeight="600">${hi.value.toLocaleString('en-US')}</text>
          </g>
        </g>
      )}
    </svg>
  );
}

// ─────────────────────────────────────────────
// Donut chart (categories)
// ─────────────────────────────────────────────
const polar = (cx, cy, r, deg) => {
  const rad = (deg - 90) * Math.PI / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
};
function arcPath(cx, cy, rOuter, rInner, start, end) {
  const [x1, y1] = polar(cx, cy, rOuter, end);
  const [x2, y2] = polar(cx, cy, rOuter, start);
  const [x3, y3] = polar(cx, cy, rInner, start);
  const [x4, y4] = polar(cx, cy, rInner, end);
  const large = end - start > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${rOuter} ${rOuter} 0 ${large} 0 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 ${large} 1 ${x4} ${y4} Z`;
}

function Donut({ data, size = 240, activeIdx, onPick, total }) {
  const cx = size / 2, cy = size / 2;
  const rOuter = size / 2 - 4;
  const rInner = rOuter - 36;
  const sum = data.reduce((s, d) => s + d.value, 0);
  let cursor = 0;
  const slices = data.map((d, i) => {
    const arc = (d.value / sum) * 360;
    const start = cursor;
    const end = cursor + arc - 1.5; // small gap
    cursor += arc;
    return { ...d, start, end, idx: i, pct: (d.value / sum * 100) };
  });
  const active = activeIdx != null ? slices[activeIdx] : null;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      <defs>
        {slices.map((s, i) => (
          <linearGradient key={i} id={`donut-${i}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={s.colorA}/>
            <stop offset="100%" stopColor={s.colorB}/>
          </linearGradient>
        ))}
        <radialGradient id="donut-center">
          <stop offset="0%" stopColor="#16181c" stopOpacity="0.95"/>
          <stop offset="100%" stopColor="#08090a" stopOpacity="0.95"/>
        </radialGradient>
      </defs>
      {slices.map((s, i) => (
        <path key={i}
          className={"donut-slice" + (activeIdx === i ? ' is-active' : '')}
          d={arcPath(cx, cy, rOuter, rInner, s.start, s.end)}
          fill={`url(#donut-${i})`}
          stroke="rgba(0,0,0,0.4)" strokeWidth="0.5"
          onClick={() => onPick && onPick(i)}
          onMouseEnter={() => onPick && onPick(i)}
        />
      ))}
      <circle cx={cx} cy={cy} r={rInner - 2} fill="url(#donut-center)"/>
      {active ? (
        <>
          <text x={cx} y={cy - 14} textAnchor="middle" fontSize="9" fontFamily="JetBrains Mono"
            fill="#8a857a" letterSpacing="2">{active.label.toUpperCase()}</text>
          <text x={cx} y={cy + 10} textAnchor="middle" fontSize="22" fontFamily="Marcellus"
            fill="#f5efe0">${active.value.toLocaleString('en-US')}</text>
          <text x={cx} y={cy + 28} textAnchor="middle" fontSize="11" fontFamily="Manrope"
            fill="#e6c687">{active.pct.toFixed(1)}%</text>
        </>
      ) : (
        <>
          <text x={cx} y={cy - 10} textAnchor="middle" fontSize="9" fontFamily="JetBrains Mono"
            fill="#8a857a" letterSpacing="2">TOTAL SPENT</text>
          <text x={cx} y={cy + 14} textAnchor="middle" fontSize="22" fontFamily="Marcellus"
            fill="#f5efe0">${(total ?? sum).toLocaleString('en-US')}</text>
          <text x={cx} y={cy + 30} textAnchor="middle" fontSize="10" fontFamily="Manrope"
            fill="#8a857a">this month</text>
        </>
      )}
    </svg>
  );
}

// ─────────────────────────────────────────────
// Credit card (front/back, flippable)
// ─────────────────────────────────────────────
function CreditCard({ card, flipped, onFlip, height = 200, width = 320 }) {
  const variantClass = 'cc ' + (card.variant === 'platinum' ? 'is-platinum' : card.variant === 'noir' ? 'is-noir' : '');
  return (
    <div className="flip-host" style={{ width, height, cursor: 'pointer' }} onClick={onFlip}>
      <div className={"flip-inner" + (flipped ? ' is-flipped' : '')}>
        <div className="flip-face">
          <div className={variantClass} style={{ width: '100%', height: '100%' }}>
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="col gap-4">
                <div className="label-eyebrow" style={{ color: 'var(--gold)' }}>{card.tier}</div>
                <div className="h-title" style={{ fontSize: 14, color: 'var(--ivory-dim)' }}>{card.name}</div>
              </div>
              <div className="row gap-8">
                <IcNFC size={20} stroke="var(--gold)"/>
                <div style={{
                  width: 28, height: 22, borderRadius: 4,
                  background: 'linear-gradient(135deg, #d4b070, #8e7440)',
                  position: 'relative',
                }}>
                  <div style={{
                    position: 'absolute', inset: '2px 4px',
                    background: 'repeating-linear-gradient(90deg, rgba(0,0,0,0.2) 0 1px, transparent 1px 4px)',
                  }}/>
                </div>
              </div>
            </div>

            <div className="num-display" style={{
              fontSize: 22,
              marginTop: 28,
              letterSpacing: '0.15em',
              fontFamily: '"JetBrains Mono", monospace',
              color: 'var(--ivory)',
            }}>{card.number.slice(0, 4)} <span style={{ opacity: 0.4 }}>••••</span> <span style={{ opacity: 0.4 }}>••••</span> {card.number.slice(-4)}</div>

            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 14 }}>
              <div className="col">
                <div className="tiny text-mute" style={{ letterSpacing: '0.15em' }}>CARDHOLDER</div>
                <div className="small" style={{ color: 'var(--ivory)', fontWeight: 500 }}>{card.holder}</div>
              </div>
              <div className="col">
                <div className="tiny text-mute" style={{ letterSpacing: '0.15em' }}>VALID THRU</div>
                <div className="small" style={{ color: 'var(--ivory)', fontFamily: 'JetBrains Mono', fontWeight: 500 }}>{card.expiry}</div>
              </div>
              <div className="h-title" style={{ fontSize: 14, color: 'var(--gold)', letterSpacing: '0.18em' }}>
                {card.network}
              </div>
            </div>
          </div>
        </div>
        <div className="flip-face back">
          <div className={variantClass} style={{ width: '100%', height: '100%' }}>
            <div style={{ height: 32, background: '#000', margin: '12px -24px 0', borderRadius: 2 }}/>
            <div className="row" style={{ justifyContent: 'space-between', marginTop: 16 }}>
              <div className="col gap-4">
                <div className="tiny text-mute" style={{ letterSpacing: '0.15em' }}>CLOSURE</div>
                <div className="h-title" style={{ fontSize: 18, color: 'var(--ivory)' }}>Day {card.closure}</div>
              </div>
              <div className="col gap-4">
                <div className="tiny text-mute" style={{ letterSpacing: '0.15em' }}>DUE</div>
                <div className="h-title" style={{ fontSize: 18, color: 'var(--ivory)' }}>Day {card.due}</div>
              </div>
              <div className="col gap-4 text-r">
                <div className="tiny text-mute" style={{ letterSpacing: '0.15em' }}>CVV</div>
                <div className="h-title" style={{ fontSize: 18, color: 'var(--ivory)', fontFamily: 'JetBrains Mono' }}>•••</div>
              </div>
            </div>
            <div className="divider" style={{ margin: '14px 0' }}/>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <div className="col gap-4">
                <div className="tiny text-mute" style={{ letterSpacing: '0.15em' }}>CREDIT LIMIT</div>
                <Money value={card.limit} size={20}/>
              </div>
              <div className="col gap-4 text-r">
                <div className="tiny text-mute" style={{ letterSpacing: '0.15em' }}>AVAILABLE</div>
                <span className="text-gold" style={{ fontFamily: 'Marcellus', fontSize: 20 }}>
                  ${(card.limit - card.used).toLocaleString('en-US')}
                </span>
              </div>
            </div>
            <div style={{ marginTop: 10, height: 6, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              <div style={{
                width: `${(card.used / card.limit) * 100}%`,
                height: '100%',
                background: 'linear-gradient(90deg, var(--gold-deep), var(--gold))',
                boxShadow: '0 0 8px var(--gold-shadow)',
              }}/>
            </div>
            <div className="tiny text-mute" style={{ marginTop: 6 }}>
              ${card.used.toLocaleString('en-US')} used of ${card.limit.toLocaleString('en-US')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Savings tank (circular)
// ─────────────────────────────────────────────
function SavingsTank({ goal, animate = true, size = 160, onContribute }) {
  const [pct, setPct] = useState(animate ? 0 : goal.saved / goal.target);
  useEffect(() => {
    if (!animate) { setPct(goal.saved / goal.target); return; }
    const id = setTimeout(() => setPct(goal.saved / goal.target), 60);
    return () => clearTimeout(id);
  }, [goal.saved, goal.target, animate]);

  // Use explicit pixel height (not percentage) — more reliable across renderers.
  const fillH = Math.round(size * pct);

  return (
    <div className="col gap-12" style={{ alignItems: 'center' }}>
      <div className="tank-wrap" style={{ width: size }}>
        <div className="tank" style={{ width: size, height: size }}>
          <div className="tank-fill" style={{ height: fillH, top: 'auto' }}/>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'grid', placeItems: 'center',
            color: 'var(--ivory)',
            zIndex: 2,
            mixBlendMode: 'normal',
            textShadow: '0 2px 8px rgba(0,0,0,0.7)',
          }}>
            <div className="col" style={{ alignItems: 'center', gap: 2 }}>
              <span className="h-title" style={{ fontSize: size * 0.18 }}>{Math.round(pct * 100)}%</span>
              <span className="tiny text-dim">${goal.saved.toLocaleString('en-US')} / ${goal.target.toLocaleString('en-US')}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="col gap-4" style={{ alignItems: 'center' }}>
        <div className="row gap-8" style={{ alignItems: 'center' }}>
          <span style={{ fontSize: 14, color: 'var(--gold)' }}>{goal.emoji}</span>
          <span className="h-title" style={{ fontSize: 14 }}>{goal.name}</span>
        </div>
        <span className="tiny text-mute">{goal.eta}</span>
        {onContribute && (
          <button onClick={onContribute}
            style={{
              marginTop: 6,
              background: 'rgba(230,198,135,0.08)',
              border: '1px solid var(--line)',
              color: 'var(--gold)',
              padding: '6px 14px',
              borderRadius: 999,
              fontSize: 10.5,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              fontFamily: 'JetBrains Mono',
            }}>+ Contribute</button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Transaction row
// ─────────────────────────────────────────────
function TxRow({ tx, compact = false }) {
  return (
    <div className="row" style={{ justifyContent: 'space-between', padding: compact ? '8px 0' : '10px 0' }}>
      <div className="row gap-12" style={{ minWidth: 0 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'var(--surface-3)',
          border: '1px solid var(--line-soft)',
          display: 'grid', placeItems: 'center',
          color: 'var(--gold)',
          flexShrink: 0,
        }}>
          <tx.Ic size={16}/>
        </div>
        <div className="col" style={{ minWidth: 0 }}>
          <span className="small fw-500" style={{ color: 'var(--ivory)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.name}</span>
          <span className="tiny text-mute">{tx.cat} · {tx.date}</span>
        </div>
      </div>
      <div className="col" style={{ alignItems: 'flex-end' }}>
        <span className="small fw-600" style={{ color: tx.amount < 0 ? 'var(--ivory)' : 'var(--positive)' }}>
          {tx.amount < 0 ? '−' : '+'} ${Math.abs(tx.amount).toFixed(2)}
        </span>
        <span className="tiny text-mute">{tx.method}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Logo (used in sidenav / wordmark)
// ─────────────────────────────────────────────
function LumisMark({ size = 26 }) {
  return (
    <span className="wordmark-mark" style={{ width: size, height: size }}/>
  );
}

Object.assign(window, {
  Money, fmtMoney,
  BalanceCard, QuickActionsRow, QUICK_ACTIONS,
  BarChart, AreaChart, Donut,
  CreditCard, SavingsTank, TxRow, LumisMark,
});
