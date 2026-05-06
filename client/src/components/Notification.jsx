import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be inside NotificationProvider');
  return ctx;
};

const typeStyles = {
  success: 'bg-emerald-600 border-emerald-500',
  error:   'bg-red-700    border-red-600',
  warning: 'bg-amber-600  border-amber-500',
  info:    'bg-blue-700   border-blue-600',
  bid:     'bg-violet-700 border-violet-600',
};

const typeIcons = {
  success: '✅',
  error:   '❌',
  warning: '⚠️',
  info:    'ℹ️',
  bid:     '🔨',
};

const ToastContainer = ({ toasts, onRemove }) => (
  <div className="fixed top-20 right-4 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
    {toasts.map((toast) => (
      <div
        key={toast.id}
        className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border
          shadow-2xl text-white animate-slide-in cursor-pointer
          ${typeStyles[toast.type] || typeStyles.info}`}
        onClick={() => onRemove(toast.id)}
      >
        <span className="text-lg flex-shrink-0">{typeIcons[toast.type] || 'ℹ️'}</span>
        <p className="text-sm font-medium leading-snug flex-1">{toast.message}</p>
        <button
          className="text-white/70 hover:text-white ml-1 flex-shrink-0 text-xs"
          onClick={(e) => { e.stopPropagation(); onRemove(toast.id); }}
        >✕</button>
      </div>
    ))}
  </div>
);

export default ToastContainer;
