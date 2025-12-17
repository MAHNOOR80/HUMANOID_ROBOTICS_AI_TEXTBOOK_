import React, { useState, useEffect } from 'react';
import ErrorBoundary from '../components/RAGQueryWidget/ErrorBoundary';

// Lazy load components
const RAGQueryWidget = React.lazy(() => import('../components/RAGQueryWidget'));
const FloatingChatButton = React.lazy(() => import('../components/RAGQueryWidget/FloatingChatButton'));

export default function Root({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  // Prevent page scroll when chatbot is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      // Restore scroll position
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    return () => {
      // Cleanup on unmount
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      {children}

      {/* Floating Chat Button - Always visible */}
      <ErrorBoundary>
        <React.Suspense fallback={null}>
          <FloatingChatButton onClick={handleToggle} isOpen={isOpen} />
        </React.Suspense>
      </ErrorBoundary>

      {/* Chatbot Widget - Shows when open */}
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <div
            onClick={handleClose}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 999,
              backdropFilter: 'blur(4px)',
              animation: 'fadeIn 0.3s ease',
            }}
          />

          {/* Chatbot container */}
          <div
            style={{
              position: 'fixed',
              bottom: '100px',
              right: '24px',
              zIndex: 1000,
              width: '440px',
              maxWidth: 'calc(100vw - 48px)',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              borderRadius: '1.5rem',
              backgroundColor: 'white',
              backdropFilter: 'blur(10px)',
              background: 'rgba(255, 255, 255, 0.98)',
              border: '1px solid rgba(229, 231, 235, 0.5)',
              animation: 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <ErrorBoundary>
              <React.Suspense fallback={
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '3rem 2rem',
                  color: '#6b7280',
                  fontSize: '0.9375rem',
                  fontWeight: '500'
                }}>
                  Loading AI Assistant...
                </div>
              }>
                <RAGQueryWidget onClose={handleClose} />
              </React.Suspense>
            </ErrorBoundary>
          </div>
        </>
      )}

      {/* Add animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        /* Mobile responsive adjustments */
        @media (max-width: 768px) {
          div[style*="width: 440px"] {
            width: calc(100vw - 40px) !important;
            right: 20px !important;
            bottom: 80px !important;
          }
        }
      `}</style>
    </>
  );
}