// server/src/controllers/userController.ts
import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { ResponseUtils } from '../utils/response_utils';

const userService = new UserService();

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await userService.getAllUsers();
    ResponseUtils.sendSuccess(res, users, 'Users retrieved successfully');
  } catch (error) {
    console.error('Error in getUsers controller:', error);
    ResponseUtils.sendError(res, 'Failed to retrieve users');
  }
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = parseInt(id, 10);

    const user = await userService.getUserById(userId);
    
    if (!user) {
      ResponseUtils.sendNotFound(res, 'User not found');
      return;
    }

    ResponseUtils.sendSuccess(res, user, 'User retrieved successfully');
  } catch (error) {
    console.error('Error in getUser controller:', error);
    
    if (error instanceof Error && error.message === 'Invalid user ID') {
      ResponseUtils.sendBadRequest(res, error.message);
      return;
    }

    ResponseUtils.sendError(res, 'Failed to retrieve user');
  }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userData = req.body;
    const newUser = await userService.createUser(userData);
    
    ResponseUtils.sendSuccess(res, newUser, 'User created successfully', 201);
  } catch (error) {
    console.error('Error in createUser controller:', error);
    
    if (error instanceof Error && error.message.includes('required')) {
      ResponseUtils.sendBadRequest(res, error.message);
      return;
    }

    ResponseUtils.sendError(res, 'Failed to create user');
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = parseInt(id, 10);
    const userData = req.body;

    const updatedUser = await userService.updateUser(userId, userData);
    
    if (!updatedUser) {
      ResponseUtils.sendNotFound(res, 'User not found');
      return;
    }

    ResponseUtils.sendSuccess(res, updatedUser, 'User updated successfully');
  } catch (error) {
    console.error('Error in updateUser controller:', error);
    
    if (error instanceof Error && error.message === 'Invalid user ID') {
      ResponseUtils.sendBadRequest(res, error.message);
      return;
    }

    ResponseUtils.sendError(res, 'Failed to update user');
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = parseInt(id, 10);

    const deleted = await userService.deleteUser(userId);
    
    if (!deleted) {
      ResponseUtils.sendNotFound(res, 'User not found');
      return;
    }

    ResponseUtils.sendSuccess(res, null, 'User deleted successfully');
  } catch (error) {
    console.error('Error in deleteUser controller:', error);
    
    if (error instanceof Error && error.message === 'Invalid user ID') {
      ResponseUtils.sendBadRequest(res, error.message);
      return;
    }

    ResponseUtils.sendError(res, 'Failed to delete user');
  }
};