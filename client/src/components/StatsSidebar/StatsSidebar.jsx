import { fmtDateShort } from '../../lib/dateUtils.js';

export default function StatsSidebar({ wCount, weeklyAvg }) {
  let weightBlock;
  if (!weeklyAvg) {
    weightBlock = (
      <>
        <div className="stat-value">—</div>
        <div className="stat-sub">No body weight logged yet</div>
      </>
    );
  } else if (weeklyAvg.mode === 'week') {
    weightBlock = (
      <>
        <div className="stat-value">{weeklyAvg.avg.toFixed(1)} <span style={{ fontSize: 15, color: 'var(--text-faint)' }}>lb</span></div>
        <div className="stat-sub">Weekly avg &middot; {weeklyAvg.count} reading{weeklyAvg.count === 1 ? '' : 's'}</div>
      </>
    );
  } else {
    weightBlock = (
      <>
        <div className="stat-value">{weeklyAvg.avg.toFixed(1)} <span style={{ fontSize: 15, color: 'var(--text-faint)' }}>lb</span></div>
        <div className="stat-sub">Last logged {fmtDateShort(weeklyAvg.date)}</div>
      </>
    );
  }

  return (
    <div className="card">
      <div className="stat-row">
        <div className="stat-tile">
          <div className="card-title">This month</div>
          <div className="stat-value">{wCount}</div>
          <div className="stat-sub">workout{wCount === 1 ? '' : 's'} logged</div>
        </div>
        <div className="stat-tile">
          <div className="card-title">Body weight</div>
          {weightBlock}
        </div>
      </div>
    </div>
  );
}
