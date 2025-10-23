import Link from 'next/link';
import Image from 'next/image';
import { Package, ChevronRight, ShoppingBag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface OrderContextCardProps {
  order: {
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    items: {
      id: string;
      product: {
        title: string;
        images: {
          url: string;
          altText: string | null;
        }[];
      };
    }[];
  };
}

function getStatusColor(status: string) {
  switch (status) {
    case 'PROCESSING':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'SHIPPED':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'DELIVERED':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

function getStatusText(status: string) {
  switch (status) {
    case 'PROCESSING':
      return 'Processing';
    case 'SHIPPED':
      return 'Shipped';
    case 'DELIVERED':
      return 'Delivered';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return status;
  }
}

export function OrderContextCard({ order }: OrderContextCardProps) {
  return (
    <Card className="mb-6 border-[#E9ECEF] bg-[#FAFAF8]">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Order Info */}
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <Package className="size-4 text-[#1B4332]" />
              <span className="font-semibold text-[#212529]">Order #{order.orderNumber}</span>
              <Badge className={getStatusColor(order.status)}>{getStatusText(order.status)}</Badge>
            </div>

            {/* Product Thumbnails */}
            <div className="flex gap-2">
              {order.items.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="relative size-12 flex-shrink-0 overflow-hidden rounded border border-[#DEE2E6]"
                >
                  {item.product.images[0]?.url ? (
                    <Image
                      src={item.product.images[0].url}
                      alt={item.product.images[0].altText || item.product.title}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center bg-[#E9ECEF]">
                      <ShoppingBag className="size-5 text-[#6C757D]" />
                    </div>
                  )}
                </div>
              ))}
              {order.items.length > 4 && (
                <div className="flex size-12 flex-shrink-0 items-center justify-center rounded border border-[#DEE2E6] bg-[#E9ECEF] text-xs font-semibold text-[#495057]">
                  +{order.items.length - 4}
                </div>
              )}
            </div>

            {/* Order Total */}
            <div className="mt-2 text-sm text-[#495057]">
              {order.items.length} item{order.items.length !== 1 ? 's' : ''} •{' '}
              <span className="font-semibold text-[#212529]">${order.total.toFixed(2)}</span>
            </div>
          </div>

          {/* View Details Link */}
          <Link
            href={`/orders/${order.id}`}
            className="flex items-center gap-1 text-sm font-medium text-[#1B4332] transition-colors hover:text-[#2D6A4F]"
          >
            View Details
            <ChevronRight className="size-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
