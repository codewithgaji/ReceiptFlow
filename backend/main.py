from fastapi import FastAPI, HTTPException, UploadFile, File, Depends
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



app = FastAPI()




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
def order_webhook(receipt: ReceiptCreate, db: Session = Depends(get_db_session)):
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
    items = [
      Item(
        product_name = i.product_name, 
        quantity = i.quantity, 
        unit_price = i.unit_price, 
      ) 
      for i in receipt.items
    ]
  )




  # Now i can Generate the PDF Using PDFKIT and Jinja2
  html = receipt_to_html(db_receipt) # Chnaging the validated receipt data to html
  pdf_bytes = html_to_pdf_bytes(html)
  

  # Cloudinary Upload
  public_id = f"{db_receipt.order_id}-{db_receipt.receipt_number}" # This creates the public id 

  # And I upload to cloudinary by passing the parameters from the "cloudinary_sevice.py" created.
  pdf_url = upload_pdf_to_cloudinary(pdf_bytes, public_id=public_id)



  # MIGRATING FROM STREAMLINE DOWNLOAD TO UPLOADING ON CLOUDINARY

  # safe_name = db_receipt.customer_name.replace(" ", "_")
  # headers = {
  #   "Content-Disposition": f'attachment; filename="receipt-{safe_name}.pdf"'
  # }
  # return Response(
  #   content=pdf_bytes, media_type="application/pdf", headers=headers)
  
  # Finally we can save it
  db.add(db_receipt)
  db.commit()
  db.refresh(db_receipt)
  
  return {
    "id": db_receipt.order_id,
    "order_id": db_receipt.order_id,
    "receipt_number": db_receipt.receipt_number,
    "Pdf_Url": pdf_url
  }


