// src/features/user/hooks/useUsers.js

import { useState, useEffect, useCallback } from 'react';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  seedAdmin,
} from '../api/user.api';

export function useUsers() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllUsers();
      setUsers(data.users || data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, loading, error, refetch: fetchUsers };
}

export function useUpdateUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const update = async (id, payload) => {
    try {
      setLoading(true);
      setError(null);
      const data = await updateUser(id, payload);
      return data.user || data;
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error };
}

export function useDeleteUser() {
  const [loading, setLoading] = useState(false);

  const remove = async (id) => {
    try {
      setLoading(true);
      await deleteUser(id);
    } finally {
      setLoading(false);
    }
  };

  return { remove, loading };
}

export function useSeedAdmin() {
  const [loading, setLoading] = useState(false);

  const seed = async () => {
    try {
      setLoading(true);
      await seedAdmin();
    } finally {
      setLoading(false);
    }
  };

  return { seed, loading };
}