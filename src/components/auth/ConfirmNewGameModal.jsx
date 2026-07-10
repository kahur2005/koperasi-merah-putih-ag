import React from 'react';

export default function ConfirmNewGameModal({ onCancel, onConfirm }) {
  return (
    <div className="modal-overlay">
      <section className="modal-content glass-card confirm-new-game">
        <div className="modal-header">
          <h2>Mulai Game Baru?</h2>
          <button className="modal-close" type="button" onClick={onCancel} aria-label="Tutup">
            &times;
          </button>
        </div>
        <p>
          Autosave lama akan ditimpa setelah game baru dimulai. Gunakan Continue kalau ingin
          melanjutkan progres sebelumnya.
        </p>
        <div className="modal-footer-row">
          <button className="btn btn-secondary" type="button" onClick={onCancel}>
            Batal
          </button>
          <button className="btn btn-danger" type="button" onClick={onConfirm}>
            Mulai Baru
          </button>
        </div>
      </section>
    </div>
  );
}
