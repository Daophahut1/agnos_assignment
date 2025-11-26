'use client';

import { useEffect } from 'react';
import { socket } from '@/lib/socket';

export default function RealtimeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const initSocket = async () => {
      await fetch('/api/socket');
      socket.connect();
    };

    initSocket();

    return () => {
      socket.disconnect();
    };
  }, []);

  return <>{children}</>;
}
