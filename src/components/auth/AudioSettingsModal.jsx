import React from 'react';

function VolumeControl({ label, value, onChange }) {
  const percent = Math.round(value * 100);

  return (
    <label className="audio-volume-row">
      <span>{label}</span>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <strong>{percent}%</strong>
    </label>
  );
}

export default function AudioSettingsModal({
  volumes,
  onBgmVolumeChange,
  onSfxVolumeChange,
  onClose,
}) {
  return (
    <div className="modal-overlay">
      <section className="modal-content glass-card audio-settings-modal">
        <div className="modal-header">
          <h2>Audio</h2>
          <button className="modal-close" type="button" onClick={onClose} aria-label="Tutup">
            &times;
          </button>
        </div>

        <div className="audio-settings-list">
          <VolumeControl
            label="BGM"
            value={volumes.bgm}
            onChange={onBgmVolumeChange}
          />
          <VolumeControl
            label="SFX"
            value={volumes.sfx}
            onChange={onSfxVolumeChange}
          />
        </div>
      </section>
    </div>
  );
}
