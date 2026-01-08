'use client';

import React, { ReactNode } from 'react';
import { AuthProvider } from './auth/AuthProvider';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}