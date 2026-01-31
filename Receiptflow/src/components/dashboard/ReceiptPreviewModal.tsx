import { Receipt } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Download, Printer, RefreshCw, X, FileText, Mail, CreditCard, Calendar } from 'lucide-react';
import { ReceiptStatusBadge } from './ReceiptStatusBadge';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';

interface ReceiptPreviewModalProps {
  receipt: Receipt | null;
  open: boolean;
  onClose: () => void;
  onDownload: (receipt: Receipt) => void;
  onResend: (receipt: Receipt) => void;
}

export function ReceiptPreviewModal({
  receipt,
  open,
  onClose,
  onDownload,
  onResend,
}: ReceiptPreviewModalProps) {
  if (!receipt) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-4 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-left">Receipt {receipt.id}</DialogTitle>
                <p className="text-sm text-muted-foreground">Order {receipt.orderId}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => onDownload(receipt)}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={() => onResend(receipt)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Resend
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* PDF Preview */}
          <div className="flex-1 bg-muted/50 p-6 overflow-auto">
            <div className="bg-card border border-border rounded-lg shadow-lg max-w-xl mx-auto p-8">
              {/* Receipt Header */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-primary mb-1">ReceiptFlow Inc.</h2>
                <p className="text-sm text-muted-foreground">123 Business Street, Suite 100</p>
                <p className="text-sm text-muted-foreground">San Francisco, CA 94102</p>
              </div>

              <Separator className="my-6" />

              {/* Receipt Details */}
              <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                <div>
                  <p className="text-muted-foreground">Bill To:</p>
                  <p className="font-medium">{receipt.customerName}</p>
                  <p className="text-muted-foreground">{receipt.customerEmail}</p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground">Receipt No:</p>
                  <p className="font-medium">{receipt.id}</p>
                  <p className="text-muted-foreground mt-2">Date:</p>
                  <p className="font-medium">{format(receipt.createdAt, 'MMMM d, yyyy')}</p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-sm mb-6">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2">Item</th>
                    <th className="text-center py-2">Qty</th>
                    <th className="text-right py-2">Price</th>
                    <th className="text-right py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {receipt.items.map((item) => (
                    <tr key={item.id} className="border-b border-border/50">
                      <td className="py-2">{item.name}</td>
                      <td className="text-center py-2">{item.quantity}</td>
                      <td className="text-right py-2">${item.price.toFixed(2)}</td>
                      <td className="text-right py-2">${(item.quantity * item.price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${receipt.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax ({receipt.taxPercentage}%)</span>
                  <span>${receipt.tax.toFixed(2)}</span>
                </div>
                {receipt.discount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Discount</span>
                    <span>-${receipt.discount.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-primary">${receipt.total.toFixed(2)}</span>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Payment Info */}
              <div className="text-center text-sm text-muted-foreground">
                <p>Payment Method: {receipt.paymentMethod}</p>
                <p className="mt-4">Thank you for your business!</p>
              </div>
            </div>
          </div>

          {/* Metadata Sidebar */}
          <div className="w-72 border-l border-border p-4 overflow-auto flex-shrink-0">
            <h4 className="font-semibold mb-4">Receipt Details</h4>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Status</p>
                <ReceiptStatusBadge status={receipt.status} />
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-sm font-medium">{format(receipt.createdAt, 'MMM d, yyyy h:mm a')}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Customer Email</p>
                  <p className="text-sm font-medium">{receipt.customerEmail}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Payment Method</p>
                  <p className="text-sm font-medium">{receipt.paymentMethod}</p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Cloud Storage</p>
                {receipt.cloudinaryId ? (
                  <div className="bg-success/10 border border-success/20 rounded-lg p-3">
                    <p className="text-xs text-success font-medium">Stored in Cloudinary</p>
                    <p className="text-xs text-muted-foreground mt-1 break-all">{receipt.cloudinaryId}</p>
                  </div>
                ) : (
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Not stored in cloud</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
