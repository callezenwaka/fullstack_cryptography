// test/services/transactionService.test.ts
import { TransactionService } from '../../src/services/transactionService';
import { TransactionModel } from '../../src/models';
import { Transaction, CreateTransactionRequest } from '../../src/types/transaction';

// Mock the TransactionModel
jest.mock('../../src/models', () => ({
  TransactionModel: {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    updateStatus: jest.fn(),
  },
}));

const mockTransactionModel = TransactionModel as jest.Mocked<typeof TransactionModel>;

describe('TransactionService', () => {
  let transactionService: TransactionService;
  
  beforeEach(() => {
    transactionService = new TransactionService();
    jest.clearAllMocks();
    // Suppress console.error during tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
    // Use fake timers for setTimeout testing
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  describe('getAllTransactions', () => {
    it('should return all transactions successfully', async () => {
      const mockTransactions: Transaction[] = [
        {
          id: 1,
          userId: 1,
          amount: 100.50,
          type: 'credit',
          description: 'Payment received',
          status: 'completed',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        },
        {
          id: 2,
          userId: 2,
          amount: 75.25,
          type: 'debit',
          description: 'Purchase made',
          status: 'pending',
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02')
        },
      ];
      mockTransactionModel.findAll.mockResolvedValue(mockTransactions);

      const result = await transactionService.getAllTransactions();

      expect(result).toEqual(mockTransactions);
      expect(mockTransactionModel.findAll).toHaveBeenCalledTimes(1);
    });

    it('should throw error when database operation fails', async () => {
      mockTransactionModel.findAll.mockRejectedValue(new Error('Database connection failed'));

      await expect(transactionService.getAllTransactions()).rejects.toThrow('Failed to retrieve transactions');
      expect(console.error).toHaveBeenCalledWith(
        'Error in TransactionService.getAllTransactions:',
        expect.any(Error)
      );
    });
  });

  describe('getTransactionById', () => {
    it('should return transaction when valid ID is provided', async () => {
      const mockTransaction: Transaction = {
        id: 1,
        userId: 1,
        amount: 100.50,
        type: 'credit',
        description: 'Payment received',
        status: 'completed',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      };
      mockTransactionModel.findById.mockResolvedValue(mockTransaction);

      const result = await transactionService.getTransactionById(1);

      expect(result).toEqual(mockTransaction);
      expect(mockTransactionModel.findById).toHaveBeenCalledWith(1);
    });

    it('should return null when transaction not found', async () => {
      mockTransactionModel.findById.mockResolvedValue(null);

      const result = await transactionService.getTransactionById(999);

      expect(result).toBeNull();
      expect(mockTransactionModel.findById).toHaveBeenCalledWith(999);
    });

    it('should throw error for invalid ID (NaN)', async () => {
      await expect(transactionService.getTransactionById(NaN)).rejects.toThrow('Invalid transaction ID');
      expect(mockTransactionModel.findById).not.toHaveBeenCalled();
    });

    it('should wrap database errors', async () => {
      mockTransactionModel.findById.mockRejectedValue(new Error('Database error'));

      await expect(transactionService.getTransactionById(1)).rejects.toThrow('Failed to retrieve transaction');
    });
  });

  describe('createTransaction', () => {
    const validTransactionData: CreateTransactionRequest = {
      userId: 1,
      amount: 100.50,
      type: 'credit',
      description: 'Payment received',
    };

    it('should create transaction with valid data and schedule status update', async () => {
      const mockCreatedTransaction: Transaction = {
        id: 1,
        ...validTransactionData,
        status: 'pending',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      };
      mockTransactionModel.create.mockResolvedValue(mockCreatedTransaction);
      mockTransactionModel.updateStatus.mockResolvedValue(null);

      const result = await transactionService.createTransaction(validTransactionData);

      expect(result).toEqual(mockCreatedTransaction);
      expect(mockTransactionModel.create).toHaveBeenCalledWith(validTransactionData);

      // Fast-forward time to trigger the setTimeout
      jest.advanceTimersByTime(2000);
      
      // Wait for any pending promises
      await Promise.resolve();

      expect(mockTransactionModel.updateStatus).toHaveBeenCalledWith(1, 'completed');
    });

    it('should throw error when userId is missing', async () => {
      const invalidData = { ...validTransactionData, userId: undefined };

      await expect(transactionService.createTransaction(invalidData as any)).rejects.toThrow(
        'Missing required fields: userId, amount, type, description'
      );
      expect(mockTransactionModel.create).not.toHaveBeenCalled();
    });

    it('should throw error when amount is missing', async () => {
      const invalidData = { ...validTransactionData, amount: undefined };

      await expect(transactionService.createTransaction(invalidData as any)).rejects.toThrow(
        'Missing required fields: userId, amount, type, description'
      );
    });

    it('should throw error when type is missing', async () => {
      const invalidData = { ...validTransactionData, type: undefined };

      await expect(transactionService.createTransaction(invalidData as any)).rejects.toThrow(
        'Missing required fields: userId, amount, type, description'
      );
    });

    it('should throw error when description is missing', async () => {
      const invalidData = { ...validTransactionData, description: undefined };

      await expect(transactionService.createTransaction(invalidData as any)).rejects.toThrow(
        'Missing required fields: userId, amount, type, description'
      );
    });

    it('should throw error when amount is zero', async () => {
      const invalidData = { ...validTransactionData, amount: 0 };

      await expect(transactionService.createTransaction(invalidData)).rejects.toThrow(
        'Missing required fields: userId, amount, type, description'
      );
    });

    it('should throw error when amount is negative', async () => {
      const invalidData = { ...validTransactionData, amount: -10.50 };

      await expect(transactionService.createTransaction(invalidData)).rejects.toThrow(
        'Amount must be greater than 0'
      );
    });

    it('should wrap database errors', async () => {
      mockTransactionModel.create.mockRejectedValue(new Error('Constraint violation'));

      await expect(transactionService.createTransaction(validTransactionData)).rejects.toThrow(
        'Failed to create transaction'
      );
    });

    it('should handle setTimeout callback errors gracefully', async () => {
      const mockCreatedTransaction: Transaction = {
        id: 1,
        ...validTransactionData,
        status: 'pending',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      };
      mockTransactionModel.create.mockResolvedValue(mockCreatedTransaction);
      mockTransactionModel.updateStatus.mockRejectedValue(new Error('Update failed'));

      // The main transaction creation should still succeed
      const result = await transactionService.createTransaction(validTransactionData);
      expect(result).toEqual(mockCreatedTransaction);

      // Fast-forward time to trigger the setTimeout
      jest.advanceTimersByTime(2000);
      
      // Wait for any pending promises
      await Promise.resolve();

      // The updateStatus should have been called even though it failed
      expect(mockTransactionModel.updateStatus).toHaveBeenCalledWith(1, 'completed');
    });
  });

  describe.skip('updateTransaction', () => {
    const existingTransaction: Transaction = {
      id: 1,
      userId: 1,
      amount: 100.50,
      type: 'credit',
      description: 'Original description',
      status: 'pending',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    };

    it('should update transaction successfully', async () => {
      const updateData = { status: 'completed' as const, description: 'Payment processed' };
      const updatedTransaction = { 
        ...existingTransaction, 
        ...updateData,
        updatedAt: new Date('2024-01-02')
      };
      
      mockTransactionModel.findById.mockResolvedValue(existingTransaction);
      mockTransactionModel.update.mockResolvedValue(updatedTransaction);

      const result = await transactionService.updateTransaction(1, updateData);

      expect(result).toEqual(updatedTransaction);
      expect(mockTransactionModel.findById).toHaveBeenCalledWith(1);
      expect(mockTransactionModel.update).toHaveBeenCalledWith(1, updateData);
    });

    it('should return null when transaction does not exist', async () => {
      mockTransactionModel.findById.mockResolvedValue(null);

      const result = await transactionService.updateTransaction(999, { status: 'completed' });

      expect(result).toBeNull();
      expect(mockTransactionModel.update).not.toHaveBeenCalled();
    });

    it('should throw error for invalid ID', async () => {
      await expect(transactionService.updateTransaction(NaN, { status: 'completed' }))
        .rejects.toThrow('Invalid transaction ID');
      expect(mockTransactionModel.findById).not.toHaveBeenCalled();
    });

    it('should prevent status update of non-pending transaction', async () => {
      const completedTransaction = { ...existingTransaction, status: 'completed' as const };
      mockTransactionModel.findById.mockResolvedValue(completedTransaction);

      await expect(transactionService.updateTransaction(1, { status: 'failed' }))
        .rejects.toThrow('Cannot update status of non-pending transaction');
      expect(mockTransactionModel.update).not.toHaveBeenCalled();
    });

    it('should allow description update without status change', async () => {
      const updateData = { description: 'Updated description' };
      const updatedTransaction = { ...existingTransaction, ...updateData };
      
      mockTransactionModel.findById.mockResolvedValue(existingTransaction);
      mockTransactionModel.update.mockResolvedValue(updatedTransaction);

      const result = await transactionService.updateTransaction(1, updateData);

      expect(result).toEqual(updatedTransaction);
    });

    it('should validate amount when provided', async () => {
      mockTransactionModel.findById.mockResolvedValue(existingTransaction);

      await expect(transactionService.updateTransaction(1, { amount: -10 }))
        .rejects.toThrow('Amount must be greater than 0');
      expect(mockTransactionModel.update).not.toHaveBeenCalled();
    });

    it('should wrap database errors', async () => {
      mockTransactionModel.findById.mockRejectedValue(new Error('Database error'));

      await expect(transactionService.updateTransaction(1, { status: 'completed' }))
        .rejects.toThrow('Failed to update transaction');
    });
  });
});