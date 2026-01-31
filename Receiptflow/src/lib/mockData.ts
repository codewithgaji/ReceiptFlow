export interface ReceiptItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Receipt {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  taxPercentage: number;
  discount: number;
  total: number;
  paymentMethod: 'Credit Card' | 'PayPal' | 'Bank Transfer';
  status: 'processing' | 'generated' | 'sent' | 'stored' | 'failed';
  createdAt: Date;
  pdfUrl?: string;
  cloudinaryId?: string;
}

export interface BusinessSettings {
  name: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  logoUrl: string;
  taxId: string;
}

export const mockReceipts: Receipt[] = [
  {
    id: 'RCP-001',
    orderId: 'ORD-2024-001',
    customerName: 'John Smith',
    customerEmail: 'john.smith@email.com',
    items: [
      { id: '1', name: 'Premium Widget', quantity: 2, price: 49.99 },
      { id: '2', name: 'Basic Gadget', quantity: 1, price: 29.99 },
    ],
    subtotal: 129.97,
    tax: 10.40,
    taxPercentage: 8,
    discount: 0,
    total: 140.37,
    paymentMethod: 'Credit Card',
    status: 'stored',
    createdAt: new Date('2024-01-15T10:30:00'),
    pdfUrl: 'https://example.com/receipts/rcp-001.pdf',
    cloudinaryId: 'receipts/rcp-001',
  },
  {
    id: 'RCP-002',
    orderId: 'ORD-2024-002',
    customerName: 'Sarah Johnson',
    customerEmail: 'sarah.j@company.com',
    items: [
      { id: '1', name: 'Enterprise License', quantity: 1, price: 299.00 },
    ],
    subtotal: 299.00,
    tax: 23.92,
    taxPercentage: 8,
    discount: 30.00,
    total: 292.92,
    paymentMethod: 'PayPal',
    status: 'stored',
    createdAt: new Date('2024-01-15T14:22:00'),
    pdfUrl: 'https://example.com/receipts/rcp-002.pdf',
    cloudinaryId: 'receipts/rcp-002',
  },
  {
    id: 'RCP-003',
    orderId: 'ORD-2024-003',
    customerName: 'Mike Chen',
    customerEmail: 'mike.chen@startup.io',
    items: [
      { id: '1', name: 'Pro Plan Monthly', quantity: 1, price: 79.00 },
      { id: '2', name: 'Extra Storage 50GB', quantity: 2, price: 9.99 },
    ],
    subtotal: 98.98,
    tax: 7.92,
    taxPercentage: 8,
    discount: 0,
    total: 106.90,
    paymentMethod: 'Credit Card',
    status: 'sent',
    createdAt: new Date('2024-01-14T09:15:00'),
    pdfUrl: 'https://example.com/receipts/rcp-003.pdf',
  },
  {
    id: 'RCP-004',
    orderId: 'ORD-2024-004',
    customerName: 'Emily Davis',
    customerEmail: 'emily.d@gmail.com',
    items: [
      { id: '1', name: 'Wireless Headphones', quantity: 1, price: 149.99 },
      { id: '2', name: 'Carrying Case', quantity: 1, price: 24.99 },
      { id: '3', name: 'Extended Warranty', quantity: 1, price: 19.99 },
    ],
    subtotal: 194.97,
    tax: 15.60,
    taxPercentage: 8,
    discount: 20.00,
    total: 190.57,
    paymentMethod: 'Bank Transfer',
    status: 'stored',
    createdAt: new Date('2024-01-14T16:45:00'),
    pdfUrl: 'https://example.com/receipts/rcp-004.pdf',
    cloudinaryId: 'receipts/rcp-004',
  },
  {
    id: 'RCP-005',
    orderId: 'ORD-2024-005',
    customerName: 'Alex Thompson',
    customerEmail: 'alex.t@techcorp.com',
    items: [
      { id: '1', name: 'Developer Tools Suite', quantity: 1, price: 499.00 },
    ],
    subtotal: 499.00,
    tax: 39.92,
    taxPercentage: 8,
    discount: 50.00,
    total: 488.92,
    paymentMethod: 'Credit Card',
    status: 'failed',
    createdAt: new Date('2024-01-13T11:30:00'),
  },
  {
    id: 'RCP-006',
    orderId: 'ORD-2024-006',
    customerName: 'Lisa Wong',
    customerEmail: 'lisa.wong@design.co',
    items: [
      { id: '1', name: 'Design Templates Pack', quantity: 1, price: 39.99 },
      { id: '2', name: 'Icon Library', quantity: 1, price: 19.99 },
    ],
    subtotal: 59.98,
    tax: 4.80,
    taxPercentage: 8,
    discount: 0,
    total: 64.78,
    paymentMethod: 'PayPal',
    status: 'stored',
    createdAt: new Date('2024-01-13T08:20:00'),
    pdfUrl: 'https://example.com/receipts/rcp-006.pdf',
    cloudinaryId: 'receipts/rcp-006',
  },
  {
    id: 'RCP-007',
    orderId: 'ORD-2024-007',
    customerName: 'James Wilson',
    customerEmail: 'j.wilson@enterprise.net',
    items: [
      { id: '1', name: 'Team License (10 seats)', quantity: 1, price: 899.00 },
      { id: '2', name: 'Priority Support', quantity: 1, price: 199.00 },
    ],
    subtotal: 1098.00,
    tax: 87.84,
    taxPercentage: 8,
    discount: 100.00,
    total: 1085.84,
    paymentMethod: 'Bank Transfer',
    status: 'stored',
    createdAt: new Date('2024-01-12T15:10:00'),
    pdfUrl: 'https://example.com/receipts/rcp-007.pdf',
    cloudinaryId: 'receipts/rcp-007',
  },
  {
    id: 'RCP-008',
    orderId: 'ORD-2024-008',
    customerName: 'Maria Garcia',
    customerEmail: 'maria.g@freelance.com',
    items: [
      { id: '1', name: 'Freelancer Plan', quantity: 1, price: 29.00 },
    ],
    subtotal: 29.00,
    tax: 2.32,
    taxPercentage: 8,
    discount: 0,
    total: 31.32,
    paymentMethod: 'Credit Card',
    status: 'sent',
    createdAt: new Date('2024-01-12T12:00:00'),
    pdfUrl: 'https://example.com/receipts/rcp-008.pdf',
  },
  {
    id: 'RCP-009',
    orderId: 'ORD-2024-009',
    customerName: 'Robert Brown',
    customerEmail: 'r.brown@agency.com',
    items: [
      { id: '1', name: 'Agency Bundle', quantity: 1, price: 599.00 },
      { id: '2', name: 'White Label Add-on', quantity: 1, price: 149.00 },
      { id: '3', name: 'API Access', quantity: 1, price: 99.00 },
    ],
    subtotal: 847.00,
    tax: 67.76,
    taxPercentage: 8,
    discount: 85.00,
    total: 829.76,
    paymentMethod: 'PayPal',
    status: 'processing',
    createdAt: new Date('2024-01-15T17:30:00'),
  },
  {
    id: 'RCP-010',
    orderId: 'ORD-2024-010',
    customerName: 'Jennifer Lee',
    customerEmail: 'jen.lee@startup.co',
    items: [
      { id: '1', name: 'Starter Kit', quantity: 1, price: 99.00 },
      { id: '2', name: 'Onboarding Session', quantity: 2, price: 49.00 },
    ],
    subtotal: 197.00,
    tax: 15.76,
    taxPercentage: 8,
    discount: 0,
    total: 212.76,
    paymentMethod: 'Credit Card',
    status: 'generated',
    createdAt: new Date('2024-01-15T18:45:00'),
  },
];

export const defaultBusinessSettings: BusinessSettings = {
  name: 'ReceiptFlow Inc.',
  address: '123 Business Street, Suite 100',
  city: 'San Francisco, CA 94102',
  country: 'United States',
  phone: '+1 (555) 123-4567',
  email: 'billing@receiptflow.com',
  logoUrl: 'https://via.placeholder.com/200x60?text=ReceiptFlow',
  taxId: 'US-123456789',
};

export const getStats = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const totalReceipts = mockReceipts.length;
  const todayReceipts = mockReceipts.filter(r => {
    const receiptDate = new Date(r.createdAt);
    receiptDate.setHours(0, 0, 0, 0);
    return receiptDate.getTime() === today.getTime();
  }).length;
  
  const storedReceipts = mockReceipts.filter(r => r.status === 'stored').length;
  const storageUsed = storedReceipts * 0.45; // Average 450KB per PDF
  
  return {
    totalReceipts,
    todayReceipts,
    storageUsed: storageUsed.toFixed(2),
    emailsSent: mockReceipts.filter(r => r.status === 'sent' || r.status === 'stored').length,
  };
};

// Simulate API delay
export const simulateApiCall = <T>(data: T, delay = 800): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay + Math.random() * 500);
  });
};
