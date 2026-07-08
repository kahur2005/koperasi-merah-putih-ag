import React, { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import Dashboard from './components/dashboard/Dashboard';
import StoreScene from './components/store3d/StoreScene';
import StoryIntro from './components/story/StoryIntro';
import StoryMoment from './components/story/StoryMoment';
import './index.css';

const NOTIFICATION_AUTO_CLOSE_MS = 4000;

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
  const currentView = useGameStore((s) => s.currentView);
  const storyIntroSeen = useGameStore((s) => s.storyIntroSeen);
  const notifications = useGameStore((s) => s.notifications);
  const dismissNotification = useGameStore((s) => s.dismissNotification);

  return (
    <div className="app">
      {currentView === 'dashboard' ? <Dashboard /> : <StoreScene />}
      {!storyIntroSeen && <StoryIntro />}
      {storyIntroSeen && <StoryMoment />}

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
