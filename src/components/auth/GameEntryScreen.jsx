import React from 'react';
import { getEntrySummary, getSaveSlotCards } from './gameEntryViewModel.js';

export default function GameEntryScreen({
  user,
  saves,
  loading,
  error,
  onContinue,
  onStartNew,
  onLogout,
}) {
  const saveCards = getSaveSlotCards(saves);
  const hasSave = saveCards.length > 0;

  return (
    <main className="auth-shell">
      <section className="entry-card glass-card">
        <div className="auth-brand">
          <span>Halo, {user?.username || 'Pengurus'}</span>
          <h1>Pilih Progres Game</h1>
          <p>{getEntrySummary(saves)}</p>
        </div>

        {error && <div className="info-note error">{error}</div>}

        <div className="entry-actions">
          {hasSave ? (
            <div className="save-slot-grid">
              {saveCards.map((card) => (
                <button
                  key={card.slot}
                  className="save-slot-card"
                  type="button"
                  onClick={() => onContinue(card.slot)}
                  disabled={loading}
                >
                  <span>{card.title}</span>
                  <strong>{card.subtitle}</strong>
                </button>
              ))}
            </div>
          ) : (
            <button className="btn btn-success" type="button" disabled>
              Continue
            </button>
          )}
          <button
            className="btn btn-primary"
            type="button"
            onClick={onStartNew}
            disabled={loading}
          >
            Start New Game
          </button>
          <button className="btn btn-secondary" type="button" onClick={onLogout}>
            Logout
          </button>
        </div>

        {hasSave && (
          <p className="entry-warning">
            Start New Game akan menimpa autosave setelah kamu konfirmasi.
          </p>
        )}
      </section>
    </main>
  );
}
