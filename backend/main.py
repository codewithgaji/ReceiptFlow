from fastapi import FastAPI, HTTPException, UploadFile, Depends, BackgroundTasks
from schemas import ReceiptCreate, PaymentMethod, ReceiptItemResponse
from pathlib import Path
# from weasyprint import HTML not working
from jinja2 import Environment, select_autoescape, FileSystemLoader
from fastapi.responses import Response
import pdfkit # Using PDFKit since WeasyPrint refuses to work on my windows
import database_models
from database_models import OrderReceipt, Item # This is used for seeding
from database import engine, SessionLocal
from sqlalchemy.orm import Session
from cloudinary_service import upload_pdf_to_cloudinary
from email_service import send_receipt_email, send_receipt_email_resend
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "https://receipt-flow-eta.vercel.app",
    "http://localhost:5173",
    "http://localhost:8080",],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)


# But wait, subtotal, total, and tax are set to nullable in my db_model, let's create a function to compute them

def compute_totals(items):
  subtotal = sum(i.quantity* i.unit_price for i in items)
  tax = round(subtotal * 0.10, 2) #Round value to 2dp
  total = round(subtotal + tax, 2)

  return subtotal, tax, total

# Omooo, my ORDER_SEEDING needs to use things like tax, subtotal etc, i will have to create a function that creates a receipt

def make_receipt(order_id, customer_name, customer_email, payment_method, business_store, items): # The attrs of the db_model
  subtotal, tax, total,  = compute_totals(items) # I'm computing the values of these variables using the "compute_total()" func.
  return OrderReceipt(
    order_id=order_id,
    customer_name=customer_name,
    customer_email=customer_email,
    business_store=business_store,
    payment_method=payment_method,
    subtotal=subtotal,
    tax = tax,
    total = total,
    items = items # The relationship now gets the ORM item objects

  )


# THE DB Seeding
ORDER_SEED = [
  make_receipt(
    order_id="ORD-001",
    customer_name="Ahmed Hassan",
    customer_email="ahmed@gmail.com",
    payment_method="Transfer",
    business_store="Tech Plaza",
    items=[
      Item(product_name="Laptop", quantity=1, unit_price=50000),
      Item(product_name="Mouse", quantity=2, unit_price=1500),
    ]
  ),
  make_receipt(
    order_id="ORD-002",
    customer_name="Fatima Ali",
    customer_email="fatima@yahoo.com",
    payment_method="Crypto-Currency",
    business_store="Tech Plaza",
    items=[
      Item(product_name="Headphones", quantity=1, unit_price=5000),
    ]
  ),
  make_receipt(
    order_id="ORD-003",
    customer_name="Ibrahim Khan",
    customer_email="ibrahim@outlook.com",
    payment_method="Card",
    business_store="Tech Plaza",
    items=[
      Item(product_name="Monitor", quantity=1, unit_price=15000),
      Item(product_name="Keyboard", quantity=1, unit_price=3000),
    ]
  ),
  make_receipt(
    order_id="ORD-004",
    customer_name="Zainab Mohammed",
    customer_email="zainab@gmail.com",
    payment_method="Transfer",
    business_store="Tech Plaza",
    items=[
      Item(product_name="USB Cable", quantity=5, unit_price=500),
      Item(product_name="HDMI Cable", quantity=2, unit_price=1000),
    ]
  ),
  make_receipt(
    order_id="ORD-005",
    customer_name="Omar Malik",
    customer_email="omar@outlook.com",
    payment_method="Card",
    business_store="Tech Plaza",
    items=[
      Item(product_name="Webcam", quantity=1, unit_price=8000),
      Item(product_name="Microphone", quantity=1, unit_price=6000),
    ]
  ),
]



# I Created a DB session for each endpoint
def get_db_session():
  try: 
    db = SessionLocal()
    yield db
  finally:
    db.close()



# Creating Db_seed 
@app.on_event("startup")
def init_db():
  database_models.Base.metadata.create_all(bind=engine) # This creates all the tables in the db
  db = SessionLocal()
  try:
    if db.query(database_models.OrderReceipt).first():
      return # This means we can't populate db since it already has data.
    


    # for receipt in ORDER_SEED:
    #   data = receipt.model_dump()
    #   items_data = data.pop("items", [])

    #    # enums -> string values, changing the enum to string values. Just incase my DB acts up.
    #   if hasattr(data.get("payment_method"), "value"):
    #       data["payment_method"] = data["payment_method"].value

    #   # Creating the parent and child relationship of the receipt and items table
    #   db_order_receipt = OrderReceipt(**data)
    #   db_order_receipt.items = [Item(**item) for item in items_data]
    #   db.add(db_order_receipt)
    # db.commit() # Save to database

    # I don't think i need the above if I'm already computing it properyl using the functions

    db.add_all(ORDER_SEED)
    db.commit()
  finally:
    db.close()
    






@app.get("/receipts")
def get_reciepts(db: Session = Depends(get_db_session)):
  db_receipts = db.query(OrderReceipt).all()
  if not db_receipts:
    raise HTTPException(status_code=400, detail="No Order Receipts Found in the db")
  return db_receipts
  


