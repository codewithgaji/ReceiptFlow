from fastapi import FastAPI, HTTPException, UploadFile, File
from schemas import ReceiptCreate, PaymentMethod, ReceiptItemResponse
from pathlib import Path
# from weasyprint import HTML not working
from jinja2 import Environment, select_autoescape, FileSystemLoader
from fastapi.responses import Response
import pdfkit # Using PDFKit since WeasyPrint refuses to work on my windows


app = FastAPI()

ORDER = [{
  "customer_name": "Gaji Yaqub",
  "customer_email": "gaji@gmail.com",
  "items": [
    {
      "product_name": "Shoe",
      "quantity": 5,
      "unit_price": 250
    },
    {
      "product_name": "Glasses",
      "quantity": 2,
      "unit_price": 300
    }
  ],
  "payment_method": PaymentMethod.CARD
}
]



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
async def create_file_upload(file_upload: UploadFile):
  data = await file_upload.read()
  save_to = UPLOAD_DIR / file_upload.filename
  with open(save_to, 'wb') as f:
    f.write(data)

  return {"File Name": file_upload.filename}


env = Environment(
  loader=FileSystemLoader("templates"),
  autoescape=(["html", "xml"]),
)

def receipt_to_html(data: ReceiptCreate):
  template = env.get_template("receipt.html")
  subtotal = sum(i.quantity * i.unit_price for i in data.items)
  tax = subtotal * 0.10 # Tax is %10
  total = subtotal + tax

  return template.render(
    receipt = data,
    tax=tax,
    subtotal=subtotal,
    items = data.items,
    total=total
  )


def html_to_pdf_bytes(html_str: str) -> bytes:
  return pdfkit.from_string(html_str, False)

@app.post("/webhook/payment-success/")
async def order_webhook(receipt: ReceiptCreate):
  html = receipt_to_html(receipt)
  pdf_bytes = html_to_pdf_bytes(html)
  safe_name = receipt.customer_name.replace(" ", "_")

  headers = {
    "Content-Disposition": f'attachment; filename="receipt-{safe_name}.pdf"'
  }

  return Response(content=pdf_bytes, media_type="application/pdf", headers=headers)




# env = Environment(
#   loader=FileSystemLoader("templates"),
#   autoescape=select_autoescape(["html", "xml"]),
# )


# # This is where the heavy work of turning receipt to Html occurs
# def receipt_to_html(data: ReceiptCreate):
#   template = env.get_template("receipt.html")
#   subtotal = sum(i.quantity* i.unit_price for i in data.items)
#   tax = subtotal * 0.10
#   total = subtotal + tax

#   return template.render(
#     receipt=data, 
#     total=total,
#     subtotal=subtotal,
#     tax=tax,
#     items = data.items
#     )





# def html_to_pdf_bytes(html_str: str) -> bytes:
#   return pdfkit.from_string(html_str, False)
#   # return HTML(string=html_str).write_pdf() weasyprint not working on my PC, lol, maybe because it's a C library pkg


# # Webhook Payment Success
# @app.post("/webhook/payment-success/")
# def order_webhook(receipt: ReceiptCreate):
#   html = receipt_to_html(receipt)
#   pdf_bytes = html_to_pdf_bytes(html)
#   safe_name = receipt.customer_name.replace(" ", "_")

#   headers = {
#     "Content-Disposition": f'attachment; filename="receipt-{safe_name}.pdf"'
#   }

#   return Response(content=pdf_bytes, media_type="application/pdf", headers=headers)