import React from 'react';

export default function SettingsModal({
  saveStatus,
  manualSaving,
  onManualSave,
  onLogout,
  onClose,
}) {
  return (
    <div className="modal-overlay">
      <section className="modal-content glass-card settings-modal">
        <div className="modal-header">
          <h2>Settings</h2>
          <button className="modal-close" type="button" onClick={onClose} aria-label="Tutup">
            &times;
          </button>
        </div>

        <div className="settings-list">
          <div>
            <h3>Manual Save</h3>
            <p>Simpan progres saat ini ke slot manual. Slot ini terpisah dari autosave.</p>
          </div>
          <button className="btn btn-success" type="button" onClick={onManualSave} disabled={manualSaving}>
            {manualSaving ? 'Menyimpan...' : 'Save Manual'}
          </button>

          <div>
            <h3>Status Save</h3>
            <p>
              {saveStatus === 'saving'
                ? 'Autosave sedang berjalan.'
                : saveStatus === 'error'
                  ? 'Save terakhir gagal. Coba manual save sebelum keluar.'
                  : 'Progress terakhir aman tersimpan saat koneksi tersedia.'}
            </p>
          </div>
          <button className="btn btn-danger" type="button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </section>
    </div>
  );
}
