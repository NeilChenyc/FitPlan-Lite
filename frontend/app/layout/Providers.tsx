'use client';

import React from 'react';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#2d2d2d',
            color: '#ffffff',
          },
          success: {
            duration: 4000,
            theme: {
              primary: '#4ade80',
            },
          },
          error: {
            duration: 6000,
            theme: {
              primary: '#ef4444',
            },
          },
        }}
      />
    </>
  );
}
