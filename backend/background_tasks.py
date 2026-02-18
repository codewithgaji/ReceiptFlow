from fastapi import BackgroundTasks, FastAPI

app = FastAPI()

def write_notification(email: str, message=""): # This is a write function opening a file and writing to it, simulating a notification being sent to the user. In a real world application, this could be an email or a push notification.
  with open("log.txt", mode="w") as email_file:
    content = f"Notification for {email}: {message}"
    email_file.write(content)

async def send_notification(email: str, background_tasks: BackgroundTasks):
  background_tasks.add_task(write_notification, email, message="Some Notification")