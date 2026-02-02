import cloudinary
import tempfile # To create Temporary files
import cloudinary.uploader
import os

def upload_pdf_to_cloudinary(pdf_bytes: bytes, public_id: str) -> str:
  try:
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=True) as tmp:
      tmp.write(pdf_bytes) # This writes the pdf_bytws and add the suffix ".pdf"  
      tmp.flush()
      tmp_path = tmp.name # saving this path because Temp dir won't allow access once closed

      result = cloudinary.uploader.upload(
        tmp_path,
        resource_type = "raw", # This is used ensure the pdf uploads properly
        folder="receipts",
        public_id = public_id,
        overwrite=True,
      )

      return result["secure_url"] # This returns the url generated, 
  finally:
    if tmp_path and os.path.exists(tmp_path):
      os.remove(tmp_path)