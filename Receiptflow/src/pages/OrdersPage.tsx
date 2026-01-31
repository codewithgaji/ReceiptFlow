import { useState } from 'react';
import { Plus, Trash2, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatusWorkflow } from '@/components/dashboard/StatusWorkflow';
import { toast } from '@/hooks/use-toast';
import { simulateApiCall } from '@/lib/mockData';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

type ProcessingStatus = 'idle' | 'processing' | 'generated' | 'sent' | 'stored' | 'failed';

export default function OrdersPage() {
  const [orderId, setOrderId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [taxPercentage, setTaxPercentage] = useState('8');
  const [discount, setDiscount] = useState('0');
  const [items, setItems] = useState<OrderItem[]>([
    { id: '1', name: '', quantity: 1, price: 0 },
  ]);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), name: '', quantity: 1, price: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof OrderItem, value: string | number) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!orderId.trim()) newErrors.orderId = 'Order ID is required';
    if (!customerName.trim()) newErrors.customerName = 'Customer name is required';
    if (!customerEmail.trim()) {
      newErrors.customerEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      newErrors.customerEmail = 'Invalid email format';
    }
    if (!paymentMethod) newErrors.paymentMethod = 'Payment method is required';
    
    const hasValidItems = items.some((item) => item.name.trim() && item.price > 0);
    if (!hasValidItems) newErrors.items = 'At least one valid item is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = subtotal * (parseFloat(taxPercentage) / 100);
    const discountAmount = parseFloat(discount) || 0;
    return subtotal + tax - discountAmount;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
      });
      return;
    }

    // Simulate processing workflow
    setProcessingStatus('processing');
    await simulateApiCall(null, 1500);

    setProcessingStatus('generated');
    await simulateApiCall(null, 1000);

    setProcessingStatus('sent');
    await simulateApiCall(null, 1000);

    setProcessingStatus('stored');

    toast({
      title: 'Receipt Generated Successfully!',
      description: `Receipt sent to ${customerEmail}`,
    });

    // Reset form after a delay
    setTimeout(() => {
      setProcessingStatus('idle');
      setOrderId('');
      setCustomerName('');
      setCustomerEmail('');
      setPaymentMethod('');
      setTaxPercentage('8');
      setDiscount('0');
      setItems([{ id: '1', name: '', quantity: 1, price: 0 }]);
    }, 3000);
  };

  const isProcessing = processingStatus !== 'idle';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-header">Generate Receipt</h1>
        <p className="page-description">Create and send a new receipt to a customer</p>
      </div>

      {/* Status Workflow */}
      {processingStatus !== 'idle' && (
        <Card className="animate-fade-in">
          <CardContent className="pt-6">
            <StatusWorkflow currentStatus={processingStatus} className="justify-center" />
          </CardContent>
        </Card>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
            <CardDescription>Enter the order information to generate a receipt</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Order Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="orderId">Order ID *</Label>
                <Input
                  id="orderId"
                  placeholder="ORD-2024-001"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className={errors.orderId ? 'border-destructive' : ''}
                  disabled={isProcessing}
                />
                {errors.orderId && (
                  <p className="text-xs text-destructive">{errors.orderId}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method *</Label>
                <Select
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  disabled={isProcessing}
                >
                  <SelectTrigger className={errors.paymentMethod ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                    <SelectItem value="PayPal">PayPal</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
                {errors.paymentMethod && (
                  <p className="text-xs text-destructive">{errors.paymentMethod}</p>
                )}
              </div>
            </div>

            {/* Customer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  placeholder="John Doe"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className={errors.customerName ? 'border-destructive' : ''}
                  disabled={isProcessing}
                />
                {errors.customerName && (
                  <p className="text-xs text-destructive">{errors.customerName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerEmail">Customer Email *</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  placeholder="john@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className={errors.customerEmail ? 'border-destructive' : ''}
                  disabled={isProcessing}
                />
                {errors.customerEmail && (
                  <p className="text-xs text-destructive">{errors.customerEmail}</p>
                )}
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Order Items *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                  disabled={isProcessing}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>
              {errors.items && (
                <p className="text-xs text-destructive">{errors.items}</p>
              )}
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-2 items-center animate-fade-in"
                  >
                    <div className="col-span-5">
                      <Input
                        placeholder="Item name"
                        value={item.name}
                        onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                        disabled={isProcessing}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                        disabled={isProcessing}
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Price"
                        value={item.price || ''}
                        onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                        disabled={isProcessing}
                      />
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        disabled={items.length === 1 || isProcessing}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tax & Discount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taxPercentage">Tax Percentage (%)</Label>
                <Input
                  id="taxPercentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={taxPercentage}
                  onChange={(e) => setTaxPercentage(e.target.value)}
                  disabled={isProcessing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount">Discount Amount ($)</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  disabled={isProcessing}
                />
              </div>
            </div>

            {/* Summary */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Tax ({taxPercentage}%)</span>
                <span>${(calculateSubtotal() * (parseFloat(taxPercentage) / 100)).toFixed(2)}</span>
              </div>
              {parseFloat(discount) > 0 && (
                <div className="flex justify-between text-sm mb-2 text-success">
                  <span>Discount</span>
                  <span>-${parseFloat(discount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-lg pt-2 border-t border-border">
                <span>Total</span>
                <span className="text-primary">${calculateTotal().toFixed(2)}</span>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Generate & Send Receipt
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
