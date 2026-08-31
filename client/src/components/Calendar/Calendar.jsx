import { useApp } from '../../state/AppContext.jsx';
import { addMonths, daysInMonth, firstWeekday, pad2, todayStr, WEEKDAY_SHORT } from '../../lib/dateUtils.js';
import { eventsOnDate, workoutsOnDate } from '../../lib/selectors.js';

function DayCell({ y, m, d, outside, userId, today, data, openDay }) {
  const dateStr = `${y}-${pad2(m)}-${pad2(d)}`;
  const hasWorkout = workoutsOnDate(data, userId, dateStr).length > 0;
  const hasEvent = eventsOnDate(data, userId, dateStr).length > 0;
  const classes = 'day-cell' + (outside ? ' outside' : ' interactive') + (dateStr === today ? ' today' : '');
  const dots = !outside && (hasWorkout || hasEvent) ? (
    <span className="day-dots">
      {hasWorkout && <span className="dot dot-workout" />}
      {hasEvent && <span className="dot dot-event" />}
    </span>
  ) : null;

  if (outside) {
    return (
      <div className={classes}>
        <span className="day-num">{d}</span>
        {dots}
      </div>
    );
  }
  return (
    <button className={classes} onClick={() => openDay(dateStr)}>
      <span className="day-num">{d}</span>
      {dots}
    </button>
  );
}

export default function Calendar({ userId }) {
  const { data, ui, openDay } = useApp();
  const y = ui.year, m = ui.month;
  const first = firstWeekday(y, m);
  const total = daysInMonth(y, m);
  const prev = addMonths(y, m, -1);
  const prevTotal = daysInMonth(prev.y, prev.m);
  const today = todayStr();

  const cells = [];
  let n = 0;
  for (let i = first - 1; i >= 0; i--) {
    n++;
    cells.push(<DayCell key={`p${i}`} y={prev.y} m={prev.m} d={prevTotal - i} outside userId={userId} today={today} data={data} openDay={openDay} />);
  }
  for (let d = 1; d <= total; d++) {
    n++;
    cells.push(<DayCell key={`d${d}`} y={y} m={m} d={d} outside={false} userId={userId} today={today} data={data} openDay={openDay} />);
  }
  const next = addMonths(y, m, 1);
  let d2 = 1;
  while (n % 7 !== 0) {
    cells.push(<DayCell key={`n${d2}`} y={next.y} m={next.m} d={d2} outside userId={userId} today={today} data={data} openDay={openDay} />);
    d2++; n++;
  }

  return (
    <>
      <div className="calendar-weekdays">
        {WEEKDAY_SHORT.map((wd) => <span key={wd}>{wd}</span>)}
      </div>
      <div className="calendar-grid">{cells}</div>
    </>
  );
}
