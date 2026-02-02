from fastapi import FastAPI, HTTPException, UploadFile, File
from schemas import ReceiptCreate, PaymentMethod, ReceiptItemResponse
from pathlib import Path
# from weasyprint import HTML not working
from jinja2 import Environment, select_autoescape, FileSystemLoader
from fastapi.responses import Response
import pdfkit # Using PDFKit since WeasyPrint refuses to work on my windows
import database_models
from database_models import OrderReceipt, Item # This is used for seeding
from database import engine, SessionLocal


app = FastAPI()




# But wait, subtotal, total, and tax are set to nullable in my db_model, let's create a function to compute them

def compute_totals(items):
  subtotal = sum(i.quantity* i.unit_price for i in items)
  tax = round(subtotal * 0.10, 2) #Round value to 2dp
  total = round(subtotal + tax, 2)

  return subtotal, tax, total

# Omooo, my ORDER_SEEDING needs to use things like tax, subtotal etc, i will have to create a function that creates a receipt

def make_receipt(order_id, customer_name, customer_email, payment_method, items): # The attrs of the db_model
  subtotal, total, tax, = compute_totals(items) # I'm computing the 
  return OrderReceipt(
    order_id=order_id,
    customer_name=customer_name,
    customer_email=customer_email,
    payment_method=payment_method,
    subtotal=subtotal,
    tax = tax,
    total = total,
    items = items # The relationship now gets the ORM item objects

  )


# THE DB Seeding
ORDER_SEED = [
  items = [ # items attribute is actually a relationship to another table, hence this:
            Item(product_name="Laptop", quantity=1, unit_price=50000),
            Item(product_name="Mouse", quantity=2, unit_price=1500),
        ]
    subtotal, tax, total = compute_totals(items)
    OrderReceipt(
        order_id="ORD-001",
        customer_name="Ahmed Hassan",
        customer_email="ahmed@gmail.com",
        payment_method="Transfer",
        subtotal = subtotal
        
    ),

    OrderReceipt(
        order_id="ORD-002",
        customer_name="Fatima Ali",
        customer_email="fatima@yahoo.com",
        payment_method="Crypto-Currency",
        items=[
            Item(product_name="Headphones", quantity=1, unit_price=5000),
        ]
    ),

    OrderReceipt(
        order_id="ORD-003",
        customer_name="Ibrahim Khan",
        customer_email="ibrahim@outlook.com",
        payment_method="Card",
        items=[
            Item(product_name="Monitor", quantity=1, unit_price=15000),
            Item(product_name="Keyboard", quantity=1, unit_price=3000),
        ]
    ),
]






# I Created a DB session for each endpoint
async def get_db_session():
  try: 
    db = SessionLocal()
    yield db
  finally:
    db.close()



# Creating Db_seed 
def init_db(receipt: ReceiptCreate):
  database_models.Base.metadata.create_all(bind=engine) # This creates all the tables in the db
  db = SessionLocal()
  try:
    if db.query(database_models.OrderReceipt).first():
      return # This means we can't populate db since it already has data.
    






@app.get("/receipts")
def get_reciepts():
  return ORDER


# @app.post("/receipts/payment-success") # response_model=ReceiptItemResponse)
# def create_receipt(receipt: ReceiptCreate):
#   data = receipt.model_dump()
#   if hasattr(data.get("payment_method"), "value"):
#     data["payment_method"] = data["payment_method"].value
#   ORDER.append(data)
#   return HTTPException(status_code=200, detail=f"{receipt.customer_name} receipt Created!")



# Uploading files to a system directory
UPLOAD_DIR = Path() / 'file_uploads'
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@app.post("/uploadfile/")
async def upload_file(file_upload: UploadFile):
  data = await file_upload.read()
  save_to = UPLOAD_DIR / file_upload.filename
  with open(save_to, 'wb') as f:
    f.write(data)



# Loading the "templates" folder
env = Environment(
  loader=FileSystemLoader("templates"),
  autoescape=select_autoescape(["html", "xml"]),
)


# This is where the heavy work of turning receipt to Html occurs
def receipt_to_html(data: ReceiptCreate):
  template = env.get_template("receipt.html")
  subtotal = sum(i.quantity* i.unit_price for i in data.items) # Calculating the Subtotal
  tax = subtotal * 0.10
  total = subtotal + tax
  payment_method = data.payment_method.value

  # Declaring the variables
  return template.render(
    receipt=data, 
    total=total,
    subtotal=subtotal,
    tax=tax,
    items = data.items,
    payment_method = payment_method
    )


def html_to_pdf_bytes(html_str: str) -> bytes:
  return pdfkit.from_string(html_str, False)
  # return HTML(string=html_str).write_pdf() weasyprint not working on my PC, lol, maybe because it's a C library pkg


# Webhook Payment Success
@app.post("/webhook/payment-success/")
def order_webhook(receipt: ReceiptCreate):
  html = receipt_to_html(receipt)
  pdf_bytes = html_to_pdf_bytes(html)
  safe_name = receipt.customer_name.replace(" ", "_")
  headers = {
    "Content-Disposition": f'attachment; filename="receipt-{safe_name}.pdf"'
  }
  return Response(content=pdf_bytes, media_type="application/pdf", headers=headers)


