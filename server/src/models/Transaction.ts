import { query } from '../config/database';
import { Transaction, CreateTransactionRequest, UpdateTransactionRequest } from '../types/transaction';

export class TransactionModel {
  static async findAll(): Promise<Transaction[]> {
    const result = await query(`
      SELECT id, user_id as "userId", amount, type, description, status,
             created_at as "createdAt", updated_at as "updatedAt"
      FROM transactions 
      ORDER BY created_at DESC
    `);
    return result.rows;
  }

  static async findById(id: number): Promise<Transaction | null> {
    const result = await query(`
      SELECT id, user_id as "userId", amount, type, description, status,
             created_at as "createdAt", updated_at as "updatedAt"
      FROM transactions 
      WHERE id = $1
    `, [id]);
    
    return result.rows[0] || null;
  }

  static async findByUserId(userId: number): Promise<Transaction[]> {
    const result = await query(`
      SELECT id, user_id as "userId", amount, type, description, status,
             created_at as "createdAt", updated_at as "updatedAt"
      FROM transactions 
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [userId]);
    
    return result.rows;
  }

  static async create(transactionData: CreateTransactionRequest): Promise<Transaction> {
    const result = await query(`
      INSERT INTO transactions (user_id, amount, type, description, status)
      VALUES ($1, $2, $3, $4, 'pending')
      RETURNING id, user_id as "userId", amount, type, description, status,
                created_at as "createdAt", updated_at as "updatedAt"
    `, [transactionData.userId, transactionData.amount, transactionData.type, transactionData.description]);
    
    return result.rows[0];
  }

  static async update(id: number, transactionData: UpdateTransactionRequest): Promise<Transaction | null> {
    const setClause = Object.keys(transactionData)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    if (!setClause) return null;

    const result = await query(`
      UPDATE transactions 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, user_id as "userId", amount, type, description, status,
                created_at as "createdAt", updated_at as "updatedAt"
    `, [id, ...Object.values(transactionData)]);
    
    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await query('DELETE FROM transactions WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  static async updateStatus(id: number, status: 'pending' | 'completed' | 'failed'): Promise<Transaction | null> {
    const result = await query(`
      UPDATE transactions 
      SET status = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, user_id as "userId", amount, type, description, status,
                created_at as "createdAt", updated_at as "updatedAt"
    `, [id, status]);
    
    return result.rows[0] || null;
  }
}