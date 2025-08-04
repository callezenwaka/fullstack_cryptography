// test/services/userService.test.ts
import { UserService } from '../../src/services/userService';
import { UserModel } from '../../src/models';
import { User, CreateUserRequest, UpdateUserRequest } from '../../src/types';

// Mock the UserModel
jest.mock('../../src/models', () => ({
  UserModel: {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockUserModel = UserModel as jest.Mocked<typeof UserModel>;

describe('UserService', () => {
  let userService: UserService;
  
  beforeEach(() => {
    userService = new UserService();
    jest.clearAllMocks();
    // Suppress console.error during tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getAllUsers', () => {
    it('should return all users successfully', async () => {
      const mockUsers: User[] = [
        { 
          id: 1, 
          username: 'user1', 
          email: 'user1@example.com', 
          firstName: 'John', 
          lastName: 'Doe',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        },
        { 
          id: 2, 
          username: 'user2', 
          email: 'user2@example.com', 
          firstName: 'Jane', 
          lastName: 'Smith',
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02')
        },
      ];
      mockUserModel.findAll.mockResolvedValue(mockUsers);

      const result = await userService.getAllUsers();

      expect(result).toEqual(mockUsers);
      expect(mockUserModel.findAll).toHaveBeenCalledTimes(1);
    });

    it('should throw error when database operation fails', async () => {
      mockUserModel.findAll.mockRejectedValue(new Error('Database connection failed'));

      await expect(userService.getAllUsers()).rejects.toThrow('Failed to retrieve users');
      expect(console.error).toHaveBeenCalledWith(
        'Error in UserService.getAllUsers:',
        expect.any(Error)
      );
    });
  });

  describe('getUserById', () => {
    it('should return user when valid ID is provided', async () => {
      const mockUser: User = { 
        id: 1, 
        username: 'testuser', 
        email: 'test@example.com', 
        firstName: 'Test', 
        lastName: 'User',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      };
      mockUserModel.findById.mockResolvedValue(mockUser);

      const result = await userService.getUserById(1);

      expect(result).toEqual(mockUser);
      expect(mockUserModel.findById).toHaveBeenCalledWith(1);
    });

    it('should return null when user not found', async () => {
      mockUserModel.findById.mockResolvedValue(null);

      const result = await userService.getUserById(999);

      expect(result).toBeNull();
      expect(mockUserModel.findById).toHaveBeenCalledWith(999);
    });

    it('should throw error for invalid ID (NaN)', async () => {
      await expect(userService.getUserById(NaN)).rejects.toThrow('Invalid user ID');
      expect(mockUserModel.findById).not.toHaveBeenCalled();
    });

    it('should throw error for invalid ID (zero)', async () => {
      await expect(userService.getUserById(0)).rejects.toThrow('Invalid user ID');
      expect(mockUserModel.findById).not.toHaveBeenCalled();
    });

    it('should throw error for invalid ID (negative)', async () => {
      await expect(userService.getUserById(-1)).rejects.toThrow('Invalid user ID');
      expect(mockUserModel.findById).not.toHaveBeenCalled();
    });

    it('should wrap database errors', async () => {
      mockUserModel.findById.mockRejectedValue(new Error('Database error'));

      await expect(userService.getUserById(1)).rejects.toThrow('Failed to retrieve user');
    });
  });

  describe('createUser', () => {
    const validUserData: CreateUserRequest = {
      username: 'newuser',
      email: 'new@example.com',
      firstName: 'New',
      lastName: 'User',
      password: 'password123',
    };

    it('should create user with valid data', async () => {
      const mockCreatedUser: User = { 
        id: 1, 
        ...validUserData,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      };
      mockUserModel.create.mockResolvedValue(mockCreatedUser);

      const result = await userService.createUser(validUserData);

      expect(result).toEqual(mockCreatedUser);
      expect(mockUserModel.create).toHaveBeenCalledWith(validUserData);
    });

    it('should throw error when username is missing', async () => {
      const invalidData = { ...validUserData, username: undefined };

      await expect(userService.createUser(invalidData)).rejects.toThrow(
        'Username, email, first name, last name, and password are required'
      );
      expect(mockUserModel.create).not.toHaveBeenCalled();
    });

    it('should throw error when email is missing', async () => {
      const invalidData = { ...validUserData, email: undefined };

      await expect(userService.createUser(invalidData)).rejects.toThrow(
        'Username, email, first name, last name, and password are required'
      );
    });

    it('should throw error when firstName is missing', async () => {
      const invalidData = { ...validUserData, firstName: undefined };

      await expect(userService.createUser(invalidData)).rejects.toThrow(
        'Username, email, first name, last name, and password are required'
      );
    });

    it('should throw error when lastName is missing', async () => {
      const invalidData = { ...validUserData, lastName: undefined };

      await expect(userService.createUser(invalidData)).rejects.toThrow(
        'Username, email, first name, last name, and password are required'
      );
    });

    it('should throw error when password is missing', async () => {
      const invalidData = { ...validUserData, password: undefined };

      await expect(userService.createUser(invalidData)).rejects.toThrow(
        'Username, email, first name, last name, and password are required'
      );
    });

    it('should wrap database errors', async () => {
      mockUserModel.create.mockRejectedValue(new Error('Unique constraint violation'));

      await expect(userService.createUser(validUserData)).rejects.toThrow('Failed to create user');
    });
  });

  describe('updateUser', () => {
    const updateData: UpdateUserRequest = { firstName: 'Updated', lastName: 'Name' };
    const existingUser: User = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      firstName: 'Original',
      lastName: 'Name',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    };

    it('should update user successfully', async () => {
      const updatedUser = { 
        ...existingUser, 
        ...updateData,
        updatedAt: new Date('2024-01-02') // Simulate updated timestamp
      };
      mockUserModel.findById.mockResolvedValue(existingUser);
      mockUserModel.update.mockResolvedValue(updatedUser);

      const result = await userService.updateUser(1, updateData);

      expect(result).toEqual(updatedUser);
      expect(mockUserModel.findById).toHaveBeenCalledWith(1);
      expect(mockUserModel.update).toHaveBeenCalledWith(1, updateData);
    });

    it('should return null when user does not exist', async () => {
      mockUserModel.findById.mockResolvedValue(null);

      const result = await userService.updateUser(999, updateData);

      expect(result).toBeNull();
      expect(mockUserModel.update).not.toHaveBeenCalled();
    });

    it('should throw error for invalid ID', async () => {
      await expect(userService.updateUser(-1, updateData)).rejects.toThrow('Invalid user ID');
      expect(mockUserModel.findById).not.toHaveBeenCalled();
    });

    it('should wrap database errors', async () => {
      mockUserModel.findById.mockRejectedValue(new Error('Database error'));

      await expect(userService.updateUser(1, updateData)).rejects.toThrow('Failed to update user');
    });
  });

  describe('deleteUser', () => {
    const existingUser: User = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    };

    it('should delete user successfully', async () => {
      mockUserModel.findById.mockResolvedValue(existingUser);
      mockUserModel.delete.mockResolvedValue(true);

      const result = await userService.deleteUser(1);

      expect(result).toBe(true);
      expect(mockUserModel.findById).toHaveBeenCalledWith(1);
      expect(mockUserModel.delete).toHaveBeenCalledWith(1);
    });

    it('should return false when user does not exist', async () => {
      mockUserModel.findById.mockResolvedValue(null);

      const result = await userService.deleteUser(999);

      expect(result).toBe(false);
      expect(mockUserModel.delete).not.toHaveBeenCalled();
    });

    it('should throw error for invalid ID', async () => {
      await expect(userService.deleteUser(0)).rejects.toThrow('Invalid user ID');
      expect(mockUserModel.findById).not.toHaveBeenCalled();
    });

    it('should wrap database errors', async () => {
      mockUserModel.findById.mockRejectedValue(new Error('Database error'));

      await expect(userService.deleteUser(1)).rejects.toThrow('Failed to delete user');
    });
  });
});