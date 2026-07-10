import React from 'react';

function formatSaveSubtitle(save) {
  if (!save) return 'Belum ada autosave untuk akun ini.';
  const day = save.dayNumber ? `Hari ${save.dayNumber}` : 'Hari belum tercatat';
  const money = Number.isFinite(save.money)
    ? `Rp ${Number(save.money).toLocaleString('id-ID')}`
    : 'Saldo belum tercatat';
  return `${day} - ${money}`;
}

export default function GameEntryScreen({
  user,
  save,
  loading,
  error,
  onContinue,
  onStartNew,
  onLogout,
}) {
  const hasSave = !!save;

  return (
    <main className="auth-shell">
      <section className="entry-card glass-card">
        <div className="auth-brand">
          <span>Halo, {user?.username || 'Pengurus'}</span>
          <h1>Pilih Progres Game</h1>
          <p>{formatSaveSubtitle(save)}</p>
        </div>

        {error && <div className="info-note error">{error}</div>}

        <div className="entry-actions">
          <button
            className="btn btn-success"
            type="button"
            onClick={onContinue}
            disabled={!hasSave || loading}
          >
            Continue
          </button>
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
