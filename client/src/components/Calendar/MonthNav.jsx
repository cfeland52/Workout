import { useApp } from '../../state/AppContext.jsx';
import { fmtMonthYear } from '../../lib/dateUtils.js';

export default function MonthNav() {
  const { ui, prevMonth, nextMonth, goToday } = useApp();
  return (
    <div className="month-nav">
      <div className="month-nav-controls">
        <button className="icon-btn" onClick={prevMonth}>&#8249;</button>
      </div>
      <h2>{fmtMonthYear(ui.year, ui.month)}</h2>
      <div className="month-nav-controls">
        <button className="btn btn-ghost btn-sm" onClick={goToday}>Today</button>
        <button className="icon-btn" onClick={nextMonth}>&#8250;</button>
      </div>
    </div>
  );
}
