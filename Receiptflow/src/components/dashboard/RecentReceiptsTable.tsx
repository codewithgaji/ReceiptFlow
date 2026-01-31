import { Receipt } from '@/lib/mockData';
import { ReceiptStatusBadge } from './ReceiptStatusBadge';
import { Button } from '@/components/ui/button';
import { Eye, Download, RefreshCw, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

interface RecentReceiptsTableProps {
  receipts: Receipt[];
  onView: (receipt: Receipt) => void;
  onDownload: (receipt: Receipt) => void;
  onResend: (receipt: Receipt) => void;
  isLoading?: boolean;
}

export function RecentReceiptsTable({
  receipts,
  onView,
  onDownload,
  onResend,
  isLoading,
}: RecentReceiptsTableProps) {
  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="h-5 w-32 skeleton-pulse" />
        </div>
        <div className="divide-y divide-border">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <div className="h-4 w-20 skeleton-pulse" />
              <div className="h-4 w-28 skeleton-pulse" />
              <div className="h-4 w-40 skeleton-pulse flex-1" />
              <div className="h-4 w-24 skeleton-pulse" />
              <div className="h-6 w-20 skeleton-pulse rounded-full" />
              <div className="h-8 w-8 skeleton-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden animate-fade-in">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Recent Receipts</h3>
        <Button variant="ghost" size="sm" className="text-primary">
          View All
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Receipt ID</th>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {receipts.map((receipt) => (
              <tr key={receipt.id}>
                <td className="font-medium text-foreground">{receipt.id}</td>
                <td className="text-muted-foreground">{receipt.orderId}</td>
                <td>
                  <div>
                    <p className="font-medium text-foreground">{receipt.customerName}</p>
                    <p className="text-xs text-muted-foreground">{receipt.customerEmail}</p>
                  </div>
                </td>
                <td className="text-muted-foreground">
                  {format(receipt.createdAt, 'MMM d, yyyy h:mm a')}
                </td>
                <td>
                  <ReceiptStatusBadge status={receipt.status} />
                </td>
                <td>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onView(receipt)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onDownload(receipt)}
                      disabled={!receipt.pdfUrl}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onResend(receipt)}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Resend Email
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
