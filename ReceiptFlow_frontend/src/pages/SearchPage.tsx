import { useState } from "react";
import { Search as SearchIcon, Loader2, AlertCircle, FileSearch } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { Receipt } from "@/types/receipt";

export default function SearchPage() {
  const [receiptId, setReceiptId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [searched, setSearched] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!receiptId.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a receipt ID",
      });
      return;
    }

    const id = parseInt(receiptId.trim(), 10);
    if (isNaN(id) || id < 1) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid numeric receipt ID",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setReceipt(null);
    setSearched(true);

    try {
      const data = await apiService.getReceiptById(id);
      setReceipt(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to find receipt";
      setError(message);
      toast({
        variant: "destructive",
        title: "Receipt Not Found",
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "long",
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
      <div className="container px-4 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4">
            <FileSearch className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
            Search Receipt
          </h1>
          <p className="text-muted-foreground">
            Find a specific receipt by its database ID
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search by Receipt ID</CardTitle>
            <CardDescription>
              Enter the database ID of the receipt you want to find
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  min="1"
                  placeholder="Enter receipt ID (e.g., 1, 2, 3...)"
                  value={receiptId}
                  onChange={(e) => setReceiptId(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" disabled={isLoading} className="gradient-primary">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <SearchIcon className="h-4 w-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {isLoading ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Searching for receipt...</p>
            </CardContent>
          </Card>
        ) : error && searched ? (
          <Card className="border-destructive/50">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <p className="text-destructive font-medium mb-2">Receipt Not Found</p>
              <p className="text-sm text-muted-foreground text-center">{error}</p>
            </CardContent>
          </Card>
        ) : receipt ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Receipt Found</CardTitle>
                  <CardDescription>Order ID: {receipt.order_id}</CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => window.open(receipt.pdf_url, "_blank")}
                  className="gap-2"
                >
                  Download PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Receipt Info */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Receipt Number</p>
                  <p className="font-mono text-sm">{receipt.receipt_number}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Created At</p>
                  <p>{formatDate(receipt.created_at)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Customer Name</p>
                  <p className="font-medium">{receipt.customer_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Customer Email</p>
                  <p>{receipt.customer_email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Business Store</p>
                  <p>{receipt.business_store}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <Badge variant="outline" className={getPaymentMethodColor(receipt.payment_method)}>
                    {receipt.payment_method}
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
                      {receipt.items.map((item) => (
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
                  <span>{formatCurrency(receipt.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (10%)</span>
                  <span>{formatCurrency(receipt.tax)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span className="text-accent">{formatCurrency(receipt.total)}</span>
                </div>
              </div>

              {/* PDF Link */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">PDF Download URL</p>
                <a
                  href={receipt.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline break-all text-sm"
                >
                  {receipt.pdf_url}
                </a>
              </div>
            </CardContent>
          </Card>
        ) : searched ? null : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileSearch className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground font-medium mb-1">
                Search by Receipt ID
              </p>
              <p className="text-sm text-muted-foreground text-center">
                Enter a receipt ID above to find its details
              </p>
            </CardContent>
          </Card>
        )}

        {/* Note about backend endpoint */}
        <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
          <p className="text-sm text-muted-foreground text-center">
            <span className="font-medium">Note:</span> Search by Receipt ID uses the{" "}
            <code className="px-1.5 py-0.5 rounded bg-muted text-foreground text-xs">
              GET /receipts/{"{receipt_id}"}
            </code>{" "}
            endpoint. If this endpoint is not yet available in your backend, the search will return an error.
          </p>
        </div>
      </div>
    </div>
  );
}
