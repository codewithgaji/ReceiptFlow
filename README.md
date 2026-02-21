# 📄 ReceiptFlow – Backend E-Commerce Receipt Generator

A production-ready backend system for automated receipt generation, delivery, and management built with FastAPI and modern cloud technologies.

## 📌 Overview

ReceiptFlow is a comprehensive backend solution developed during my internship at **ArchSaint Nexus** that automates the entire receipt lifecycle for e-commerce transactions. The system handles everything from payment webhook triggers to PDF generation and email delivery, demonstrating real-world backend engineering patterns and integrations.

### Workflow

1. **Webhook Reception** – Payment success triggers the workflow
2. **Data Validation** – Request payload validated using Pydantic schemas
3. **Database Persistence** – Receipt and line items saved with proper relationships
4. **Template Rendering** – Dynamic HTML receipt generated via Jinja2
5. **PDF Conversion** – HTML transformed into professional PDF document
6. **Cloud Storage** – PDF uploaded to Cloudinary with secure URL
7. **Email Delivery** – Customer receives receipt via SMTP

## 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| **FastAPI** | High-performance backend framework |
| **SQLAlchemy** | Database ORM and model management |
| **PostgreSQL** | Relational database |
| **Alembic** | Database migration management |
| **Jinja2** | HTML template rendering engine |
| **PDFKit** | HTML to PDF conversion |
| **Cloudinary** | Cloud file storage and CDN |
| **SMTP (Gmail)** | Email delivery service |
| **Pydantic** | Request/response validation |

## 📂 Project Structure

```
backend/
│
├── main.py                    # FastAPI application and routes
├── database.py                # Database connection and session
├── database_models.py         # SQLAlchemy models
├── schemas.py                 # Pydantic validation schemas
├── cloudinary_service.py      # Cloudinary upload logic
├── email_service.py           # SMTP email service
├── templates/
│   └── receipt.html          # Jinja2 receipt template
├── alembic/                   # Migration files
└── .env                       # Environment configuration
```

## 🚀 API Endpoints

### Get All Receipts
```http
GET /receipts
```
Retrieves all receipts from the database with their associated line items.

**Response:**
```json
[
  {
    "id": 1,
    "receipt_number": "REC-12345",
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "pdf_url": "https://cloudinary.com/...",
    "items": [...]
  }
]
```

### Payment Success Webhook
```http
POST /webhook/payment-success/
```
Processes payment confirmation and generates receipt.

**Request Body:**
```json
{
  "order_id": "ORD-011",
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "items": [
    {
      "product_name": "Laptop",
      "quantity": 1,
      "unit_price": 50000
    }
  ],
  "payment_method": "Card",
  "business_store": "Tech Plaza"
}
```

**Response:**
```json
{
  "message": "Receipt generated and sent successfully",
  "receipt_number": "REC-12345",
  "pdf_url": "https://res.cloudinary.com/..."
}
```

## 🧾 Receipt Generation

The system uses **Jinja2** templates to create professional, branded receipts that include:

- Customer information (name, email)
- Business details (store name)
- Itemized product list with quantities and prices
- Subtotal, tax calculation, and grand total
- Payment method and transaction details
- Receipt number and timestamp

The rendered HTML is then converted to PDF format using **PDFKit** for consistent, print-ready output.

## ☁️ Cloud Storage Integration

Generated PDFs are uploaded to **Cloudinary** with the following features:

- Organized in dedicated `receipts/` folder
- Unique `public_id` for each receipt
- Secure, CDN-delivered download URLs
- Configured for raw file (PDF) delivery

**Configuration:**
```python
cloudinary.config(
    cloud_name="your_cloud_name",
    api_key="your_api_key",
    api_secret="your_api_secret"
)
```

## 📧 Email Delivery

Receipts are delivered to customers via **SMTP** using Gmail's mail server.

**Key Implementation Details:**
- Host: `smtp.gmail.com`
- Port: `587` (TLS)
- Authentication: Gmail App Password
- HTML email with download link
- Error handling and retry logic

## 📚 Key Learnings

### Webhooks
- Processing real-time payment events
- Payload validation and error handling
- Event-driven architecture patterns

### PDF Generation
- Dynamic HTML template rendering
- Cross-platform PDF conversion challenges
- Temporary file management on Windows

### Cloud File Storage
- Uploading non-image file types
- Security configuration for public access
- CDN integration and URL management

### SMTP Protocol
- TLS vs SSL connection types
- Gmail App Password authentication
- Common SMTP debugging techniques

### Database Design
- One-to-many relationships (Receipt ↔ Items)
- Foreign key constraints and cascading
- Schema evolution strategies

### Migration Management
- Alembic auto-generation workflow
- Adding columns without data loss
- Handling NOT NULL constraints safely

## ⚠️ Challenges & Solutions

| Challenge | Solution |
|-----------|----------|
| **WeasyPrint compatibility on Windows** | Switched to PDFKit for stable cross-platform support |
| **Cloudinary blocking PDF delivery** | Enabled PDF/ZIP delivery in security settings |
| **Temporary file permission errors** | Used `delete=False` with manual cleanup |
| **SMTP connection failures** | Fixed host typos (`smtpifgmail.com` → `smtp.gmail.com`) and TLS configuration |
| **Database commit timing** | Reordered logic to commit only after successful Cloudinary upload |

## 🔧 Setup Instructions

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/receiptflow.git
cd receiptflow
```

2. **Install dependencies**
```bash
pip install -r requirements.txt
```

3. **Configure environment variables**
```env
DATABASE_URL=postgresql://user:password@localhost/receiptflow
CLOUDINARY_CLOUD_NAME=my_cloud_name
CLOUDINARY_API_KEY=my_api_key
CLOUDINARY_API_SECRET=my_api_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=my_email@gmail.com
SMTP_PASSWORD=my_app_password
```

4. **Run migrations**
```bash
alembic upgrade head
```

5. **Start the server**
```bash
uvicorn main:app --reload
```

## 📈 Future Enhancements

- [ ] Background task queue using Celery + Redis
- [ ] Rich HTML email templates with inline CSS
- [ ] JWT authentication for API endpoints
- [ ] Admin dashboard for receipt analytics
- [ ] Multi-tenant support for different businesses
- [ ] Receipt customization options
- [ ] Webhook signature verification
- [ ] Rate limiting and request throttling

## 🏁 Conclusion

ReceiptFlow demonstrates a complete, production-ready backend workflow integrating webhooks, database management, PDF generation, cloud storage, and email delivery. This project strengthened my understanding of real-world backend engineering, system integration, and handling the complexities of third-party service dependencies.

---

**Built with ❤️ during my internship at ArchSaint Nexus**
