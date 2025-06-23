'use client';

import { useEffect, useState } from 'react';
import { hasValidAccessToken, decodeJWT } from '@/utils/jwt';

interface AuthDebugInfo {
  hasToken: boolean;
  isValid: boolean;
  tokenPreview: string;
  decodedPayload: unknown;
  expiresAt: string;
  isExpired: boolean;
}

export function AuthDebugger() {
  const [debugInfo, setDebugInfo] = useState<AuthDebugInfo | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    const updateDebugInfo = () => {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        setDebugInfo({
          hasToken: false,
          isValid: false,
          tokenPreview: 'No token found',
          decodedPayload: null,
          expiresAt: 'N/A',
          isExpired: true
        });
        return;
      }

      const isValid = hasValidAccessToken();
      const decoded = decodeJWT(token);
      
      setDebugInfo({
        hasToken: true,
        isValid,
        tokenPreview: `${token.substring(0, 20)}...`,
        decodedPayload: decoded,
        expiresAt: decoded?.exp ? new Date(decoded.exp * 1000).toISOString() : 'Unknown',
        isExpired: decoded?.exp ? decoded.exp < Math.floor(Date.now() / 1000) : true
      });
    };

    // Update immediately
    updateDebugInfo();

    // Update every 5 seconds
    const interval = setInterval(updateDebugInfo, 5000);

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accessToken') {
        updateDebugInfo();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Don't render in production
  if (process.env.NODE_ENV !== 'development' || !debugInfo) {
    return null;
  }

  return (
    <div 
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 9999,
        maxWidth: '300px',
        wordBreak: 'break-all'
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
        🔧 Auth Debug ({new Date().toLocaleTimeString()})
      </div>
      <div>
        <strong>Has Token:</strong> {debugInfo.hasToken ? '✅' : '❌'}
      </div>
      <div>
        <strong>Is Valid:</strong> {debugInfo.isValid ? '✅' : '❌'}
      </div>
      <div>
        <strong>Is Expired:</strong> {debugInfo.isExpired ? '❌' : '✅'}
      </div>
      <div>
        <strong>Token:</strong> {debugInfo.tokenPreview}
      </div>
      <div>
        <strong>Expires:</strong> {debugInfo.expiresAt}
      </div>
      {debugInfo.decodedPayload ? (
        <div>
          <strong>Subject:</strong> {(debugInfo.decodedPayload as { sub?: string }).sub || 'N/A'}
        </div>
      ) : null}
    </div>
  );
}