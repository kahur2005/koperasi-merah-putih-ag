import React, { useState } from 'react';

export default function AuthScreen({
  mode,
  loading,
  googleLoading,
  googleEnabled = true,
  error,
  onModeChange,
  onSubmit,
  onGoogleLogin,
  onOpenAudioSettings,
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const isRegister = mode === 'register';

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ username, password });
  };

  return (
    <main className="auth-shell">
      <button
        className="auth-audio-settings-btn"
        type="button"
        onClick={onOpenAudioSettings}
        title="Audio settings"
        aria-label="Audio settings"
      >
        Audio
      </button>

      <section className="auth-card glass-card">
        <div className="auth-brand">
          <span>Koperasi Merah Putih</span>
          <h1>{isRegister ? 'Buat Akun Pengurus' : 'Masuk Pengurus'}</h1>
          <p>Masuk dulu supaya progres koperasi bisa tersimpan otomatis.</p>
        </div>

        <div className="auth-tabs" role="tablist" aria-label="Mode autentikasi">
          <button
            type="button"
            className={`tab-btn tab-mode ${!isRegister ? 'active' : ''}`}
            onClick={() => onModeChange('login')}
          >
            Login
          </button>
          <button
            type="button"
            className={`tab-btn tab-mode ${isRegister ? 'active' : ''}`}
            onClick={() => onModeChange('register')}
          >
            Register
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Username
            <input
              className="form-input"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              minLength={3}
              required
            />
          </label>
          <label>
            Password
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              minLength={6}
              required
            />
          </label>

          {error && <div className="info-note error">{error}</div>}

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Memproses...' : isRegister ? 'Daftar' : 'Login'}
          </button>
        </form>

        <div className="auth-divider"><span>atau</span></div>

        <button
          className="btn btn-google"
          type="button"
          onClick={onGoogleLogin}
          disabled={loading || googleLoading || !googleEnabled}
          title={googleEnabled ? 'Login dengan akun Google' : 'Firebase belum dikonfigurasi'}
        >
          {googleLoading ? 'Menghubungkan...' : 'Login with Google'}
        </button>
      </section>
    </main>
  );
}
