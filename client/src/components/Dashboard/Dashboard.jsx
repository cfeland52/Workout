import { useApp } from '../../state/AppContext.jsx';
import { todayStr, daysAgoStr } from '../../lib/dateUtils.js';
import { monthWorkoutCount, weeklyAvgBodyWeight, bodyWeightEntries } from '../../lib/selectors.js';
import MonthNav from '../Calendar/MonthNav.jsx';
import Calendar from '../Calendar/Calendar.jsx';
import StatsSidebar from '../StatsSidebar/StatsSidebar.jsx';
import WeightChart from '../WeightChart/WeightChart.jsx';

export default function Dashboard() {
  const { data, ui, openModal } = useApp();
  const userId = ui.currentUserId;
  const wCount = monthWorkoutCount(data, userId, ui.year, ui.month);
  const weeklyAvg = weeklyAvgBodyWeight(data, userId);
  const chartEntries = bodyWeightEntries(data, userId).filter((e) => e.date >= daysAgoStr(29));

  return (
    <>
      <div className="dashboard">
        <div className="dash-grid">
          <div className="card">
            <MonthNav />
            <Calendar userId={userId} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <StatsSidebar wCount={wCount} weeklyAvg={weeklyAvg} />
            <div className="card">
              <div className="card-title">Last 30 days &middot; body weight</div>
              <WeightChart entries={chartEntries} />
            </div>
          </div>
        </div>
      </div>
      <div className="fab-row">
        <button className="fab fab-secondary" onClick={() => openModal({ type: 'eventForm', date: todayStr(), editingId: null })}>
          + Special Event
        </button>
        <button className="fab" onClick={() => openModal({ type: 'workoutBuilder', date: todayStr() })}>
          + Log Workout
        </button>
      </div>
    </>
  );
}
