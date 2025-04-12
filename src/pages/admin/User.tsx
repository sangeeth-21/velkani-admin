import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Plus, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  sno: string;
  uid: string;
  name: string;
  number: string;
  created_at: string;
  updated_at: string;
}

const API_BASE_URL = "https://srivelkanistore.site/api/user.php";

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form states
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [editName, setEditName] = useState('');
  const [editNumber, setEditNumber] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}?action=get_users`);
      const data = await response.json();
      
      if (data.status === "success") {
        setUsers(data.data);
      } else {
        setError('Failed to fetch users');
        toast.error('Failed to fetch users');
      }
    } catch (err) {
      setError('Error fetching users');
      toast.error('Error fetching users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !number) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'add_user',
          name,
          number
        }),
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        toast.success('User added successfully');
        fetchUsers();
        setIsAddDialogOpen(false);
        setName('');
        setNumber('');
      } else {
        toast.error(data.message || 'Failed to add user');
      }
    } catch (err) {
      toast.error('Error adding user');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editName || !editNumber) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_user',
          uid: currentUserId,
          name: editName,
          number: editNumber
        }),
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        toast.success('User updated successfully');
        fetchUsers();
        setIsEditDialogOpen(false);
      } else {
        toast.error(data.message || 'Failed to update user');
      }
    } catch (err) {
      toast.error('Error updating user');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete_user',
          uid: currentUserId
        }),
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        toast.success('User deleted successfully');
        fetchUsers();
        setIsDeleteDialogOpen(false);
      } else {
        toast.error(data.message || 'Failed to delete user');
      }
    } catch (err) {
      toast.error('Error deleting user');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (user: User) => {
    setCurrentUserId(user.uid);
    setEditName(user.name);
    setEditNumber(user.number);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (userId: string) => {
    setCurrentUserId(userId);
    setIsDeleteDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter user name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="number">Phone Number</Label>
                <Input
                  id="number"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  placeholder="Enter phone number"
                  required
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Adding...' : 'Add User'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Total Users</h3>
          <p className="text-2xl font-bold">{users.length}</p>
        </div>
      </div>

      <div className="mt-6">
        {loading && users.length === 0 ? (
          <p>Loading users...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : users.length === 0 ? (
          <p>No users found</p>
        ) : (
          <div className="rounded-md border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Updated At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.uid}>
                    <TableCell>{user.sno}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.number}</TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                    <TableCell>{formatDate(user.updated_at)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(user)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => openDeleteDialog(user.uid)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter user name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-number">Phone Number</Label>
              <Input
                id="edit-number"
                value={editNumber}
                onChange={(e) => setEditNumber(e.target.value)}
                placeholder="Enter phone number"
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update User'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this user? This action cannot be undone.</p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={handleDeleteUser}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}