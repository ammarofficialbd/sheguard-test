import { AuthProvider } from '@/contexts/auth-context';
import React, { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';

interface ProviderProps {
  children: ReactNode;
}

const Provider: React.FC<ProviderProps> = ({ children }) => {
  return (
    <>
    <AuthProvider> 
    {children}
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
    </AuthProvider>
    </>
  );
};

export default Provider;
