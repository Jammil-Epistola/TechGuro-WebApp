# TGbackend/email_config.py
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import EmailStr
from typing import List
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME", "techguro9@gmail.com"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM", "techguro9@gmail.com"),
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

async def send_reset_email(email: EmailStr, reset_code: str):
    html = f"""
    <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #4C5173;">TechGuro Password Reset</h2>
            <p>You requested to reset your password. Use the code below:</p>
            <div style="background: #f0f0f0; padding: 15px; margin: 20px 0; text-align: center;">
                <h1 style="color: #4C5173; letter-spacing: 5px;">{reset_code}</h1>
            </div>
            <p>This code will expire in 15 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <hr>
            <p style="color: #666; font-size: 12px;">TechGuro - Digital Literacy Platform</p>
        </body>
    </html>
    """
    
    message = MessageSchema(
        subject="TechGuro Password Reset Code",
        recipients=[email],
        body=html,
        subtype="html"
    )
    
    fm = FastMail(conf)
    await fm.send_message(message)


async def send_account_unlock_email(email: EmailStr, unlock_code: str):
    html = f"""
    <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #4C5173;">TechGuro Account Unlock</h2>
            <p>Your account has been locked due to multiple failed login attempts.</p>
            <p>Use the code below to unlock your account:</p>
            <div style="background: #f0f0f0; padding: 15px; margin: 20px 0; text-align: center;">
                <h1 style="color: #4C5173; letter-spacing: 5px;">{unlock_code}</h1>
            </div>
            <p>This code will expire in 30 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <hr>
            <p style="color: #666; font-size: 12px;">TechGuro - Digital Literacy Platform</p>
        </body>
    </html>
    """
    
    message = MessageSchema(
        subject="TechGuro Account Unlock Code",
        recipients=[email],
        body=html,
        subtype="html"
    )
    
    fm = FastMail(conf)
    await fm.send_message(message)