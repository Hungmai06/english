'use client';

import React, { useState } from 'react';
import { AuthProvider } from '@/lib/authContext';
import { AuthModal } from '@/components/AuthModal';
import { SearchModal } from '@/components/SearchModal';

interface ClientProvidersProps {
  children: React.ReactNode;
}

export const ClientProviders: React.FC<ClientProvidersProps> = ({ children }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Allow global triggering of search modal via window events
  React.useEffect(() => {
    const handleOpenSearch = () => setIsSearchOpen(true);
    window.addEventListener('open-search-modal', handleOpenSearch);
    return () => window.removeEventListener('open-search-modal', handleOpenSearch);
  }, []);

  return (
    <AuthProvider>
      {children}
      <AuthModal />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </AuthProvider>
  );
};
