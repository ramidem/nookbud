'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';

import { cn } from '../../utils/cn';

type ToastVariant = 'default' | 'success' | 'error' | 'warning';

type ToastItem = {
  id: string;
  message: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  toast: (message: string, variant?: ToastVariant) => void;
};

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const variantStyles: Record<ToastVariant, string> = {
  default: 'bg-foreground text-white dark:bg-dark-foreground dark:text-foreground',
  error: 'bg-error text-white',
  success: 'bg-success text-white',
  warning: 'bg-warning text-foreground',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, variant: ToastVariant = 'default') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <button
            key={t.id}
            className={cn(
              'animate-in slide-in-from-bottom-5 fade-in-0 rounded-xl px-4 py-3 text-sm font-medium shadow-lg',
              variantStyles[t.variant],
            )}
            onClick={() => dismiss(t.id)}
            type="button"
          >
            {t.message}
          </button>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
