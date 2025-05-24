#!/usr/bin/env python3
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_gmail():
    # Gmail SMTP settings
    smtp_server = "smtp.gmail.com"
    port = 587
    sender_email = "info.greenworksagaseta@gmail.com"
    # Contraseña sin comillas
    password = "tjor lzrm bzhm hiud"
    receiver_email = "info.greenworksagaseta@gmail.com"
    
    print(f"Using sender: {sender_email}")
    print(f"Password length: {len(password)}")
    
    # Create message
    msg = MIMEMultipart()
    msg["From"] = sender_email
    msg["To"] = receiver_email
    msg["Subject"] = "Test Email from Docker Container"
    
    # Add body
    body = "<h1>Test Email</h1><p>This is a test email from the Docker container.</p>"
    msg.attach(MIMEText(body, "html"))
    
    # Send email
    context = ssl.create_default_context()
    try:
        server = smtplib.SMTP(smtp_server, port)
        server.starttls(context=context)
        server.login(sender_email, password)
        server.sendmail(sender_email, receiver_email, msg.as_string())
        print("Email sent successfully!")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        server.quit()

if __name__ == "__main__":
    send_gmail()
