import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useGameStore } from './store/gameStore';
import Dashboard from './components/dashboard/Dashboard';
import StoreScene from './components/store3d/StoreScene';
import StoryIntro from './components/story/StoryIntro';
import StoryMoment from './components/story/StoryMoment';
import PhaseTransition from './components/hud/PhaseTransition';
import AuthScreen from './components/auth/AuthScreen';
import GameEntryScreen from './components/auth/GameEntryScreen';
import ConfirmNewGameModal from './components/auth/ConfirmNewGameModal';
import SettingsModal from './components/auth/SettingsModal';
import { authSaveClient } from './api/authSaveClient';
import { hasFirebaseConfig, signInWithGoogleAndGetIdToken, signOutFromFirebase } from './api/firebaseClient';
import './index.css';

const NOTIFICATION_AUTO_CLOSE_MS = 4000;
const TOKEN_STORAGE_KEY = 'koperasi_auth_token';

function NotificationToast({ notification, onDismiss }) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      onDismiss(notification.id);
    }, NOTIFICATION_AUTO_CLOSE_MS);

    return () => window.clearTimeout(timer);
  }, [notification.id, onDismiss]);

  return (
    <div className="notification-toast glass-card">
      <span>{notification.text}</span>
      <button
        className="notification-close"
        onClick={() => onDismiss(notification.id)}
        aria-label="Tutup notifikasi"
      >
        &times;
      </button>
    </div>
  );
}

