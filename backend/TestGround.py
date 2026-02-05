# How to Generate PDF from HTML in Python using WeasyPrint

from weasyprint import HTML
from jinja2 import Environment, FileSystemLoader, select_autoescape
from schemas import ReceiptCreate
from fastapi.responses import Response


# # UPLOADING ONE FILE AT A TIME
# UPLOAD_DIR = Path() / 'file_uploads'

# @app.post("/uploadfile/")
# async def create_file_upload(file_upload: UploadFile):
#   data = await file_upload.read() # We are "waiting" for the file being uplaoded so we can read it into the object
#   save_to = UPLOAD_DIR / file_upload.filename # Saving it to the UPLOAD_DIR and the path(/) with the file name
#   with open(save_to, 'wb') as f: # Open the object as write binary
#     f.write(data) # Then write the "data" of the file being read

#   return {"File Name": file_upload.filename}





# UPLOADING MULTIPLE FILE AT A TIME
UPLOAD_DIR = Path() / 'file_uploads'

@app.post("/uploadfile/")
async def create_file_upload(file_uploads: list[UploadFile]):
  for file_upload in file_uploads:
    data = await file_upload.read() # We are "waiting" for the file being uplaoded so we can read it into the object
    save_to = UPLOAD_DIR / file_upload.filename # Saving it to the UPLOAD_DIR and the path(/) with the file name
    with open(save_to, 'wb') as f: # Open the object as write binary
      f.write(data) # Then write the "data" of the file being read

  return {"File Name": [f.filename for f in file_uploads]} # We are using a list comprehension in the return statement here




# Environment: This allows us to load the "templates" in which our HTML/XML files exist

env = Environment(
  loader=FileSystemLoader("templates"), # This loads the "templates" dir in the File system
  autoescape=select_autoescape(["html", "xml"]), # This allows us to avoid tags that exists in html like <p> or <h1> so we can get the actual value
)

def render_receipt_html(data: ReceiptCreate):
  template = env.get_template("receipt.html") # This us using the Environment setup at "template" then getting a particular html file
  total = sum(i.quantity * i.unit_price for i in data.items) # Calculating the total by mulitplying the unit_price * the quantity after the "data" uses the Pydantic model(ReceiptCreate) for validation
  return template.render(receipt=data, total=total) # This creates variables for "receipt" to represent data and "total" represent total.



# Function to call and change an HTML file to a bytes type to write to pdf
def html_to_pdf_bytes(html_str: str) -> bytes: # Taking the param(html_str) as a str and returning a data type of bytes
  return HTML(string=html_str).write_pdf()
# The HTML class from WeasyPrint takes the string of HTML and then the write_pdf() method converts it to PDF and returns it as bytes


# Getting the Data from a webhook

@app.post("/webhook/order")
async def order_webhook(receipt: ReceiptCreate):
  html = render_receipt_html(receipt) # This takes the receipt data and renders it as html
  pdf_bytes = html_to_pdf_bytes(html) # Turns the html to PDF bytes

  # Return PDF as a Download

  headers = {
    "Content-Disposition": f'attachment; filename="receipt-{receipt.customer_name}.pdf"'
  }

  return Response(content=pdf_bytes, media_type="application/pdf", headers=headers)

# The header {"Content-Dispostion":...} tells the browser to tread the response like a file download, so it downloads it.



# HOW TO CHANGE A PYDANTIC MODEL DATA INSERTED IN AN HTML TO A PDF THAT IS DOWNLOADABLE
# env = Environment(
#   loader=FileSystemLoader("templates"),
#   autoescape=(["html", "xml"]),
# )

# def receipt_to_html(data: ReceiptCreate):
#   template = env.get_template("receipt.html")
#   subtotal = sum(i.quantity * i.unit_price for i in data.items)
#   tax = subtotal * 0.10
#   total = subtotal + tax
  
#   return template.render(
#     receipt = data,
#     total = total,
#     subtotal = subtotal, 
#     tax=tax,
#     items = data.items
#   )


# def html_to_pdf_bytes(html_str: str) -> bytes:
#   return pdfkit.from_string(html_str, False)


# @app.post("/webhook/payment-success/")
# async def order_webhook(receipt: ReceiptCreate):
#   html = receipt_to_html(receipt)
#   pdf_bytes = html_to_pdf_bytes(html)
#   safe_name = receipt.customer_name.replace(" ", "_")

#   headers = {
#     "Content-Disposition": f'attachment; filename="receipt-{safe_name}.pdf"'
#   }

#   return Response(content=pdf_bytes, media_type="application/pdf", headers=headers)


from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy import Column, Row, Integer, String, Float, Date, ForeignKey
from sqlalchemy.sql import func


Base = declarative_base()


class Receipt(Base):
  __tablename__ = "receipts"
  id = Column(Integer, primary_key = True, index=True, autoincrement=True)
  order_id = Column(String, index=True) # This works better for rounding than "Float"
  subtotal = Column(Float, default=0)
  total = Column(Float, default=0)
  customer_name = Column(String, nullable=False)
  customer_email = Column(String, nullable=False)
  date_of_purchae = Column(Date, server_default=func.current_date())

  items = relationship( # This shows the relationship of the "items" attrs to the "Items" table.
    "Items", 
    back_populates="receipt", # This connects it back to the table
    cascade="all, delete-orphan" # This cascades/deletes all the data from the "receipts" and the "items" table
  )
 
 


class Items(Base):
  __tablename__ = "items"
  id = Column(Integer, primary_key=True, index=True, autoincrement=True)
  receipt_id = Column(Integer, ForeignKey("receipts.id", ondelete="CASCADE"))
  product_name = Column(String)
  quantity = Column(Integer)
  unit_price = Column(Float)

  receipt = relationship("Receipt", back_populates="items")





 
# Uploading files to a system directory
UPLOAD_DIR = Path() / 'file_uploads'
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@app.post("/uploadfile/")
async def upload_file(file_upload: UploadFile):
  data = await file_upload.read()
  save_to = UPLOAD_DIR / file_upload.filename
  with open(save_to, 'wb') as f:
    f.write(data)

