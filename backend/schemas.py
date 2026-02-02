from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime
from enum import Enum

class PaymentMethod(str, Enum):
  CARD = "Card"
  TRANSFER = "Transfer"
  CRYPTO_CURRENCY="Crypto-Currency"



# First we get the Item Bought by the customer
class ReceiptItemCreate(BaseModel):
  product_name: str
  quantity: int
  unit_price: float


# Now we create the Reciept using this Values
class ReceiptCreate(BaseModel):
  order_id: str
  customer_name: str
  customer_email: EmailStr
  items: list[ReceiptItemCreate]
  payment_method: PaymentMethod




class ReceiptItemResponse(ReceiptItemCreate):
  model_config = ConfigDict(from_attributes = True) # This is  why FastAPI is better, if the item is not available in the table of the db, it checks if the item is an attribute from another table and uses .notation to pluck it's value

  id: int

  
class ReceiptResponse(BaseModel):
  model_config = ConfigDict(from_attributes=True) # This allows the response model work with sqlalchemy model.
  id: int
  order_id: str

  customer_name: str
  customer_email: EmailStr
  payment_method: str

  subtotal: float
  tax: float
  total: float
  pdf_url: str
  created_at: datetime

  items: List[ReceiptItemResponse]