export default function App() {
  const [appPhase, setAppPhase] = useState('auth');
  const [authMode, setAuthMode] = useState('login');
  const [authLoading, setAuthLoading] = useState(true);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [entryError, setEntryError] = useState('');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [saves, setSaves] = useState({ auto: null, manual: null });
  const [showNewGameConfirm, setShowNewGameConfirm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [manualSaving, setManualSaving] = useState(false);
  const saveTimerRef = useRef(null);
  const tokenRef = useRef(token);
  const appPhaseRef = useRef(appPhase);

  const currentView = useGameStore((s) => s.currentView);
  const storyIntroSeen = useGameStore((s) => s.storyIntroSeen);
  const notifications = useGameStore((s) => s.notifications);
  const dismissNotification = useGameStore((s) => s.dismissNotification);
  const startNewGame = useGameStore((s) => s.startNewGame);
  const loadGameStateFromSave = useGameStore((s) => s.loadGameStateFromSave);

  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  useEffect(() => {
    appPhaseRef.current = appPhase;
  }, [appPhase]);

  const persistGameState = useCallback(async (saveName = 'Auto Save') => {
    const activeToken = tokenRef.current;
    if (!activeToken || appPhaseRef.current !== 'game') return;

    setSaveStatus('saving');
    try {
      const snapshot = useGameStore.getState().exportGameStateForSave();
      const result = await authSaveClient.saveGame(activeToken, snapshot, saveName);
      const slot = result.save?.saveName === 'Manual Save' ? 'manual' : 'auto';
      setSaves((currentSaves) => ({
        ...currentSaves,
        [slot]: {
          ...(currentSaves[slot] || {}),
          ...(result.save || {}),
          gameState: snapshot,
        },
      }));
      setSaveStatus('saved');
    } catch (error) {
      setSaveStatus('error');
      console.error(error);
    }
  }, []);

  useEffect(() => {
    if (appPhase !== 'game' || !token) return undefined;

    const unsubscribe = useGameStore.subscribe(() => {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = window.setTimeout(() => {
        persistGameState();
      }, 800);
    });

    return () => {
      window.clearTimeout(saveTimerRef.current);
      unsubscribe();
    };
  }, [appPhase, token, persistGameState]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrapAuth() {
      if (!token) {
        setAuthLoading(false);
        return;
      }

      try {
        const [{ user: activeUser }, saveResult] = await Promise.all([
          authSaveClient.me(token),
          authSaveClient.getSave(token),
        ]);

        if (cancelled) return;
        setUser(activeUser);
        setSaves(saveResult.saves || { auto: saveResult.save || null, manual: null });
        setAppPhase('gameEntry');
      } catch {
        if (cancelled) return;
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken(null);
        setUser(null);
        setSaves({ auto: null, manual: null });
        setAppPhase('auth');
      } finally {
        if (!cancelled) setAuthLoading(false);
      }
    }

    bootstrapAuth();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const refreshSave = useCallback(async (activeToken) => {
    const saveResult = await authSaveClient.getSave(activeToken);
    setSaves(saveResult.saves || { auto: saveResult.save || null, manual: null });
  }, []);

  const handleAuthSubmit = async (credentials) => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const result = authMode === 'register'
        ? await authSaveClient.register(credentials)
        : await authSaveClient.login(credentials);
      localStorage.setItem(TOKEN_STORAGE_KEY, result.token);
      setToken(result.token);
      setUser(result.user);
      await refreshSave(result.token);
      setAppPhase('gameEntry');
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setAuthError('');
    try {
      const idToken = await signInWithGoogleAndGetIdToken();
      const result = await authSaveClient.loginWithGoogle(idToken);
      localStorage.setItem(TOKEN_STORAGE_KEY, result.token);
      setToken(result.token);
      setUser(result.user);
      await refreshSave(result.token);
      setAppPhase('gameEntry');
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleContinue = (slot = 'auto') => {
    const selectedSave = saves[slot] || saves.auto || saves.manual;
    if (!selectedSave?.gameState) return;
    loadGameStateFromSave(selectedSave.gameState);
    setSaveStatus('saved');
    setEntryError('');
    appPhaseRef.current = 'game';
    setAppPhase('game');
  };

  const beginNewGame = async () => {
    startNewGame();
    setShowNewGameConfirm(false);
    setEntryError('');
    setSaveStatus('saving');
    appPhaseRef.current = 'game';
    setAppPhase('game');
    window.setTimeout(() => {
      persistGameState();
    }, 0);
  };

  const handleStartNew = () => {
    if (saves.auto || saves.manual) {
      setShowNewGameConfirm(true);
      return;
    }
    beginNewGame();
  };

  const handleManualSave = async () => {
    setManualSaving(true);
    try {
      await persistGameState('Manual Save');
    } finally {
      setManualSaving(false);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    window.clearTimeout(saveTimerRef.current);
    await signOutFromFirebase();
    setToken(null);
    setUser(null);
    setSaves({ auto: null, manual: null });
    setShowSettings(false);
    setAppPhase('auth');
    setSaveStatus('idle');
    startNewGame();
  };

  if (authLoading && appPhase === 'auth') {
    return (
      <div className="app">
        <main className="auth-shell">
          <section className="auth-card glass-card">
            <div className="auth-brand">
              <span>Koperasi Merah Putih</span>
              <h1>Memuat Akun</h1>
              <p>Mengecek sesi login dan autosave.</p>
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (appPhase === 'auth') {
    return (
      <div className="app">
        <AuthScreen
          mode={authMode}
          loading={authLoading}
          googleLoading={googleLoading}
          googleEnabled={hasFirebaseConfig()}
          error={authError}
          onModeChange={(mode) => {
            setAuthMode(mode);
            setAuthError('');
          }}
          onSubmit={handleAuthSubmit}
          onGoogleLogin={handleGoogleLogin}
        />
      </div>
    );
  }

  if (appPhase === 'gameEntry') {
    return (
      <div className="app">
        <GameEntryScreen
          user={user}
          saves={saves}
          loading={authLoading}
          error={entryError}
          onContinue={handleContinue}
          onStartNew={handleStartNew}
          onLogout={handleLogout}
        />
        {showNewGameConfirm && (
          <ConfirmNewGameModal
            onCancel={() => setShowNewGameConfirm(false)}
            onConfirm={beginNewGame}
          />
        )}
      </div>
    );
  }

  return (
    <div className="app">
      <div className={`save-status-pill save-status-${saveStatus}`}>
        <span>{user?.username || 'Pengurus'}</span>
        <strong>
          {saveStatus === 'saving'
            ? 'Menyimpan...'
            : saveStatus === 'error'
              ? 'Gagal menyimpan'
              : saveStatus === 'saved'
                ? 'Tersimpan'
                : 'Autosave siap'}
        </strong>
        <button type="button" onClick={() => setShowSettings(true)}>Settings</button>
      </div>

      {showSettings && (
        <SettingsModal
          saveStatus={saveStatus}
          manualSaving={manualSaving}
          onManualSave={handleManualSave}
          onLogout={handleLogout}
          onClose={() => setShowSettings(false)}
        />
      )}

      {currentView === 'dashboard' ? <Dashboard /> : <StoreScene />}
      {!storyIntroSeen && <StoryIntro />}
      {storyIntroSeen && <StoryMoment />}

      <PhaseTransition />

      {/* Global Notifications Toast Container */}
      <div className="notifications-container">
        {notifications.map((notif) => (
          <NotificationToast
            key={notif.id}
            notification={notif}
            onDismiss={dismissNotification}
          />
        ))}
      </div>
    </div>
  );
}
