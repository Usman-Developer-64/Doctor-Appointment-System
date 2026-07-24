'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Users,
  ShieldAlert,
  Loader2,
  Ban,
  CheckCircle,
  AlertTriangle,
  Trash2,
  ChevronDown,
} from 'lucide-react';
import { User } from '@/types';

type UserFilter = 'all' | 'admin' | 'doctor' | 'patient' | 'blocked';

export default function UserManagementPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [activeFilter, setActiveFilter] = useState<UserFilter>('all');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Role dropdown
  const [roleDropdownId, setRoleDropdownId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const params: Record<string, string> = {};
      if (activeFilter === 'admin' || activeFilter === 'doctor' || activeFilter === 'patient') {
        params.role = activeFilter;
      } else if (activeFilter === 'blocked') {
        params.isBlocked = 'true';
      }

      const response = await api.get('/users', { params });
      setUsers(response.data.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to retrieve platform users.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchUsers();
    }
  }, [currentUser, fetchUsers]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = () => {
      setRoleDropdownId(null);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  if (!currentUser) return null;

  if (currentUser.role !== 'admin') {
    return (
      <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-6 max-w-2xl mx-auto text-center">
        <h2 className="text-xl font-bold text-destructive mb-2">Access Denied</h2>
        <p className="text-muted-foreground">
          Only administrators are allowed to manage platform users.
        </p>
      </div>
    );
  }

  const handleToggleBlock = async (userId: string) => {
    setActionLoadingId(userId);
    try {
      const response = await api.patch(`/users/${userId}/block`);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? response.data.data : u))
      );
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to toggle user block status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleVerifyDoctor = async (userId: string) => {
    setActionLoadingId(userId);
    try {
      const response = await api.patch(`/users/${userId}/verify`);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? response.data.data : u))
      );
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to verify doctor.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    setActionLoadingId(userId);
    setRoleDropdownId(null);
    try {
      const response = await api.patch(`/users/${userId}/role`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? response.data.data : u))
      );
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to change user role.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setActionLoadingId(userId);
    setDeleteConfirmId(null);
    try {
      await api.delete(`/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete user.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const isSelf = (userId: string) => currentUser._id === userId;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Users className="h-8 w-8 text-primary" />
          User Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitor user accounts, change roles, block/unblock, verify doctors, and remove users.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-4">
        {[
          { label: 'All Users', filter: 'all' },
          { label: 'Admins', filter: 'admin' },
          { label: 'Doctors', filter: 'doctor' },
          { label: 'Patients', filter: 'patient' },
          { label: 'Blocked', filter: 'blocked' },
        ].map((item) => (
          <Button
            key={item.filter}
            variant={activeFilter === item.filter ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter(item.filter as UserFilter)}
            className="rounded-lg"
          >
            {item.label}
          </Button>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center py-10 bg-destructive/10 border border-destructive/20 text-destructive rounded-2xl flex items-center justify-center gap-3">
          <ShieldAlert className="h-5 w-5" />
          {error}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-2xl shadow-sm">
          <h3 className="font-bold text-lg">No Users Found</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            We couldn&apos;t find any users matching this query.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((item) => {
                  const initials = `${item.firstName.charAt(0)}${item.lastName.charAt(0)}`.toUpperCase();
                  return (
                    <tr
                      key={item._id}
                      className={`${item.isBlocked ? 'bg-red-500/5 opacity-80' : 'bg-card'} ${isSelf(item._id) ? 'ring-1 ring-primary/20' : ''}`}
                    >
                      {/* Name */}
                      <td className="px-6 py-4 font-medium text-foreground">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                            {initials}
                          </div>
                          <div>
                            {item.firstName} {item.lastName}
                            {isSelf(item._id) && (
                              <span className="ml-2 text-xs text-primary font-semibold">(You)</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 text-muted-foreground">{item.email}</td>

                      {/* Role Badge with Dropdown */}
                      <td className="px-6 py-4">
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isSelf(item._id)) return;
                              setRoleDropdownId(roleDropdownId === item._id ? null : item._id);
                            }}
                            disabled={isSelf(item._id) || actionLoadingId === item._id}
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize transition-all ${
                              item.role === 'admin'
                                ? 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                                : item.role === 'doctor'
                                  ? 'bg-teal-100 text-teal-700 dark:bg-teal-950/30 dark:text-teal-400'
                                  : 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400'
                            } ${!isSelf(item._id) ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                          >
                            {item.role}
                            {!isSelf(item._id) && <ChevronDown className="h-3 w-3" />}
                          </button>

                          {/* Role Dropdown */}
                          {roleDropdownId === item._id && (
                            <div
                              className="absolute left-0 top-full mt-1 z-50 w-36 rounded-xl border border-border bg-card shadow-xl py-1 animate-fade-in"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {['admin', 'doctor', 'patient'].map((role) => (
                                <button
                                  key={role}
                                  onClick={() => handleChangeRole(item._id, role)}
                                  disabled={item.role === role}
                                  className={`w-full text-left px-4 py-2 text-sm capitalize transition-colors ${
                                    item.role === role
                                      ? 'bg-muted/50 text-muted-foreground cursor-default font-semibold'
                                      : 'hover:bg-muted/50 text-foreground'
                                  }`}
                                >
                                  {role}
                                  {role === 'admin' && <span className="text-xs text-muted-foreground ml-1">(Sub-Admin)</span>}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          {item.isBlocked ? (
                            <span className="text-red-600 dark:text-red-400 font-semibold text-xs flex items-center gap-1">
                              <Ban className="h-3.5 w-3.5" />
                              Blocked
                            </span>
                          ) : item.role === 'doctor' ? (
                            item.isVerified ? (
                              <span className="text-green-600 dark:text-green-400 font-semibold text-xs flex items-center gap-1">
                                <CheckCircle className="h-3.5 w-3.5" />
                                Verified
                              </span>
                            ) : (
                              <span className="text-amber-600 dark:text-amber-400 font-semibold text-xs flex items-center gap-1">
                                <AlertTriangle className="h-3.5 w-3.5" />
                                Unverified
                              </span>
                            )
                          ) : (
                            <span className="text-green-600 dark:text-green-400 font-semibold text-xs flex items-center gap-1">
                              <CheckCircle className="h-3.5 w-3.5" />
                              Active
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        {isSelf(item._id) ? (
                          <span className="text-xs text-muted-foreground italic">No actions</span>
                        ) : (
                          <div className="flex justify-end gap-2">
                            {/* Verify Doctor */}
                            {item.role === 'doctor' && !item.isVerified && !item.isBlocked && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleVerifyDoctor(item._id)}
                                disabled={actionLoadingId === item._id}
                                className="text-green-600 hover:text-green-700 border-green-200 hover:bg-green-50"
                              >
                                Verify
                              </Button>
                            )}

                            {/* Block/Unblock */}
                            <Button
                              size="sm"
                              variant={item.isBlocked ? 'default' : 'outline'}
                              onClick={() => handleToggleBlock(item._id)}
                              disabled={actionLoadingId === item._id}
                              className={
                                !item.isBlocked
                                  ? 'text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50'
                                  : 'bg-red-600 hover:bg-red-700 text-white border-transparent'
                              }
                            >
                              {actionLoadingId === item._id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : item.isBlocked ? (
                                'Unblock'
                              ) : (
                                'Block'
                              )}
                            </Button>

                            {/* Delete */}
                            {deleteConfirmId === item._id ? (
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleDeleteUser(item._id)}
                                  disabled={actionLoadingId === item._id}
                                  className="bg-red-600 hover:bg-red-700 text-white text-xs"
                                >
                                  {actionLoadingId === item._id ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    'Confirm'
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="text-xs"
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setDeleteConfirmId(item._id)}
                                disabled={actionLoadingId === item._id}
                                className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                                title="Delete user permanently"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
    </div>
  );
}
