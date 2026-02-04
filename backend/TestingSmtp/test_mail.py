import os
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv

load_dotenv(r"C:\Users\Gaji\Documents\Recipe Vault\recipebackend\.env")

GMAIL_EMAIL = os.getenv("GMAIL_EMAIL")
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD")

if not GMAIL_EMAIL or not GMAIL_APP_PASSWORD:
  raise ValueError("Missing GMAIL_EMAIL or GMAIL_APP_PASSWORD in .env")

GMAIL_APP_PASSWORD = GMAIL_APP_PASSWORD.replace(" ", "")


msg = EmailMessage() # Creating an Object of the EmailMessage() class

msg["Subject"] = "Mail Testing"
msg["From"] = GMAIL_EMAIL
msg["To"] = "gajiyakub2@gmail.com"
msg.set_content(
  "Hi Gaji, \n\n This is a Gmail SMTP test from Python \n\nThanks, \nTest Script"
)


with smtplib.SMTP("smtp.gmail.com", 587) as smtp: # This is to open the gmail email at port 587 as smtp
  smtp.ehlo() # This Introduces our Program to Gmail's Server "Hello Server"
  smtp.starttls() # This Turns the connection into an encrypted (secure) connection
  smtp.ehlo() # We do this again because the server wants us to reintroduce ourself on the SECURE CHANNEL
  smtp.login(GMAIL_EMAIL, GMAIL_APP_PASSWORD) # Then we login
  smtp.send_message(msg) # And send our message.

print("✅ Sent successfully")