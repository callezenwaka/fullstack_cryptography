import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { transactionService } from '@/services/transactionService';
import { useEncryption } from '@/hooks/useEncryption';
import { Transaction } from '@/types/transaction';
import { ArrowDownIcon, ArrowUpIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

const TransactionList: React.FC = () => {
  const { isReady } = useEncryption();
  
  const { data: transactions, isLoading, error, refetch } = useQuery({
    queryKey: ['transactions'],
    queryFn: transactionService.getTransactions,
    enabled: isReady,
    refetchInterval: 5000 // Refetch every 5 seconds
  });

  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircleIcon className="w-5 h-5 text-red-600" />;
      default:
        return <ClockIcon className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getTypeIcon = (type: Transaction['type']) => {
    return type === 'credit' 
      ? <ArrowUpIcon className="w-5 h-5 text-green-600" />
      : <ArrowDownIcon className="w-5 h-5 text-red-600" />;
  };

  const formatAmount = (amount: number, type: Transaction['type']) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
    
    return type === 'credit' ? `+${formatted}` : `-${formatted}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isReady) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Transactions</h2>
        <div className="text-center py-8 text-gray-500">
          Waiting for encryption to be ready...
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Transactions</h2>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Transactions</h2>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">Failed to load transactions</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Transactions</h2>
        <button
          onClick={() => refetch()}
          className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {transactions && transactions.length > 0 ? (
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {getTypeIcon(transaction.type)}
                  {getStatusIcon(transaction.status)}
                </div>
                
                <div>
                  <p className="font-medium text-gray-900">
                    {transaction.description}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatDate(transaction.createdAt)}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className={clsx(
                  'font-semibold',
                  {
                    'text-green-600': transaction.type === 'credit',
                    'text-red-600': transaction.type === 'debit'
                  }
                )}>
                  {formatAmount(transaction.amount, transaction.type)}
                </p>
                <p className={clsx(
                  'text-sm font-medium',
                  {
                    'text-green-600': transaction.status === 'completed',
                    'text-yellow-600': transaction.status === 'pending',
                    'text-red-600': transaction.status === 'failed'
                  }
                )}>
                  {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No transactions found
        </div>
      )}
    </div>
  );
};

export default TransactionList;