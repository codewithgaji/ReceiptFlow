import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Loader2, CheckCircle2, AlertCircle, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { PAYMENT_METHODS, PaymentMethod, ReceiptCreate, ReceiptCreateResponse } from "@/types/receipt";

const itemSchema = z.object({
  product_name: z.string().min(1, "Product name is required").max(200, "Product name too long"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  unit_price: z.coerce.number().min(0.01, "Price must be greater than 0"),
});

const formSchema = z.object({
  order_id: z.string().min(1, "Order ID is required").max(100, "Order ID too long"),
  customer_name: z.string().min(1, "Customer name is required").max(200, "Name too long"),
  customer_email: z.string().email("Invalid email address").max(255, "Email too long"),
  business_store: z.string().min(1, "Business store is required").max(200, "Store name too long"),
  payment_method: z.enum(["Card", "Transfer", "Crypto-Currency"] as const),
  items: z.array(itemSchema).min(1, "At least one item is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function GeneratePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [successData, setSuccessData] = useState<ReceiptCreateResponse | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      order_id: "",
      customer_name: "",
      customer_email: "",
      business_store: "",
      payment_method: "Card",
      items: [{ product_name: "", quantity: 1, unit_price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setSuccessData(null);

    try {
      const payload: ReceiptCreate = {
        order_id: data.order_id.trim(),
        customer_name: data.customer_name.trim(),
        customer_email: data.customer_email.trim(),
        business_store: data.business_store.trim(),
        payment_method: data.payment_method as PaymentMethod,
        items: data.items.map((item) => ({
          product_name: item.product_name.trim(),
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
      };

      const response = await apiService.createReceipt(payload);
      setSuccessData(response);
      
      toast({
        title: "Receipt Generated Successfully!",
        description: `Receipt sent to ${data.customer_email}`,
      });

      form.reset();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to generate receipt";
      
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateSubtotal = () => {
    const items = form.watch("items");
    return items.reduce((sum, item) => sum + (item.quantity || 0) * (item.unit_price || 0), 0);
  };

  const subtotal = calculateSubtotal();
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-muted/30 to-background py-8 md:py-12">
      <div className="container px-4 max-w-4xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4">
            <Receipt className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
            Generate Receipt
          </h1>
          <p className="text-muted-foreground">
            Fill in the details below to create a professional receipt
          </p>
        </div>

        {/* Success Message */}
        {successData && (
          <Card className="mb-6 border-success/50 bg-success/5">
            <CardContent className="flex items-start gap-4 py-4">
              <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-success mb-1">
                  ✅ Receipt generated successfully!
                </p>
                <p className="text-sm text-muted-foreground">
                  Check your email at <span className="font-medium">{form.getValues("customer_email") || "the provided address"}</span>
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  PDF URL:{" "}
                  <a
                    href={successData.Pdf_Url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline break-all"
                  >
                    {successData.Pdf_Url}
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-6">
            {/* Order & Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Information</CardTitle>
                <CardDescription>Basic order and customer details</CardDescription>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="order_id">Order ID *</Label>
                  <Input
                    id="order_id"
                    placeholder="ORD-123"
                    {...form.register("order_id")}
                    className={form.formState.errors.order_id ? "border-destructive" : ""}
                  />
                  {form.formState.errors.order_id && (
                    <p className="text-sm text-destructive">{form.formState.errors.order_id.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer_name">Customer Name *</Label>
                  <Input
                    id="customer_name"
                    placeholder="John Doe"
                    {...form.register("customer_name")}
                    className={form.formState.errors.customer_name ? "border-destructive" : ""}
                  />
                  {form.formState.errors.customer_name && (
                    <p className="text-sm text-destructive">{form.formState.errors.customer_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer_email">Customer Email *</Label>
                  <Input
                    id="customer_email"
                    type="email"
                    placeholder="john@example.com"
                    {...form.register("customer_email")}
                    className={form.formState.errors.customer_email ? "border-destructive" : ""}
                  />
                  {form.formState.errors.customer_email && (
                    <p className="text-sm text-destructive">{form.formState.errors.customer_email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business_store">Business Store *</Label>
                  <Input
                    id="business_store"
                    placeholder="Tech Plaza"
                    {...form.register("business_store")}
                    className={form.formState.errors.business_store ? "border-destructive" : ""}
                  />
                  {form.formState.errors.business_store && (
                    <p className="text-sm text-destructive">{form.formState.errors.business_store.message}</p>
                  )}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="payment_method">Payment Method *</Label>
                  <Select
                    value={form.watch("payment_method")}
                    onValueChange={(value) => form.setValue("payment_method", value as PaymentMethod)}
                  >
                    <SelectTrigger className={form.formState.errors.payment_method ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {PAYMENT_METHODS.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.payment_method && (
                    <p className="text-sm text-destructive">{form.formState.errors.payment_method.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Items */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-lg">Items</CardTitle>
                  <CardDescription>Add products to the receipt</CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ product_name: "", quantity: 1, unit_price: 0 })}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {form.formState.errors.items?.root && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{form.formState.errors.items.root.message}</span>
                  </div>
                )}

                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid sm:grid-cols-[1fr,auto,auto,auto] gap-3 p-4 rounded-lg bg-muted/50 border"
                  >
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Product Name</Label>
                      <Input
                        placeholder="Laptop"
                        {...form.register(`items.${index}.product_name`)}
                        className={form.formState.errors.items?.[index]?.product_name ? "border-destructive" : ""}
                      />
                      {form.formState.errors.items?.[index]?.product_name && (
                        <p className="text-xs text-destructive">
                          {form.formState.errors.items[index]?.product_name?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1 w-24">
                      <Label className="text-xs text-muted-foreground">Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        placeholder="1"
                        {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                        className={form.formState.errors.items?.[index]?.quantity ? "border-destructive" : ""}
                      />
                      {form.formState.errors.items?.[index]?.quantity && (
                        <p className="text-xs text-destructive">
                          {form.formState.errors.items[index]?.quantity?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1 w-32">
                      <Label className="text-xs text-muted-foreground">Unit Price</Label>
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="50000"
                        {...form.register(`items.${index}.unit_price`, { valueAsNumber: true })}
                        className={form.formState.errors.items?.[index]?.unit_price ? "border-destructive" : ""}
                      />
                      {form.formState.errors.items?.[index]?.unit_price && (
                        <p className="text-xs text-destructive">
                          {form.formState.errors.items[index]?.unit_price?.message}
                        </p>
                      )}
                    </div>

                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => fields.length > 1 && remove(index)}
                        disabled={fields.length === 1}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Summary */}
            <Card className="bg-muted/30">
              <CardContent className="pt-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">₦{subtotal.toLocaleString("en-NG", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (10%)</span>
                    <span className="font-medium">₦{tax.toLocaleString("en-NG", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-accent">₦{total.toLocaleString("en-NG", { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              disabled={isLoading}
              className="w-full h-14 text-lg gradient-primary hover:opacity-90 transition-opacity"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Receipt...
                </>
              ) : (
                <>
                  <Receipt className="mr-2 h-5 w-5" />
                  Generate Receipt
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
