'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { updateOrderStatus, bulkUpdateOrderStatus } from '@/actions/orders';
import { cn } from '@/lib/utils';
import { ShippingLabelManager } from './shipping-label-manager';
import { OrderStatus } from '@/generated/prisma';

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: Date;
  trackingNumber?: string | null;
  trackingCarrier?: string | null;
  shippingLabelUrl?: string | null;
  buyer: { name: string | null; email: string | null };
  items: Array<{
    id: string;
    quantity: number;
    subtotal: number;
    product: {
      id: string;
      title: string;
      images: Array<{ url: string; altText: string | null }>;
    };
  }>;
}

interface OrdersTableProps {
  orders: Order[];
}

const statusOptions = [
  { value: 'PENDING', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'PROCESSING', label: 'Processing', color: 'bg-blue-100 text-blue-800' },
  { value: 'SHIPPED', label: 'Shipped', color: 'bg-purple-100 text-purple-800' },
  { value: 'DELIVERED', label: 'Delivered', color: 'bg-green-100 text-green-800' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
];

function getStatusColor(status: string) {
  return statusOptions.find((s) => s.value === status)?.color || 'bg-gray-100 text-gray-800';
}

function getStatusLabel(status: string) {
  return statusOptions.find((s) => s.value === status)?.label || status;
}

export function OrdersTable({ orders: initialOrders }: OrdersTableProps) {
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const toggleExpand = (orderId: string) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const toggleSelection = (orderId: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === orders.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(orders.map((o) => o.id)));
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(orderId);
    try {
      const result = await updateOrderStatus(orderId, newStatus as OrderStatus);
      if (result.success) {
        // Update local state
        setOrders((prev) =>
          prev.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order))
        );
      } else {
        alert(result.error || 'Failed to update order status');
      }
    } catch {
      alert('An error occurred while updating the order status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleBulkStatusUpdate = (status: string) => {
    const count = selectedIds.size;
    if (!confirm(`Are you sure you want to mark ${count} order(s) as ${getStatusLabel(status)}?`)) {
      return;
    }

    startTransition(async () => {
      const result = await bulkUpdateOrderStatus(Array.from(selectedIds), status as OrderStatus);
      if (result.success) {
        setSelectedIds(new Set());
        router.refresh();
      } else {
        alert(result.error || 'Failed to update orders');
      }
    });
  };

  const allSelected = orders.length > 0 && selectedIds.size === orders.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < orders.length;

  return (
    <div className="space-y-4">
      {/* Bulk Actions Toolbar */}
      {selectedIds.size > 0 && (
        <div className="bg-eco-light/30 border-eco-dark flex items-center justify-between rounded-lg border px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="font-medium">{selectedIds.size} order(s) selected</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground mr-2 text-sm">Update status:</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkStatusUpdate('PROCESSING')}
              disabled={isPending}
              className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Processing
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkStatusUpdate('SHIPPED')}
              disabled={isPending}
              className="border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100"
            >
              Shipped
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkStatusUpdate('DELIVERED')}
              disabled={isPending}
              className="border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
            >
              Delivered
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkStatusUpdate('CANCELLED')}
              disabled={isPending}
              className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
            >
              Cancelled
            </Button>
          </div>
        </div>
      )}

      {/* Select All Checkbox */}
      <div className="flex items-center gap-3 px-2">
        <Checkbox
          checked={allSelected || someSelected}
          onChange={toggleSelectAll}
          aria-label="Select all orders"
          className={cn(someSelected && 'bg-gray-400')}
        />
        <label className="text-muted-foreground cursor-pointer text-sm" onClick={toggleSelectAll}>
          {allSelected ? 'Deselect all' : 'Select all'}
        </label>
      </div>

      {/* Orders List */}
      {orders.map((order) => {
        const isExpanded = expandedOrders.has(order.id);
        const isSelected = selectedIds.has(order.id);

        return (
          <div
            key={order.id}
            className={cn(
              'bg-card rounded-lg border transition-all',
              isSelected && 'ring-eco-dark ring-2 ring-offset-2'
            )}
          >
            {/* Order Header */}
            <div className="flex items-center justify-between p-6">
              <div className="flex flex-1 items-center gap-4">
                {/* Selection Checkbox */}
                <Checkbox
                  checked={isSelected}
                  onChange={() => toggleSelection(order.id)}
                  aria-label={`Select order ${order.id}`}
                  className="shrink-0"
                />

                {/* Expand Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleExpand(order.id)}
                  className="shrink-0"
                >
                  <ChevronDown
                    className={cn('size-5 transition-transform', isExpanded && 'rotate-180')}
                  />
                </Button>

                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-3">
                    <h3 className="font-semibold">Order #{order.id.slice(0, 8)}</h3>
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                        getStatusColor(order.status)
                      )}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    <span>
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span>•</span>
                    <span>{order.buyer.name || order.buyer.email}</span>
                    <span>•</span>
                    <span className="font-semibold">${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Status Update Dropdown */}
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                disabled={updatingStatus === order.id}
                className="border-input bg-background hover:bg-accent rounded-md border px-3 py-2 text-sm transition-colors disabled:opacity-50"
              >
                {statusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Expanded Order Details */}
            {isExpanded && (
              <div className="border-t px-6 pt-4 pb-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Order Items */}
                  <div>
                    <h4 className="mb-3 text-sm font-semibold">Order Items</h4>
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex gap-4">
                          <div className="bg-muted relative size-16 flex-shrink-0 overflow-hidden rounded">
                            {item.product.images[0]?.url ? (
                              <Image
                                src={item.product.images[0].url}
                                alt={item.product.images[0].altText || item.product.title}
                                fill
                                className="object-cover"
                                sizes="64px"
                              />
                            ) : (
                              <div className="flex size-full items-center justify-center">
                                <ShoppingBag className="text-muted-foreground size-6" />
                              </div>
                            )}
                          </div>
                          <div className="flex flex-1 items-center justify-between">
                            <div>
                              <Link
                                href={`/products/${item.product.id}`}
                                className="hover:text-forest-dark font-medium transition-colors"
                              >
                                {item.product.title}
                              </Link>
                              <p className="text-muted-foreground text-sm">
                                Qty: {item.quantity} × ${(item.subtotal / item.quantity).toFixed(2)}
                              </p>
                            </div>
                            <div className="text-sm font-semibold">
                              ${item.subtotal.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Label */}
                  <div>
                    <h4 className="mb-3 text-sm font-semibold">Shipping</h4>
                    <ShippingLabelManager
                      orderId={order.id}
                      trackingNumber={order.trackingNumber}
                      trackingCarrier={order.trackingCarrier}
                      shippingLabelUrl={order.shippingLabelUrl}
                      onLabelCreated={() => router.refresh()}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
