# test_email.py
import asyncio
from email_config import send_reset_email

async def test():
    try:
        await send_reset_email("epistolaj2@gmail.com", "123456")
        print("Email sent successfully!")
    except Exception as e:
        print(f"Failed: {e}")

asyncio.run(test())