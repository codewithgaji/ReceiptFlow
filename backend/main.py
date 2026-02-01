from fastapi import FastAPI, HTTPException, UploadFile, File
from schemas import ReceiptCreate, PaymentMethod, ReceiptItemResponse
from pathlib import Path




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


@app.post("/receipts/payment-success") # response_model=ReceiptItemResponse)
def create_receipt(receipt: ReceiptCreate):
  data = receipt.model_dump()
  if hasattr(data.get("payment_method"), "value"):
    data["payment_method"] = data["payment_method"].value
  ORDER.append(data)
  return HTTPException(status_code=200, detail=f"{receipt.customer_name} receipt Created!")



UPLOAD_DIR = Path() / 'file_uploads'
@app.post("/uploadfile/")
async def create_file_upload(file_upload: UploadFile):
  data = await file_upload.read()
  save_to = UPLOAD_DIR / file_upload.filename
  with open(save_to, 'wb') as f:
    f.write(data)

  return {"File Name": file_upload.filename}









