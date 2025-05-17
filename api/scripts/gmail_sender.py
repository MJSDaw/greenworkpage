#!/usr/bin/env python3
import smtplib
import ssl
import sys
import json
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_gmail(sender_email, app_password, receiver_email, subject, body):
    """
    Send an email using Gmail's SMTP server with an app password.
    
    Note: You need to enable 2-Step Verification and generate an App Password
    in your Google Account security settings.
    """
    # Gmail SMTP settings
    smtp_server = "smtp.gmail.com"
    port = 587
    
    # Create a multipart message
    message = MIMEMultipart()
    message["From"] = sender_email
    message["To"] = receiver_email
    message["Subject"] = subject
    
    # Add body to email
    message.attach(MIMEText(body, "html"))
    
    # Create secure connection with server and send email
    context = ssl.create_default_context()
    
    try:
        server = smtplib.SMTP(smtp_server, port)
        server.starttls(context=context)
        server.login(sender_email, app_password)
        server.sendmail(sender_email, receiver_email, message.as_string())
        result = {"status": "success", "message": "Email sent successfully!"}
    except Exception as e:
        result = {"status": "error", "message": str(e)}
    finally:
        server.quit()
        
    return result

if __name__ == "__main__":
    # Read parameters from command line arguments in JSON format
    if len(sys.argv) > 1:
        try:
            params = json.loads(sys.argv[1])
            
            sender_email = params.get("sender_email")
            app_password = params.get("app_password")
            receiver_email = params.get("receiver_email")
            subject = params.get("subject")
            body = params.get("body")
            
            result = send_gmail(sender_email, app_password, receiver_email, subject, body)
            print(json.dumps(result))
        except Exception as e:
            print(json.dumps({"status": "error", "message": f"Invalid parameters: {str(e)}"}))
    else:
        print(json.dumps({"status": "error", "message": "No parameters provided"}))
