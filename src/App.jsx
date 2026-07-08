import React from 'react';
import { useGameStore } from './store/gameStore';
import Dashboard from './components/dashboard/Dashboard';
import StoreScene from './components/store3d/StoreScene';
import './index.css';

export default function App() {
  const currentView = useGameStore((s) => s.currentView);
  const notifications = useGameStore((s) => s.notifications);
  const dismissNotification = useGameStore((s) => s.dismissNotification);

  return (
    <div className="app">
      {currentView === 'dashboard' ? <Dashboard /> : <StoreScene />}

      {/* Global Notifications Toast Container */}
      <div className="notifications-container">
        {notifications.map((notif) => (
          <div key={notif.id} className="notification-toast glass-card">
            <span>{notif.text}</span>
            <button
              className="notification-close"
              onClick={() => dismissNotification(notif.id)}
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
