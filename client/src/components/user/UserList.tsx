import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { useEncryption } from '@/hooks/useEncryption';
import { User } from '@/types/user';
import { UserIcon } from '@heroicons/react/24/outline';

const UserList: React.FC = () => {
  const { isReady } = useEncryption();
  
  const { data: response, isLoading, error, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiService.get<User[]>('/users'),
    enabled: isReady
  });

  const users = response?.data || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isReady) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Users</h2>
        <div className="text-center py-8 text-gray-500">
          Waiting for encryption to be ready...
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Users</h2>
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
        <h2 className="text-xl font-semibent text-gray-800 mb-4">Users</h2>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">Failed to load users</p>
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
        <h2 className="text-xl font-semibold text-gray-800">Users</h2>
        <button
          onClick={() => refetch()}
          className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {users.length > 0 ? (
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-gray-800">
                  <UserIcon className="w-6 h-6 text-primary-600" />
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </h3>
                  <span className="text-sm text-gray-500">@{user.username}</span>
                </div>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>

              <div className="text-right text-sm text-gray-500">
                <p>ID: {user.id}</p>
                <p>Joined {formatDate(user.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No users found
        </div>
      )}
    </div>
  );
};

export default UserList;