from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.sql import func
from sqlalchemy import Column, Integer, Float, ForeignKey, String, DateTime
import uuid

Base = declarative_base()

class OrderReceipt(Base):
  __tablename__ = "order_receipts" # This is my "order_receipts" table
  id = Column(Integer, primary_key=True, autoincrement=True, index=True) # Index = True, tells my table to create an index for faster lookup
  order_id = Column(String, nullable=False, index=True)

  #Unique ID for receipt
  receipt_number = Column(String, unique=True, index=True, default=lambda: str(uuid.uuid4()))


  customer_name = Column(String, nullable=False)
  customer_email = Column(String, nullable=False)
  business_store = Column(String, nullable=False)

  subtotal = Column(Float, nullable=False)
  total = Column(Float, nullable=False)
  tax = Column(Float)

  payment_method = Column(String, nullable=False)
  created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

  # PDF URL for CLoudinary
  pdf_url = Column(String, nullable=True)


  items = relationship(
    "Item", # This links it to the db model
    back_populates="order_receipt", # This updates the values of the items table as well
    cascade="all, delete-orphan"
  )





class Item(Base):
  __tablename__ = "items"
  id = Column(Integer, primary_key=True, autoincrement=True, index=True)
  receipt_id = Column(Integer, ForeignKey("order_receipts.id", ondelete="CASCADE"), nullable=False) # The relationship here is through the Foreign Key.

  product_name = Column(String, nullable=False)

  quantity = Column(Integer, default=0)
  unit_price = Column(Float, default=0.0)


  # This is being populated using the relationship of items in the OrderReceipt Table
  order_receipt = relationship(
    "OrderReceipt", # Creates a Link to the OrderReceipt model 
    back_populates="items", # This back_populates keeps the db consistent

    # cascade="all, delete-orphan" we can't use the cascade on the child table, because that would mean it is very possible to delete an item, which in turn would delete the parent table(the order receipt)
  )
