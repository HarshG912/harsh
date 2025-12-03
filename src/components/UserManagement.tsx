import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, Pencil } from 'lucide-react';
import { usePlanLimits } from '@/hooks/use-plan-limits';

interface UserManagementProps {
  tenantId: string;
}

export const UserManagement = ({ tenantId }: UserManagementProps) => {
  const queryClient = useQueryClient();
  const { planConfig, usage, canAddRole } = usePlanLimits(tenantId);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'waiter' as 'chef' | 'manager' | 'waiter' | 'tenant_admin',
  });
  const [editUser, setEditUser] = useState<{
    user_id: string;
    email: string;
    password: string;
    full_name: string;
    role: 'chef' | 'manager' | 'waiter' | 'tenant_admin';
  } | null>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ['tenant-users', tenantId],
    queryFn: async () => {
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('tenant_id', tenantId);

      if (rolesError) throw rolesError;
      
      return roles || [];
    },
  });

  const addUserMutation = useMutation({
    mutationFn: async () => {
      if (!canAddRole(newUser.role)) {
        throw new Error(`You've reached the maximum ${newUser.role}s for your ${planConfig.name}. Please upgrade your plan.`);
      }

      // Call edge function to create user
      const { data, error } = await supabase.functions.invoke('create-tenant-user', {
        body: {
          email: newUser.email,
          password: newUser.password,
          full_name: newUser.full_name,
          role: newUser.role,
          tenant_id: tenantId,
        },
      });

      if (error) {
        throw new Error(data?.error || 'Failed to create user');
      }
      if (data?.error) {
        throw new Error(data.error);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-users', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['plan-usage', tenantId] });
      toast({
        title: 'User added successfully',
        description: 'The new user has been created and assigned to your restaurant.',
      });
      setShowAddForm(false);
      setNewUser({ email: '', password: '', full_name: '', role: 'waiter' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to add user',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async () => {
      if (!editUser) throw new Error('No user selected for update');

      const { data, error } = await supabase.functions.invoke('update-tenant-user', {
        body: {
          user_id: editUser.user_id,
          email: editUser.email,
          password: editUser.password || undefined,
          full_name: editUser.full_name,
          role: editUser.role,
          tenant_id: tenantId,
        },
      });

      if (error) {
        throw new Error(data?.error || 'Failed to update user');
      }
      if (data?.error) {
        throw new Error(data.error);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-users', tenantId] });
      toast({
        title: 'User updated successfully',
        description: 'The user details have been updated.',
      });
      setShowEditForm(false);
      setEditUser(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update user',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('tenant_id', tenantId);

      if (roleError) throw roleError;

      // Note: We don't delete the user from auth.users as they might have roles in other tenants
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-users', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['plan-usage', tenantId] });
      toast({
        title: 'User removed',
        description: 'The user has been removed from your restaurant.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to remove user',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  if (isLoading) {
    return <Loader2 className="h-8 w-8 animate-spin" />;
  }

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Manage staff members for your restaurant
              {usage && (
                <span className="block mt-1 text-xs">
                  Current usage: {usage.chefs} chef(s), {usage.managers} manager(s), {usage.waiters} waiter(s)
                </span>
              )}
            </CardDescription>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {showAddForm && (
          <Card className="bg-muted/50">
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={newUser.full_name}
                    onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="john@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="Min 6 characters"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={newUser.role} onValueChange={(value: any) => setNewUser({ ...newUser, role: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tenant_admin">Tenant Admin</SelectItem>
                      {planConfig.limits.allowedRoles.includes('chef') && (
                        <SelectItem value="chef">Chef</SelectItem>
                      )}
                      {planConfig.limits.allowedRoles.includes('manager') && (
                        <SelectItem value="manager">Manager</SelectItem>
                      )}
                      {planConfig.limits.allowedRoles.includes('waiter') && (
                        <SelectItem value="waiter">Waiter</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => addUserMutation.mutate()} disabled={addUserMutation.isPending}>
                  {addUserMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Add User
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users && users.length > 0 ? (
              users.map((user: any) => (
                <TableRow key={user.user_id}>
                  <TableCell>{user.name || 'N/A'}</TableCell>
                  <TableCell>{user.email || 'N/A'}</TableCell>
                  <TableCell className="capitalize">{user.role}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setEditUser({
                            user_id: user.user_id,
                            email: user.email || '',
                            password: '',
                            full_name: user.name || '',
                            role: user.role as 'chef' | 'manager' | 'waiter',
                          });
                          setShowEditForm(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove User</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove this user from your restaurant?
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteUserMutation.mutate(user.user_id)}
                              className="bg-destructive text-destructive-foreground"
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No users found. Add your first staff member to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    {/* Edit User Dialog */}
    <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update User</DialogTitle>
          <DialogDescription>
            Update user details and credentials. Leave password empty to keep current password.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-name">Full Name</Label>
            <Input
              id="edit-name"
              value={editUser?.full_name || ''}
              onChange={(e) => setEditUser(prev => prev ? { ...prev, full_name: e.target.value } : null)}
              placeholder="Enter full name"
            />
          </div>
          <div>
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
              type="email"
              value={editUser?.email || ''}
              onChange={(e) => setEditUser(prev => prev ? { ...prev, email: e.target.value } : null)}
              placeholder="Enter email"
            />
          </div>
          <div>
            <Label htmlFor="edit-password">Password (optional)</Label>
            <Input
              id="edit-password"
              type="password"
              value={editUser?.password || ''}
              onChange={(e) => setEditUser(prev => prev ? { ...prev, password: e.target.value } : null)}
              placeholder="Leave empty to keep current"
            />
          </div>
          <div>
            <Label htmlFor="edit-role">Role</Label>
            <Select
              value={editUser?.role || 'waiter'}
              onValueChange={(value: 'chef' | 'manager' | 'waiter' | 'tenant_admin') =>
                setEditUser(prev => prev ? { ...prev, role: value } : null)
              }
            >
              <SelectTrigger id="edit-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tenant_admin">Tenant Admin</SelectItem>
                <SelectItem value="waiter">Waiter</SelectItem>
                <SelectItem value="chef">Chef</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowEditForm(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => updateUserMutation.mutate()}
            disabled={updateUserMutation.isPending}
          >
            {updateUserMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Update User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
};
