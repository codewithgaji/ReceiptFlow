import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Download, Calendar, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ReceiptStatusBadge } from '@/components/dashboard/ReceiptStatusBadge';
import { ReceiptPreviewModal } from '@/components/dashboard/ReceiptPreviewModal';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { mockReceipts, simulateApiCall, Receipt } from '@/lib/mockData';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Eye, RefreshCw, Trash2, MoreHorizontal } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [receiptToDelete, setReceiptToDelete] = useState<Receipt | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const data = await simulateApiCall(mockReceipts);
      setReceipts(data);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const filteredReceipts = useMemo(() => {
    return receipts.filter((receipt) => {
      const matchesSearch =
        receipt.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        receipt.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        receipt.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        receipt.customerName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || receipt.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [receipts, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredReceipts.length / ITEMS_PER_PAGE);
  const paginatedReceipts = filteredReceipts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleView = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setModalOpen(true);
  };

  const handleDownload = (receipt: Receipt) => {
    toast({
      title: 'Downloading Receipt',
      description: `${receipt.id} is being downloaded...`,
    });
  };

  const handleResend = (receipt: Receipt) => {
    toast({
      title: 'Email Sent',
      description: `Receipt resent to ${receipt.customerEmail}`,
    });
  };

  const handleDeleteClick = (receipt: Receipt) => {
    setReceiptToDelete(receipt);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (receiptToDelete) {
      await simulateApiCall(null, 500);
      setReceipts(receipts.filter((r) => r.id !== receiptToDelete.id));
      toast({
        title: 'Receipt Deleted',
        description: `${receiptToDelete.id} has been removed`,
      });
      setDeleteDialogOpen(false);
      setReceiptToDelete(null);
    }
  };

  const exportCSV = () => {
    const headers = ['Receipt ID', 'Order ID', 'Customer', 'Email', 'Total', 'Status', 'Date'];
    const rows = filteredReceipts.map((r) => [
      r.id,
      r.orderId,
      r.customerName,
      r.customerEmail,
      r.total.toFixed(2),
      r.status,
      format(r.createdAt, 'yyyy-MM-dd HH:mm'),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipts-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();

    toast({
      title: 'Export Complete',
      description: `${filteredReceipts.length} receipts exported to CSV`,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 w-48 skeleton-pulse mb-2" />
            <div className="h-4 w-64 skeleton-pulse" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl">
          <div className="p-4 border-b border-border flex gap-4">
            <div className="h-10 w-64 skeleton-pulse rounded-lg" />
            <div className="h-10 w-32 skeleton-pulse rounded-lg" />
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-header">Receipt History</h1>
          <p className="page-description">View and manage all generated receipts</p>
        </div>
        <Button variant="outline" onClick={exportCSV}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by receipt ID, order ID, or email..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                {statusFilter === 'all' ? 'All Status' : statusFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}>
                All Status
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setStatusFilter('stored'); setCurrentPage(1); }}>
                Stored
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setStatusFilter('sent'); setCurrentPage(1); }}>
                Sent
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setStatusFilter('generated'); setCurrentPage(1); }}>
                Generated
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setStatusFilter('processing'); setCurrentPage(1); }}>
                Processing
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setStatusFilter('failed'); setCurrentPage(1); }}>
                Failed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Table */}
        {paginatedReceipts.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No receipts found"
            description="Try adjusting your search or filter criteria"
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Receipt ID</th>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedReceipts.map((receipt) => (
                    <tr key={receipt.id} className="animate-fade-in">
                      <td className="font-medium text-foreground">{receipt.id}</td>
                      <td className="text-muted-foreground">{receipt.orderId}</td>
                      <td>
                        <div>
                          <p className="font-medium text-foreground">{receipt.customerName}</p>
                          <p className="text-xs text-muted-foreground">{receipt.customerEmail}</p>
                        </div>
                      </td>
                      <td className="font-medium">${receipt.total.toFixed(2)}</td>
                      <td className="text-muted-foreground">
                        {format(receipt.createdAt, 'MMM d, yyyy')}
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
                            onClick={() => handleView(receipt)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDownload(receipt)}
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
                              <DropdownMenuItem onClick={() => handleResend(receipt)}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Resend Email
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(receipt)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
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

            {/* Pagination */}
            <div className="p-4 border-t border-border flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredReceipts.length)} of{' '}
                {filteredReceipts.length} receipts
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {[...Array(totalPages)].map((_, i) => (
                  <Button
                    key={i}
                    variant={currentPage === i + 1 ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(i + 1)}
                    className="w-8"
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Receipt Preview Modal */}
      <ReceiptPreviewModal
        receipt={selectedReceipt}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onDownload={handleDownload}
        onResend={handleResend}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Receipt?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete receipt {receiptToDelete?.id} and remove it from cloud
              storage. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
