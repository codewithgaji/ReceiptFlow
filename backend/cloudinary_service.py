import cloudinary
import tempfile # To create Temporary files
import cloudinary.uploader
import os

def upload_pdf_to_cloudinary(pdf_bytes: bytes, public_id: str) -> str:
  tmp_path = None
  try:
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
      tmp.write(pdf_bytes) # This writes the pdf_bytes and add the suffix ".pdf"  
      tmp.flush()
      tmp_path = tmp.name # Windows File locking while open so setting the value of tmp_path as the tmp name

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