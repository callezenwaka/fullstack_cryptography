import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateTransactionRequest } from '@/types/transaction';
import { transactionService } from '@/services/transactionService';
import { useEncryption } from '@/hooks/useEncryption';
import { toast } from 'react-hot-toast';
import clsx from 'clsx';

const TransactionForm: React.FC = () => {
  const queryClient = useQueryClient();
  const { isReady } = useEncryption();
  
  const [formData, setFormData] = useState<CreateTransactionRequest>({
    userId: 1,
    amount: 0,
    type: 'credit',
    description: ''
  });

  const createTransactionMutation = useMutation({
    mutationFn: transactionService.createTransaction,
    onSuccess: () => {
      toast.success('Transaction created successfully!');
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setFormData({
        userId: 1,
        amount: 0,
        type: 'credit',
        description: ''
      });
    },
    onError: (error: Error) => {
      toast.error(`Failed to create transaction: ${error.message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isReady) {
      toast.error('Encryption not ready');
      return;
    }

    if (formData.amount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }

    createTransactionMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' || name === 'userId' ? Number(value) : value
    }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Create New Transaction</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4 text-gray-800">
        <div>
          <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
            User ID
          </label>
          <input
            type="number"
            id="userId"
            name="userId"
            value={formData.userId}
            onChange={handleChange}
            min="1"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            min="0.01"
            step="0.01"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
          </select>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter transaction description..."
          />
        </div>

        <button
          type="submit"
          disabled={!isReady || createTransactionMutation.isPending}
          className={clsx(
            'w-full py-2 px-4 rounded-md font-medium transition-colors',
            {
              'bg-[#053d22] text-white hover:bg-[#224031]': isReady && !createTransactionMutation.isPending,
              'bg-gray-300 text-gray-500 cursor-not-allowed': !isReady || createTransactionMutation.isPending
            }
          )}
        >
          {createTransactionMutation.isPending ? 'Creating...' : 'Create Transaction'}
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;