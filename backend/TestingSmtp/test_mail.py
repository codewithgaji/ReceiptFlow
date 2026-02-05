import os
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv

load_dotenv(r"C:\Users\Gaji\Documents\ReceiptFlow\backend\.env")

smtp_host = os.getenv("SMTP_HOST")
smtp_email = os.getenv("SMTP_EMAIL")
smtp_password = os.getenv("SMTP_APP_PASSWORD")
smtp_port = os.getenv("SMTP_PORT")
from_email = os.getenv("FROM_EMAIL")
if not smtp_email or not smtp_password:
  raise ValueError("Missing smtp_email or smtp_password in .env")

smtp_password = smtp_password.replace(" ", "")


msg = EmailMessage() # Creating an Object of the EmailMessage() class

msg["Subject"] = "Mail Testing"
msg["From"] = from_email
msg["To"] = "gajiyakub2@gmail.com"
msg.set_content(
  "Hi Gaji, \n\n This is a Gmail SMTP test from Python \n\nThanks, \nTest Script"
)


with smtplib.SMTP(smtp_host, smtp_port) as smtp: # This is to open the gmail email at port 587 as smtp
  smtp.ehlo() # This Introduces our Program to Gmail's Server "Hello Server"
  smtp.starttls() # This Turns the connection into an encrypted (secure) connection
  smtp.ehlo() # We do this again because the server wants us to reintroduce ourself on the SECURE CHANNEL
  smtp.login(smtp_email, smtp_password) # Then we login
  smtp.send_message(msg) # And send our message.

print("✅ Sent successfully")