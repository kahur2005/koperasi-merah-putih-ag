import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { getChapterProgress } from '../../data/storyChapters';
import { formatRupiah } from '../../utils/formatRupiah';
import { getDashboardAdvisory } from './dashboardViewModel';

function formatGoalValue(goal, value) {
  if (goal.money) return formatRupiah(value);
  if (goal.label.toLowerCase().includes('bahagia')) return `${value}%`;
  return value;
}

export default function MissionLedger() {
  const snapshot = useGameStore((state) => state);
  const setActiveModal = useGameStore((state) => state.setActiveModal);
  const chapterProgress = getChapterProgress(snapshot);
  const { activeChapter, nextGoal, chapters } = chapterProgress;
  const advisory = getDashboardAdvisory(snapshot, chapterProgress);

  const handleAdvisoryAction = () => {
    if (advisory.actionType !== 'store3d') setActiveModal(advisory.actionType);
  };

  return (
    <section className="mission-ledger" aria-label="Misi cerita koperasi">
      <div className="mission-ledger-heading">
        <div>
          <span className="mission-ledger-kicker">Bab {activeChapter.number} dari {chapters.length}</span>
          <h2>{activeChapter.title}</h2>
        </div>
        <img src={activeChapter.avatar} alt="" />
      </div>

      <p className="mission-ledger-summary">{activeChapter.summary}</p>
      <div className="mission-ledger-progress" aria-label={`Kemajuan bab ${activeChapter.progress}%`}>
        <span style={{ width: `${activeChapter.progress}%` }} />
      </div>

      <div className="mission-ledger-goals">
        {activeChapter.goals.map((goal) => (
          <div className={goal.complete ? 'mission-ledger-goal is-complete' : 'mission-ledger-goal'} key={goal.id}>
            <span>{goal.label}</span>
            <strong>{formatGoalValue(goal, goal.value)} / {formatGoalValue(goal, goal.target)}</strong>
          </div>
        ))}
      </div>

      {nextGoal && (
        <div className="mission-ledger-next">
          <span>Fokus Berikutnya</span>
          <strong>{nextGoal.label}</strong>
        </div>
      )}

      <div className="mission-ledger-advisory">
        <span className="mission-ledger-advisory-kicker">Catatan Pengurus</span>
        <h3>{advisory.title}</h3>
        <p>{advisory.body}</p>
        {advisory.actionType !== 'store3d' && (
          <button className="btn btn-primary" onClick={handleAdvisoryAction}>{advisory.action}</button>
        )}
      </div>
    </section>
  );
}
