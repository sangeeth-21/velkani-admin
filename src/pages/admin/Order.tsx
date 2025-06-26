import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
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
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash2, Eye, User, Phone, Printer, Download } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface OrderItem {
  id: string;
  productname: string;
  productuid: string;
  orderuid: string;
  amount: string;
  weight: string;
  uid: string;
  created_at: string;
  updated_at: string;
}

interface Order {
  id: string;
  uiduser: string;
  date: string;
  time: string;
  amount: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

interface User {
  sno: number;
  uid: string;
  name: string;
  number: string;
  created_at: string;
  updated_at: string;
}

const API_BASE_URL = "https://api.specd.in/velkani";

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchOrders();
    fetchUsers();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/user.php?action=get_orders`);
      const data = await response.json();
      
      if (data.status === "success") {
        setOrders(data.data);
      } else {
        setError('Failed to fetch orders');
        console.error('Failed to fetch orders');
      }
    } catch (err) {
      setError('Error fetching orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/user.php?action=get_users`);
      const data = await response.json();
      
      if (data.status === "success") {
        setUsers(data.data);
      } else {
        console.error('Failed to fetch users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleDeleteOrder = async () => {
    if (!selectedOrder) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/user.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete_order',
          order_id: selectedOrder.id
        }),
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        console.log('Order deleted successfully');
        fetchOrders();
        setIsDeleteDialogOpen(false);
      } else {
        console.error(data.message || 'Failed to delete order');
      }
    } catch (err) {
      console.error('Error deleting order:', err);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteDialog = (order: Order) => {
    setSelectedOrder(order);
    setIsDeleteDialogOpen(true);
  };

  const openViewDialog = (order: Order) => {
    setSelectedOrder(order);
    // Find the corresponding user
    const user = users.find(u => u.uid === order.uiduser);
    setSelectedUser(user || null);
    setIsViewDialogOpen(true);
  };

  const openPrintPreview = (order: Order) => {
    setSelectedOrder(order);
    const user = users.find(u => u.uid === order.uiduser);
    setSelectedUser(user || null);
    setIsPrintPreviewOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.split('.')[0]; // Remove milliseconds if present
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(parseFloat(amount));
  };

  const getUserName = (uiduser: string) => {
    const user = users.find(u => u.uid === uiduser);
    return user ? user.name : 'Unknown User';
  };

  const handlePrintReceipt = () => {
    if (!receiptRef.current) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const receiptContent = receiptRef.current.innerHTML;
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print Receipt</title>
            <style>
              @media print {
                body {
                  width: 80mm;
                  margin: 0;
                  padding: 0;
                  font-family: 'Courier New', monospace;
                  font-size: 12px;
                }
                .receipt-container {
                  width: 100%;
                  padding: 5px;
                }
                .store-name {
                  text-align: center;
                  font-weight: bold;
                  font-size: 16px;
                  margin-bottom: 5px;
                }
                .store-name-english {
                  text-align: center;
                  font-size: 12px;
                  margin-bottom: 10px;
                }
                .divider {
                  border-top: 1px dashed #000;
                  margin: 5px 0;
                }
                .item-row {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 3px;
                }
                .total-row {
                  display: flex;
                  justify-content: space-between;
                  font-weight: bold;
                  margin-top: 5px;
                  border-top: 1px solid #000;
                  padding-top: 5px;
                }
                .footer {
                  text-align: center;
                  font-size: 10px;
                  margin-top: 10px;
                }
                .text-right {
                  text-align: right;
                }
                .text-center {
                  text-align: center;
                }
                .border-bottom {
                  border-bottom: 1px solid #000;
                  padding-bottom: 5px;
                  margin-bottom: 5px;
                }
              }
            </style>
          </head>
          <body onload="window.print(); window.close()">
            <div class="receipt-container">
              ${receiptContent}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleDownloadReceipt = () => {
    if (!receiptRef.current || !selectedOrder) return;

    const receiptContent = receiptRef.current.innerHTML;
    const fullHtmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - Order ${selectedOrder.id.substring(0, 8)}</title>
          <meta charset="UTF-8">
          <style>
            body {
              width: 80mm;
              margin: 0;
              padding: 20px;
              font-family: 'Courier New', monospace;
              font-size: 12px;
              background: white;
            }
            .receipt-container {
              width: 100%;
              padding: 5px;
            }
            .store-name {
              text-align: center;
              font-weight: bold;
              font-size: 16px;
              margin-bottom: 5px;
            }
            .store-name-english {
              text-align: center;
              font-size: 12px;
              margin-bottom: 10px;
            }
            .divider {
              border-top: 1px dashed #000;
              margin: 5px 0;
            }
            .item-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 3px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              font-weight: bold;
              margin-top: 5px;
              border-top: 1px solid #000;
              padding-top: 5px;
            }
            .footer {
              text-align: center;
              font-size: 10px;
              margin-top: 10px;
            }
            .text-right {
              text-align: right;
            }
            .text-center {
              text-align: center;
            }
            .border-bottom {
              border-bottom: 1px solid #000;
              padding-bottom: 5px;
              margin-bottom: 5px;
            }
            @media print {
              body { padding: 5px; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            ${receiptContent}
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([fullHtmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt-${selectedOrder.id.substring(0, 8)}-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const ReceiptComponent = () => (
    <div 
      ref={receiptRef} 
      className="bg-white p-2 w-[280px] mx-auto font-mono text-sm border"
      style={{ fontFamily: 'monospace' }}
    >
      <div className="text-center font-bold text-lg mb-2">ஸ்ரீ வேல்கணி ஸ்டோர்ஸ்</div>
      <div className="text-center text-xs mb-4">Shri Velkani Stores</div>
      
      <div className="border-t border-b border-black py-2 my-2 text-center">
        <div>Bill No: {selectedOrder?.id.substring(0, 8)}</div>
        <div>Name: {selectedUser?.name || 'Walk-in Customer'}</div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between border-b border-dashed pb-1 mb-1">
          <span>Date:</span>
          <span>{selectedOrder ? formatDate(selectedOrder.date) : ''}</span>
        </div>
        <div className="flex justify-between border-b border-dashed pb-1 mb-1">
          <span>Time:</span>
          <span>{selectedOrder ? formatTime(selectedOrder.time) : ''}</span>
        </div>
      </div>
      
      <div className="border-b border-black mb-2"></div>
      
      <div className="mb-2">
        {selectedOrder?.items.map((item, index) => (
          <div key={item.id} className="flex justify-between mb-1">
            <span>{index + 1}. {item.productname} {item.weight}g</span>
            <span>{formatCurrency(item.amount).replace('₹', 'Rs.')}</span>
          </div>
        ))}
      </div>
      
      <div className="border-t border-black pt-2 mt-2 text-right font-bold">
        <div>Total: {selectedOrder ? formatCurrency(selectedOrder.amount).replace('₹', 'Rs.') : ''}</div>
      </div>
      
      <div className="border-t border-black pt-2 mt-4 text-center text-xs">
        <div>Teller: {selectedUser?.name || 'System'}</div>
        <div>Mobile: {selectedUser?.number || 'N/A'}</div>
        <div className="mt-2">Thank you for shopping with us!</div>
        <div className="text-[8px] mt-1">Powered by Velkani POS</div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Order Management</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Total Orders</h3>
          <p className="text-2xl font-bold">{orders.length}</p>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Total Revenue</h3>
          <p className="text-2xl font-bold">
            {formatCurrency(orders.reduce((sum, order) => sum + parseFloat(order.amount), 0).toString())}
          </p>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Total Users</h3>
          <p className="text-2xl font-bold">{users.length}</p>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Avg Order Value</h3>
          <p className="text-2xl font-bold">
            {orders.length > 0 ? formatCurrency((orders.reduce((sum, order) => sum + parseFloat(order.amount), 0) / orders.length).toString()) : '₹0'}
          </p>
        </div>
      </div>

      <div className="mt-6">
        {loading && orders.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-red-500">{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">No orders found</p>
          </div>
        ) : (
          <div className="rounded-md border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id.substring(0, 8)}...</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{getUserName(order.uiduser)}</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(order.date)}</TableCell>
                    <TableCell>{formatTime(order.time)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(order.amount)}</TableCell>
                    <TableCell>
                      <Badge variant={order.items.length > 0 ? "default" : "secondary"}>
                        {order.items.length} items
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openViewDialog(order)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openPrintPreview(order)}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print Receipt
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => openDeleteDialog(order)}
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

      {/* Print Preview Dialog */}
      <Dialog open={isPrintPreviewOpen} onOpenChange={setIsPrintPreviewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Print Receipt Preview</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <ReceiptComponent />
          </div>
          <DialogFooter className="sm:justify-between">
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
            <div className="flex space-x-2">
              <Button variant="secondary" onClick={handleDownloadReceipt}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button onClick={handlePrintReceipt}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        {selectedOrder && (
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Customer Information */}
              {selectedUser && (
                <div className="rounded-lg border p-4 bg-muted/50">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Name</h4>
                      <p className="font-medium">{selectedUser.name}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Phone Number</h4>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{selectedUser.number}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Customer ID</h4>
                      <p className="text-sm text-muted-foreground">{selectedUser.uid}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Member Since</h4>
                      <p className="text-sm text-muted-foreground">{formatDate(selectedUser.created_at)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Information */}
              <div className="rounded-lg border p-4">
                <h3 className="text-lg font-semibold mb-3">Order Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Order ID</h4>
                    <p className="font-mono text-sm">{selectedOrder.id}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Date & Time</h4>
                    <p>{formatDate(selectedOrder.date)} at {formatTime(selectedOrder.time)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Total Amount</h4>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(selectedOrder.amount)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Total Items</h4>
                    <p className="font-semibold">{selectedOrder.items.length} items</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              {selectedOrder.items.length > 0 ? (
                <div className="rounded-lg border">
                  <div className="p-4 border-b">
                    <h3 className="text-lg font-semibold">Order Items</h3>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Weight</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.productname}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.weight}g</Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(item.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground border rounded-lg">
                  <p>No items in this order</p>
                </div>
              )}
            </div>
            <DialogFooter className="sm:justify-between">
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
              <Button onClick={() => openPrintPreview(selectedOrder)}>
                <Printer className="mr-2 h-4 w-4" />
                Print Receipt
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Delete Order Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Order</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              Are you sure you want to delete this order? This action cannot be undone.
            </p>
            {selectedOrder && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm">
                  <span className="font-medium">Order ID:</span> {selectedOrder.id}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Amount:</span> {formatCurrency(selectedOrder.amount)}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={handleDeleteOrder}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}