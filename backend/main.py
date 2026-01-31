from fastapi import FastAPI, HTTPException
from schemas import ReceiptCreate, PaymentMethod, ReceiptItemResponse

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



