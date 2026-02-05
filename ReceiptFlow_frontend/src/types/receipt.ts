// API Types matching the FastAPI backend schema

export interface ReceiptItem {
  product_name: string;
  quantity: number;
  unit_price: number;
}

export interface ReceiptItemWithId extends ReceiptItem {
  id: number;
}

export interface ReceiptCreate {
  order_id: string;
  customer_name: string;
  customer_email: string;
  business_store: string;
  payment_method: PaymentMethod;
  items: ReceiptItem[];
}

export interface ReceiptCreateResponse {
  id: number;
  order_id: string;
  receipt_number: string;
  Pdf_Url: string; // Note: Capital P as per backend response
}

export interface Receipt {
  id: number;
  order_id: string;
  receipt_number: string;
  customer_name: string;
  customer_email: string;
  business_store: string;
  payment_method: PaymentMethod;
  subtotal: number;
  tax: number;
  total: number;
  pdf_url: string; // lowercase in GET /receipts response
  created_at: string;
  items: ReceiptItemWithId[];
}

export type PaymentMethod = "Card" | "Transfer" | "Crypto-Currency";

export const PAYMENT_METHODS: PaymentMethod[] = ["Card", "Transfer", "Crypto-Currency"];

export interface ApiError {
  detail: string;
}