# @app.post("/receipts/payment-success") # response_model=ReceiptItemResponse)
# def create_receipt(receipt: ReceiptCreate):
#   data = receipt.model_dump()
#   if hasattr(data.get("payment_method"), "value"):
#     data["payment_method"] = data["payment_method"].value
#   ORDER.append(data)
#   return HTTPException(status_code=200, detail=f"{receipt.customer_name} receipt Created!")



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
  payment_method = (
    data.payment_method.value
    if hasattr(data.payment_method, "value")
    else data.payment_method
  ) # Using this, just in case the db messes up the value of the Enum

  business_store= data.business_store


  # Declaring the variables
  return template.render(
    receipt=data, 
    total=total,
    subtotal=subtotal,
    tax=tax,
    items = data.items,
    payment_method = payment_method,
    business_store = business_store
    )


def html_to_pdf_bytes(html_str: str) -> bytes:
  return pdfkit.from_string(html_str, False)
  # return HTML(string=html_str).write_pdf() weasyprint not working on my PC, lol, maybe because it's a C library pkg


# Webhook Payment Success
@app.post("/webhook/payment-success/")
def order_webhook(receipt: ReceiptCreate, background_tasks: BackgroundTasks,db: Session = Depends(get_db_session)):
  receipt_exists = db.query(OrderReceipt).filter(OrderReceipt.order_id == receipt.order_id).first()

  if receipt_exists:
    raise HTTPException(status_code=409, detail="Order Receipt Already Exists, can't add new Receipt")
  
  # We need to compute total and the likes for the receipt data
  subtotal = sum(i.quantity* i.unit_price for i in receipt.items)
  tax = round(subtotal * 0.10, 2) #Round value to 2dp
  total = round(subtotal + tax, 2)


  # Creating the Object Relational Mapper for the Parent and child class
  db_receipt = OrderReceipt(
    order_id = receipt.order_id,
    customer_name=receipt.customer_name,
    customer_email=str(receipt.customer_email),
    payment_method=receipt.payment_method.value,
    subtotal=subtotal,
    tax=tax,
    total=total,
    business_store=receipt.business_store,
    items = [
      Item(
        product_name = i.product_name, 
        quantity = i.quantity, 
        unit_price = i.unit_price, 
      ) 
      for i in receipt.items
    ]
  )

  # Finally we can save it - Moved This down here so incase the generation and smtp don't work we can easily be sure that the data was not saved
  db.add(db_receipt)
  db.commit()
  db.refresh(db_receipt)
  print("STEP 1: saved to DB", db_receipt.id)

  # Now i can Generate the PDF Using PDFKIT and Jinja2
  html = receipt_to_html(db_receipt)
  print("STEP 2: html ready", len(html)) # Chnaging the validated receipt data to html
  pdf_bytes = html_to_pdf_bytes(html)
  print("STEP 3: pdf bytes ready", len(pdf_bytes))

  # Cloudinary Upload
  public_id = f"{db_receipt.order_id}-{db_receipt.receipt_number}" # This creates the public id 
   # Cloudinary Upload
  public_id = f"{db_receipt.order_id}-{db_receipt.receipt_number}"

  try: # This Try catch block is to catch any errors that might occur during the cloudinary upload process, and also to print out the error for debugging purposes on Railway.
    print("STEP 4: starting cloudinary upload", public_id, len(pdf_bytes))
    pdf_url = upload_pdf_to_cloudinary(pdf_bytes, public_id=public_id)
    print("STEP 5: cloudinary ok", pdf_url)
  except Exception as e:
    print("STEP 4 FAILED: cloudinary error:", repr(e))
    raise HTTPException(status_code=502, detail="Cloudinary upload failed")

  db_receipt.pdf_url = pdf_url
  db.commit()
  db.refresh(db_receipt)
  print(" ✅ STEP 6: Receipt URL Saved Successfully on DB", pdf_url)

  # Send Email in Background(So it won't block the process)

  print("STEP 7: Starting Email SMTP", db_receipt.customer_email, pdf_url) # This is to check if the email and pdf url are correct before sending the email, and also to check if the process is reaching this point.
  background_tasks.add_task(
    send_receipt_email,
    to_email=db_receipt.customer_email,
    customer_name=db_receipt.customer_name,
    pdf_url=pdf_url,
    business_store = db_receipt.business_store,
    order_id = db_receipt.order_id
  )

  # RESEND
  print("STEP 8: Starting Resend Email SMTP", db_receipt.customer_email, pdf_url)
  try:
    background_tasks.add_task( # Resend email task, in case the first one fails, this will be retried by Resend's retry mechanism, and also it will be useful for the resend email feature in the frontend.
      send_receipt_email_resend,
      to_email=db_receipt.customer_email,
      customer_name=db_receipt.customer_name,
      pdf_url=pdf_url,
      business_store = db_receipt.business_store,
      order_id = db_receipt.order_id
    )
  except Exception as e:
    print("Failed to add Resend email task:", repr(e))


  # MIGRATING FROM STREAMLINE DOWNLOAD TO UPLOADING ON CLOUDINARY

  # safe_name = db_receipt.customer_name.replace(" ", "_")
  # headers = {
  #   "Content-Disposition": f'attachment; filename="receipt-{safe_name}.pdf"'
  # }
  # return Response(
  #   content=pdf_bytes, media_type="application/pdf", headers=headers)
  
  
  
  return {
    "id": db_receipt.id,
    "order_id": db_receipt.order_id,
    "receipt_number": db_receipt.receipt_number,
    "Pdf_Url": pdf_url
  }


