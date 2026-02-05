import { useState, useEffect, useMemo } from "react";
import { Search, Download, Eye, Loader2, AlertCircle, RefreshCw, LayoutDashboard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { Receipt } from "@/types/receipt";

export default function DashboardPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const { toast } = useToast();

  const fetchReceipts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiService.getAllReceipts();
      setReceipts(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch receipts";
      setError(message);
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  const filteredReceipts = useMemo(() => {
    if (!searchQuery.trim()) return receipts;
    
    const query = searchQuery.toLowerCase();
    return receipts.filter(
      (receipt) =>
        receipt.order_id.toLowerCase().includes(query) ||
        receipt.customer_name.toLowerCase().includes(query) ||
        receipt.customer_email.toLowerCase().includes(query)
    );
  }, [receipts, searchQuery]);

  const handleDownload = (pdfUrl: string) => {
    window.open(pdfUrl, "_blank");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case "Card":
        return "bg-primary/10 text-primary border-primary/20";
      case "Transfer":
        return "bg-accent/10 text-accent border-accent/20";
      case "Crypto-Currency":
        return "bg-warning/10 text-warning border-warning/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-muted/30 to-background py-8 md:py-12">
      <div className="container px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                <LayoutDashboard className="h-6 w-6 text-primary-foreground" />
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground">Dashboard</h1>
            </div>
            <p className="text-muted-foreground">
              View and manage all generated receipts
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order ID, name, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full md:w-80"
              />
            </div>
            <Button variant="outline" size="icon" onClick={fetchReceipts} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-foreground">{receipts.length}</div>
              <p className="text-sm text-muted-foreground">Total Receipts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-accent">
                {formatCurrency(receipts.reduce((sum, r) => sum + r.total, 0))}
              </div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-foreground">{filteredReceipts.length}</div>
              <p className="text-sm text-muted-foreground">Filtered Results</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle>All Receipts</CardTitle>
            <CardDescription>
              {isLoading
                ? "Loading receipts..."
                : `Showing ${filteredReceipts.length} of ${receipts.length} receipts`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading receipts...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <p className="text-destructive font-medium mb-2">Failed to load receipts</p>
                <p className="text-sm text-muted-foreground mb-4">{error}</p>
                <Button onClick={fetchReceipts} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            ) : filteredReceipts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <LayoutDashboard className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground font-medium mb-1">
                  {searchQuery ? "No receipts match your search" : "No receipts yet"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "Generate your first receipt to see it here"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead className="hidden md:table-cell">Store</TableHead>
                      <TableHead className="hidden sm:table-cell">Payment</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="hidden lg:table-cell">Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReceipts.map((receipt) => (
                      <TableRow key={receipt.id}>
                        <TableCell className="font-medium">{receipt.order_id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{receipt.customer_name}</p>
                            <p className="text-xs text-muted-foreground">{receipt.customer_email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{receipt.business_store}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline" className={getPaymentMethodColor(receipt.payment_method)}>
                            {receipt.payment_method}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(receipt.total)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground">
                          {formatDate(receipt.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedReceipt(receipt)}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDownload(receipt.pdf_url)}
                              title="Download PDF"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Receipt Details Modal */}
        <Dialog open={!!selectedReceipt} onOpenChange={() => setSelectedReceipt(null)}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            {selectedReceipt && (
              <>
                <DialogHeader>
                  <DialogTitle className="font-display text-xl">
                    Receipt Details
                  </DialogTitle>
                  <DialogDescription>
                    Order ID: {selectedReceipt.order_id}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  {/* Receipt Info */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Receipt Number</p>
                      <p className="font-mono text-sm">{selectedReceipt.receipt_number}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Created At</p>
                      <p>{formatDate(selectedReceipt.created_at)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Customer Name</p>
                      <p className="font-medium">{selectedReceipt.customer_name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Customer Email</p>
                      <p>{selectedReceipt.customer_email}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Business Store</p>
                      <p>{selectedReceipt.business_store}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Payment Method</p>
                      <Badge variant="outline" className={getPaymentMethodColor(selectedReceipt.payment_method)}>
                        {selectedReceipt.payment_method}
                      </Badge>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div>
                    <h4 className="font-semibold mb-3">Items</h4>
                    <div className="rounded-lg border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead>Product</TableHead>
                            <TableHead className="text-center">Qty</TableHead>
                            <TableHead className="text-right">Unit Price</TableHead>
                            <TableHead className="text-right">Subtotal</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedReceipt.items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.product_name}</TableCell>
                              <TableCell className="text-center">{item.quantity}</TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(item.unit_price)}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(item.quantity * item.unit_price)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatCurrency(selectedReceipt.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax (10%)</span>
                      <span>{formatCurrency(selectedReceipt.tax)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                      <span>Total</span>
                      <span className="text-accent">{formatCurrency(selectedReceipt.total)}</span>
                    </div>
                  </div>

                  {/* PDF Link */}
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">PDF Download</p>
                    <a
                      href={selectedReceipt.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline break-all text-sm"
                    >
                      {selectedReceipt.pdf_url}
                    </a>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={() => setSelectedReceipt(null)}>
                      Close
                    </Button>
                    <Button onClick={() => handleDownload(selectedReceipt.pdf_url)} className="gradient-accent">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
