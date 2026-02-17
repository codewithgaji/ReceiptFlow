import os
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv
from typing import Dict, Any
# import resend - I'm not using the SDK, but I will be using the SMTP Relay, so I don't need to import the resend package



load_dotenv()


# This function will be called in the webhook using "Background Tasks"
def send_receipt_email(
      to_email:str, 
      customer_name: str, 
      pdf_url: str,  
      order_id: str, 
      business_store: str): # The Function and it's attributes
  smtp_host = os.getenv("SMTP_HOST")
  smtp_email = os.getenv("SMTP_EMAIL")
  smtp_password = os.getenv("SMTP_APP_PASSWORD")
  smtp_port = os.getenv("SMTP_PORT")
  from_email = os.getenv("FROM_EMAIL") # This is still my email, but a representation for "ReceiptFlow"

  if not all([smtp_host, smtp_port, smtp_password, smtp_email, from_email]):
      raise RuntimeError("Missing SMTP env vars (SMTP_HOST/SMTP_PORT/SMTP_PASS/SMTP_EMAIL)")
  
  smtp_password = smtp_password.replace(" ", "") # To remove it's trailing
  
  msg = EmailMessage()  # Creating an Object of the EmailMessage() class

  # Assigning the variables to the message object to be called in the webhook
  msg["Subject"] = f"Your receipt for order {order_id}"
  msg["From"] = from_email 
  msg["To"] = to_email

  msg.set_content(
     f"Hi {customer_name}, \n\n" 
     f"Thanks for your purchase with {business_store} \n\n"
     f"Download Your Receipt here: \n{pdf_url} \n\n"
     f"Regards, \nReceiptFlow"
  )

  try: # Using a try catch block to catch any errors that might occur during the SMTP process, and also to print out the error for debugging purposes.
    with smtplib.SMTP(smtp_host, smtp_port, timeout=20) as server:
       server.set_debuglevel(1)  # Enable debug output
       server.ehlo() # This Introduces our Program to Gmail's Server "Hello Server"
       server.starttls() # This Turns the connection into an encrypted (secure) connection
       server.ehlo()
       server.login(smtp_email, smtp_password)
       server.send_message(msg)
       print("SMTP CONFIG:", smtp_host, smtp_port)
       print(f"✅ Email sent successfully to {to_email}")
  except Exception as e:
       print(f" ❌ Email failed: {e}")
       raise





# RESEND SETUP


# Get Resend API Key from environment variable
def send_receipt_email_resend(
      to_email:str, 
      customer_name: str, 
      pdf_url: str,  
      order_id: str, 
      business_store: str
):
   resend_smtp_host = os.getenv("RESEND_SMTP_HOST")
   resend_smtp_port = os.getenv("RESEND_SMTP_PORT")
   resend_api_key = os.getenv("RESEND_API_KEY")
   from_email = os.getenv("From_EMAIL") # This is still my email, but a representation for "ReceiptFlow"
   if not all([resend_smtp_host, resend_smtp_port, resend_api_key, from_email]):
      raise RuntimeError("Missing Resend SMTP env vars (RESEND_SMTP_HOST/RESEND_SMTP_PORT/RESEND_API_KEY)")
   try:
      msg = EmailMessage()
      msg["Subject"] = f"Your receipt for order {order_id}"
      msg["From"] = from_email
      msg["To"] = to_email

      msg.set_content(
         f"Hi {customer_name}, \n\n"
         f"Thanks for your purchase with {business_store} \n\n"
         f"Download Your Receipt here: \n{pdf_url} \n\n"
         f"Regards, \nReceiptFlow"
      )

      with smtplib.SMTP(resend_smtp_host, int(resend_smtp_port), timeout=20) as server:
         server.set_debuglevel(1)
         server.ehlo()
         server.starttls()
         server.ehlo()
         server.login("resend", resend_api_key) # Resend uses "resend" as the username for SMTP authentication, and the API key as the password.
         server.send_message(msg)
         print("Resend SMTP CONFIG:", resend_smtp_host, resend_smtp_port)
         print(f"✅ Resend Email sent successfully to {to_email}")  
   except Exception as e:
      print(f" ❌ Resend Email failed: {e}")
      raise