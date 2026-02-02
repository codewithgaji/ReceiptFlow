import cloudinary
import tempfile # To create Temporary files
import cloudinary.uploader


def upload_pdf_to_cloudinary(pdf_bytes: bytes, public_id: str) -> str:
  with tempfile.NamedTemporaryFile(suffix=".pdf", delete=True) as tmp:
    tmp.write(pdf_bytes) # This writes the pdf_bytws and add the suffix ".pdf"  
    tmp.flush()

    result = cloudinary.uploader.upload(
      tmp.name,
      resource_type = "raw", # This is used ensure the pdf uploads properly
      folder="receipts",
      public_id = public_id,
      overwrite=True,
    )

    return result["secure_url"] # This returns the url generated, 