import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { getChapterProgress } from '../../data/storyChapters';
import { formatRupiah } from '../../utils/formatRupiah';

function formatGoalValue(goal, value) {
  if (goal.money) return formatRupiah(value);
  if (goal.label.toLowerCase().includes('bahagia')) return `${value}%`;
  return value;
}

export default function ChapterProgress() {
  const snapshot = useGameStore((state) => state);
  const { activeChapter, nextGoal, chapters } = getChapterProgress(snapshot);

  return (
    <section className="chapter-progress" aria-label="Misi cerita koperasi">
      <div className="chapter-heading">
        <div>
          <span className="chapter-kicker">Bab {activeChapter.number} dari {chapters.length}</span>
          <h2>{activeChapter.title}</h2>
        </div>
        <img src={activeChapter.avatar} alt="" />
      </div>

      <p>{activeChapter.summary}</p>

      <div className="chapter-main-progress" aria-label={`Kemajuan bab ${activeChapter.progress}%`}>
        <span style={{ width: `${activeChapter.progress}%` }} />
      </div>

      <div className="chapter-goals">
        {activeChapter.goals.map((goal) => (
          <div className={goal.complete ? 'chapter-goal is-complete' : 'chapter-goal'} key={goal.id}>
            <span>{goal.label}</span>
            <strong>
              {formatGoalValue(goal, goal.value)} / {formatGoalValue(goal, goal.target)}
            </strong>
          </div>
        ))}
      </div>

      {nextGoal && (
        <div className="chapter-next">
          <span>Fokus Berikutnya</span>
          <strong>{nextGoal.label}</strong>
        </div>
      )}
    </section>
  );
}
