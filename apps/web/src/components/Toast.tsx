import { useEffect } from 'react';
import { useGameStore, useUI } from '../store/useGameStore';

export function Toast() {
  const { showToast, toastMessage, toastType } = useUI();
  const { hideToast } = useGameStore();

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        hideToast();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [showToast, hideToast]);

  if (!showToast) return null;

  const getIcon = () => {
    switch (toastType) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  const getColorClasses = () => {
    switch (toastType) {
      case 'success':
        return 'bg-green-600 border-green-500';
      case 'error':
        return 'bg-red-600 border-red-500';
      case 'info':
      default:
        return 'bg-blue-600 border-blue-500';
    }
  };

  return (
    <div className={`
      fixed top-4 right-4 z-50 
      ${getColorClasses()}
      text-white px-4 py-3 rounded-lg shadow-lg border-l-4
      max-w-sm animate-slide-in-right
    `}>
      <div className="flex items-start space-x-3">
        <span className="text-lg flex-shrink-0 mt-0.5">
          {getIcon()}
        </span>
        
        <div className="flex-1">
          <p className="text-sm font-medium leading-tight">
            {toastMessage}
          </p>
        </div>
        
        <button
          onClick={hideToast}
          className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
          aria-label="Kapat"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// CSS animasyonu için Tailwind config'e eklenecek
// @keyframes slide-in-right {
//   from {
//     transform: translateX(100%);
//     opacity: 0;
//   }
//   to {
//     transform: translateX(0);
//     opacity: 1;
//   }
// }

interface ToastContainerProps {
  children: React.ReactNode;
}

export function ToastContainer({ children }: ToastContainerProps) {
  return (
    <div className="relative">
      {children}
      <Toast />
    </div>
  );
}