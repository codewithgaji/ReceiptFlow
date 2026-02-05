# ReceiptFlow Frontend Integration Documentation

## Overview

ReceiptFlow is a React-based frontend application for generating and managing receipts. It connects to a FastAPI backend running at `http://localhost:8000` (configurable).

## Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Layout.tsx         # Main layout wrapper with navbar
│   │   └── Navbar.tsx         # Navigation header component
│   └── ui/                    # Shadcn UI components
├── hooks/
│   └── use-toast.ts           # Toast notification hook
├── pages/
│   ├── LandingPage.tsx        # Home page with hero section (/)
│   ├── GeneratePage.tsx       # Receipt generation form (/generate)
│   ├── DashboardPage.tsx      # Receipts list/table (/dashboard)
│   ├── SearchPage.tsx         # Search by receipt ID (/search)
│   └── NotFound.tsx           # 404 page
├── services/
│   └── api.ts                 # API service layer for backend calls
├── types/
│   └── receipt.ts             # TypeScript types for receipts
├── App.tsx                    # Main app with routing
├── index.css                  # Design system and styles
└── main.tsx                   # React entry point
```

## API Endpoints Used

### 1. Create Receipt (Webhook)

**Endpoint:** `POST /webhook/payment-success/`

**Used in:** `src/pages/GeneratePage.tsx`

**Request:**
```json
{
  "order_id": "ORD-123",
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "business_store": "Tech Plaza",
  "payment_method": "Card",
  "items": [
    {
      "product_name": "Laptop",
      "quantity": 1,
      "unit_price": 50000
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "order_id": "ORD-123",
  "receipt_number": "uuid-string",
  "Pdf_Url": "https://cloudinary.com/..."
}
```

**Note:** Response uses `Pdf_Url` (capital P), not `pdf_url`.

---

### 2. Get All Receipts

**Endpoint:** `GET /receipts`

**Used in:** `src/pages/DashboardPage.tsx`

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "order_id": "ORD-001",
    "receipt_number": "uuid",
    "customer_name": "Ahmed Hassan",
    "customer_email": "ahmed@gmail.com",
    "business_store": "Tech Plaza",
    "payment_method": "Transfer",
    "subtotal": 53000.0,
    "tax": 5300.0,
    "total": 58300.0,
    "pdf_url": "https://cloudinary.com/...",
    "created_at": "2024-01-01T12:00:00",
    "items": [
      {
        "id": 1,
        "product_name": "Laptop",
        "quantity": 1,
        "unit_price": 50000
      }
    ]
  }
]
```

**Note:** Response uses lowercase `pdf_url`.

---

### 3. Get Receipt by ID

**Endpoint:** `GET /receipts/{receipt_id}`

**Used in:** `src/pages/SearchPage.tsx`

**Response:** Same structure as single receipt from `/receipts` array.

---

## Where to Change API Base URL

The API base URL is defined in a single location for easy modification:

**File:** `src/services/api.ts`

```typescript
// Line 3 - Change this to your production URL when deploying
export const API_BASE_URL = "http://localhost:8000";
```

**To use environment variables (recommended for production):**

1. Create a `.env` file in the project root:
```env
VITE_API_BASE_URL=http://localhost:8000
```

2. Update `src/services/api.ts`:
```typescript
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
```

---

## Component → Endpoint Mapping

| Component | Endpoint | Purpose |
|-----------|----------|---------|
| `GeneratePage.tsx` | `POST /webhook/payment-success/` | Create new receipt |
| `DashboardPage.tsx` | `GET /receipts` | List all receipts |
| `SearchPage.tsx` | `GET /receipts/{id}` | Find specific receipt |

---

## Payment Method Enum Values

The `payment_method` field accepts ONLY these exact string values:

- `"Card"`
- `"Transfer"`
- `"Crypto-Currency"`

Defined in: `src/types/receipt.ts`

```typescript
export type PaymentMethod = "Card" | "Transfer" | "Crypto-Currency";
export const PAYMENT_METHODS: PaymentMethod[] = ["Card", "Transfer", "Crypto-Currency"];
```

---

## Items Array Structure

Each item in the `items` array must have:

```typescript
interface ReceiptItem {
  product_name: string;  // Required, product name
  quantity: number;      // Required, integer >= 1
  unit_price: number;    // Required, decimal >= 0.01
}
```

---

## Error Handling Approach

The API service (`src/services/api.ts`) handles errors as follows:

1. **Network Errors** (backend not running):
   - Message: "⚠️ Backend not connected. Make sure FastAPI is running on http://localhost:8000"

2. **HTTP 409 Conflict** (duplicate order_id):
   - Message: "Duplicate order ID. A receipt with this order ID already exists."

3. **HTTP 400 Bad Request**:
   - Message: "Validation error: [backend message]"

4. **HTTP 404 Not Found**:
   - Message: "Resource not found."

5. **HTTP 500 Server Error**:
   - Message: "Server error. Please try again later."

All errors are displayed via toast notifications.

---

## Testing Checklist

### Landing Page (/)
- [ ] Hero section displays correctly
- [ ] "ReceiptFlow by Gaji" branding visible
- [ ] "Generate Receipt" button navigates to /generate
- [ ] "View Dashboard" button navigates to /dashboard
- [ ] Responsive on mobile devices

### Generate Page (/generate)
- [ ] All form fields render correctly
- [ ] Payment method dropdown shows all 3 options
- [ ] Can add/remove items dynamically
- [ ] Form validation works (required fields, email format)
- [ ] Submit button shows loading state
- [ ] Success message displays with PDF URL after submission
- [ ] Error message displays when backend is down
- [ ] Error message displays for duplicate order_id (409)
- [ ] Form resets after successful submission
- [ ] Price calculations (subtotal, tax, total) update in real-time

### Dashboard Page (/dashboard)
- [ ] Loading state shows while fetching
- [ ] Error state shows when backend is down
- [ ] Empty state shows when no receipts exist
- [ ] Receipts table displays all columns
- [ ] Search filters by order_id and customer_name
- [ ] "View Details" opens modal with full receipt info
- [ ] "Download PDF" opens PDF in new tab
- [ ] Refresh button reloads data
- [ ] Stats cards show correct totals

### Search Page (/search)
- [ ] Search input accepts numeric ID
- [ ] Search button triggers API call
- [ ] Loading state during search
- [ ] Error state for not found
- [ ] Receipt details display when found
- [ ] Download PDF link works

### Navigation
- [ ] All nav links work correctly
- [ ] Active page is highlighted
- [ ] Logo links to home page
- [ ] Responsive on mobile (icons only)

---

## Notes

### Important Response Field Differences

| Endpoint | Field Name |
|----------|------------|
| `POST /webhook/payment-success/` | `Pdf_Url` (capital P) |
| `GET /receipts` | `pdf_url` (lowercase) |
| `GET /receipts/{id}` | `pdf_url` (lowercase) |

The TypeScript types handle this distinction - see `ReceiptCreateResponse` vs `Receipt` in `src/types/receipt.ts`.

### Currency Format

All currency values are displayed in Nigerian Naira (₦) format using:
```typescript
amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })
```

### Tax Calculation

The frontend displays a 10% tax calculation for preview purposes. The actual tax is calculated by the backend.

---

## Dependencies

- React 18
- React Router v6
- React Hook Form + Zod (form validation)
- Shadcn UI components
- Tailwind CSS
- Lucide React (icons)

---

## Quick Start

1. Ensure FastAPI backend is running at `http://localhost:8000`
2. Start the frontend development server
3. Navigate to `http://localhost:5173` (or your Vite dev server port)
4. Test the receipt generation flow

---

## Deployment Notes

Before deploying to production:

1. Update `API_BASE_URL` in `src/services/api.ts` to your Railway/production URL
2. Or set the `VITE_API_BASE_URL` environment variable
3. Test all endpoints with production backend
4. Verify CORS is configured on the backend for your frontend domain
