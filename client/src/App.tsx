import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import EncryptionStatus from './components/encryption/EncryptionStatus';
import TransactionForm from './components/transaction/TransactionForm';
import TransactionList from './components/transaction/TransactionList';
import UserList from './components/user/UserList';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Encrypted Transaction System
            </h1>
            <p className="text-gray-600">
              Secure communication using asymmetric encryption
            </p>
          </header>

          <div className="grid gap-6">
            {/* Encryption Status */}
            <EncryptionStatus />

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Left Column */}
              <div className="space-y-6">
                <TransactionForm />
                <UserList />
              </div>

              {/* Right Column */}
              <div>
                <TransactionList />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            style: {
              background: '#059669',
            },
          },
          error: {
            style: {
              background: '#dc2626',
            },
          },
        }}
      />
    </QueryClientProvider>
  );
};

export default App;