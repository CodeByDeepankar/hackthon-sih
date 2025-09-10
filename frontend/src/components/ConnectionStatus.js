"use client";

import { useState, useEffect } from "react";
import apiClient from "@/lib/api";

const ConnectionStatus = () => {
  const [status, setStatus] = useState('checking');
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        setStatus('checking');
        setError(null);
        await apiClient.healthCheck();
        setStatus('connected');
      } catch (err) {
        setStatus('disconnected');
        setError(err.message);
      }
    };

    checkConnection();
    
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (status === 'connected') {
    return null; // Don't show anything when connected
  }

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 p-4 text-center text-white ${
      status === 'checking' ? 'bg-yellow-500' : 'bg-red-500'
    }`}>
      <div className="max-w-4xl mx-auto">
        {status === 'checking' && (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Checking connection...</span>
          </div>
        )}
        
        {status === 'disconnected' && (
          <div>
            <div className="font-semibold mb-1">❌ Backend Connection Failed</div>
            <div className="text-sm opacity-90">
              {error || 'Unable to connect to backend server'}
            </div>
            <div className="text-xs mt-2 opacity-75">
              Make sure the backend server is running at http://localhost:4000
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatus;
