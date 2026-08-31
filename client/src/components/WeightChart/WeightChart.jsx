import { daysAgoStr, fmtDateShort, parseYMD } from '../../lib/dateUtils.js';

// Ported from Workout-Book.html's weightChartSvg (docs/legacy/Workout-Book.html:812-844).
function buildChart(entries) {
  const W = 300, H = 110, padL = 4, padR = 4, padT = 10, padB = 4;
  const weights = entries.map((e) => e.weight);
  let minW = Math.min(...weights), maxW = Math.max(...weights);
  if (minW === maxW) { minW -= 2; maxW += 2; }
  const span = maxW - minW;
  minW -= span * 0.15; maxW += span * 0.15;
  const start = daysAgoStr(29);
  const totalDays = 29;

  function xFor(dateStr) {
    const p1 = parseYMD(start), p2 = parseYMD(dateStr);
    const d1 = new Date(p1.y, p1.m - 1, p1.d), d2 = new Date(p2.y, p2.m - 1, p2.d);
    const offset = Math.round((d2 - d1) / 86400000);
    return padL + (offset / totalDays) * (W - padL - padR);
  }
  function yFor(w) { return padT + (1 - (w - minW) / (maxW - minW)) * (H - padT - padB); }

  const pts = entries.map((e) => ({ x: xFor(e.date), y: yFor(e.weight), e }));
  const linePath = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p.x.toFixed(1) + ',' + p.y.toFixed(1)).join(' ');
  const areaPath = linePath +
    ` L${pts[pts.length - 1].x.toFixed(1)},${H - padB}` +
    ` L${pts[0].x.toFixed(1)},${H - padB} Z`;

  return { W, H, minW, maxW, pts, linePath, areaPath };
}

export default function WeightChart({ entries }) {
  if (entries.length < 2) {
    return <div className="empty-state" style={{ padding: '18px 6px' }}>Log body weight on a few workouts to see your trend.</div>;
  }

  const { W, H, minW, maxW, pts, linePath, areaPath } = buildChart(entries);

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }} preserveAspectRatio="none">
        <defs>
          <linearGradient id="wbGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#wbGrad)" stroke="none" />
        <path d={linePath} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((p, i) => {
          const isLast = i === pts.length - 1;
          return (
            <circle
              key={p.e.date}
              cx={p.x.toFixed(1)}
              cy={p.y.toFixed(1)}
              r={isLast ? 3.2 : 2}
              fill={isLast ? 'var(--accent)' : 'var(--surface)'}
              stroke="var(--accent)"
              strokeWidth="1.4"
            >
              <title>{fmtDateShort(p.e.date)}: {p.e.weight} lb</title>
            </circle>
          );
        })}
      </svg>
      <div className="chart-caption">
        <span>{maxW.toFixed(0)} lb</span>
        <span>{minW.toFixed(0)} lb</span>
      </div>
    </div>
  );
}
