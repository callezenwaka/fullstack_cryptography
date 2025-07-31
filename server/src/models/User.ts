import { query } from '../config/database';
import { User, CreateUserRequest, UpdateUserRequest } from '../types';
import * as bcrypt from 'bcrypt';

export class UserModel {
  static async findAll(): Promise<User[]> {
    const result = await query(`
      SELECT id, username, email, first_name as "firstName", 
             last_name as "lastName", created_at as "createdAt", 
             updated_at as "updatedAt"
      FROM users 
      ORDER BY created_at DESC
    `);
    return result.rows;
  }

  static async findById(id: number): Promise<User | null> {
    const result = await query(`
      SELECT id, username, email, first_name as "firstName", 
             last_name as "lastName", created_at as "createdAt", 
             updated_at as "updatedAt"
      FROM users 
      WHERE id = $1
    `, [id]);
    
    return result.rows[0] || null;
  }

  static async findByUsername(username: string): Promise<User | null> {
    const result = await query(`
      SELECT id, username, email, first_name as "firstName", 
             last_name as "lastName", created_at as "createdAt", 
             updated_at as "updatedAt"
      FROM users 
      WHERE username = $1
    `, [username]);
    
    return result.rows[0] || null;
  }

  static async create(userData: CreateUserRequest): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const result = await query(`
      INSERT INTO users (username, email, first_name, last_name, password_hash)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, username, email, first_name as "firstName", 
                last_name as "lastName", created_at as "createdAt", 
                updated_at as "updatedAt"
    `, [userData.username, userData.email, userData.firstName, userData.lastName, hashedPassword]);
    
    return result.rows[0];
  }

  static async update(id: number, userData: UpdateUserRequest): Promise<User | null> {
    const setClause = Object.keys(userData)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    if (!setClause) return null;

    const result = await query(`
      UPDATE users 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, username, email, first_name as "firstName", 
                last_name as "lastName", created_at as "createdAt", 
                updated_at as "updatedAt"
    `, [id, ...Object.values(userData)]);
    
    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await query('DELETE FROM users WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }
}