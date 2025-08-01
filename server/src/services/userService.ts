// server/src/services/userService.ts
import { UserModel } from '../models';
import { User } from '../types'; // Assuming you have a User type
import { CreateUserRequest } from '../types';

export class UserService {
  async getAllUsers(): Promise<User[]> {
    try {
      return await UserModel.findAll();
    } catch (error) {
      console.error('Error in UserService.getAllUsers:', error);
      throw new Error('Failed to retrieve users');
    }
  }

  async getUserById(id: number): Promise<User | null> {
    try {
      if (isNaN(id) || id <= 0) {
        throw new Error('Invalid user ID');
      }

      return await UserModel.findById(id);
    } catch (error) {
      console.error('Error in UserService.getUserById:', error);
      
      // Re-throw validation errors as-is
      if (error instanceof Error && error.message === 'Invalid user ID') {
        throw error;
      }
      
      // Wrap database errors
      throw new Error('Failed to retrieve user');
    }
  }

  async createUser(userData: Partial<CreateUserRequest>): Promise<User> {
    try {
      // Add validation logic here
      if (
        !userData.username ||
        !userData.email ||
        !userData.firstName ||
        !userData.lastName ||
        !userData.password
      ) {
        throw new Error('Username, email, first name, last name, and password are required');
      }

      return await UserModel.create(userData as CreateUserRequest);
    } catch (error) {
      console.error('Error in UserService.createUser:', error);
      
      if (error instanceof Error && error.message.includes('required')) {
        throw error;
      }
      
      throw new Error('Failed to create user');
    }
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | null> {
    try {
      if (isNaN(id) || id <= 0) {
        throw new Error('Invalid user ID');
      }

      const existingUser = await UserModel.findById(id);
      if (!existingUser) {
        return null;
      }

      return await UserModel.update(id, userData);
    } catch (error) {
      console.error('Error in UserService.updateUser:', error);
      
      if (error instanceof Error && error.message === 'Invalid user ID') {
        throw error;
      }
      
      throw new Error('Failed to update user');
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      if (isNaN(id) || id <= 0) {
        throw new Error('Invalid user ID');
      }

      const existingUser = await UserModel.findById(id);
      if (!existingUser) {
        return false;
      }

      await UserModel.delete(id);
      return true;
    } catch (error) {
      console.error('Error in UserService.deleteUser:', error);
      
      if (error instanceof Error && error.message === 'Invalid user ID') {
        throw error;
      }
      
      throw new Error('Failed to delete user');
    }
  }
}