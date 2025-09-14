"""
TidyGen ERP Email Service
Handles all email notifications with TidyGen branding.
"""
import logging
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from django.utils.html import strip_tags
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)


class TidyGenEmailService:
    """Centralized email service for TidyGen ERP."""
    
    # Email templates and branding
    BRAND_NAME = "TidyGen ERP"
    BRAND_EMAIL = "noreply@tidygen.com"
    SUPPORT_EMAIL = "support@tidygen.com"
    
    # Email templates (inline for now, can be moved to files later)
    TEMPLATES = {
        'welcome': {
            'subject': 'Welcome to TidyGen ERP - Your Account is Ready!',
            'html_template': '''
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Welcome to TidyGen ERP</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background: #f8fafc; }
                    .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
                    .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 4px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome to TidyGen ERP</h1>
                    </div>
                    <div class="content">
                        <h2>Hello {{ user.first_name }}!</h2>
                        <p>Welcome to TidyGen ERP - the Web3-enabled Enterprise Resource Planning system that's revolutionizing how businesses operate.</p>
                        
                        <p>Your account has been successfully created and is ready to use. Here's what you can do next:</p>
                        
                        <ul>
                            <li>Complete your profile setup</li>
                            <li>Explore the dashboard and features</li>
                            <li>Connect your Web3 wallet for enhanced security</li>
                            <li>Set up your organization's workflows</li>
                        </ul>
                        
                        <p style="text-align: center; margin: 30px 0;">
                            <a href="{{ verification_url }}" class="button">Verify Your Email</a>
                        </p>
                        
                        <p>If you have any questions or need assistance, our support team is here to help at {{ support_email }}.</p>
                        
                        <p>Best regards,<br>The TidyGen Team</p>
                    </div>
                    <div class="footer">
                        <p>© 2024 TidyGen ERP. All rights reserved.</p>
                        <p>This email was sent to {{ user.email }}. If you didn't create an account, please ignore this email.</p>
                    </div>
                </div>
            </body>
            </html>
            ''',
            'text_template': '''
            Welcome to TidyGen ERP!
            
            Hello {{ user.first_name }}!
            
            Welcome to TidyGen ERP - the Web3-enabled Enterprise Resource Planning system that's revolutionizing how businesses operate.
            
            Your account has been successfully created and is ready to use. Here's what you can do next:
            
            - Complete your profile setup
            - Explore the dashboard and features
            - Connect your Web3 wallet for enhanced security
            - Set up your organization's workflows
            
            Verify your email: {{ verification_url }}
            
            If you have any questions or need assistance, our support team is here to help at {{ support_email }}.
            
            Best regards,
            The TidyGen Team
            
            © 2024 TidyGen ERP. All rights reserved.
            This email was sent to {{ user.email }}. If you didn't create an account, please ignore this email.
            '''
        },
        
        'password_reset': {
            'subject': 'TidyGen ERP - Password Reset Request',
            'html_template': '''
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Password Reset - TidyGen ERP</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background: #f8fafc; }
                    .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
                    .button { display: inline-block; padding: 12px 24px; background: #dc2626; color: white; text-decoration: none; border-radius: 4px; }
                    .warning { background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 4px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Password Reset Request</h1>
                    </div>
                    <div class="content">
                        <h2>Hello {{ user.first_name }}!</h2>
                        <p>We received a request to reset your password for your TidyGen ERP account.</p>
                        
                        <p style="text-align: center; margin: 30px 0;">
                            <a href="{{ reset_url }}" class="button">Reset Your Password</a>
                        </p>
                        
                        <div class="warning">
                            <strong>Security Notice:</strong> This link will expire in 1 hour for your security. If you didn't request this password reset, please ignore this email and your password will remain unchanged.
                        </div>
                        
                        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; background: #e5e7eb; padding: 10px; border-radius: 4px;">{{ reset_url }}</p>
                        
                        <p>If you have any questions or need assistance, our support team is here to help at {{ support_email }}.</p>
                        
                        <p>Best regards,<br>The TidyGen Team</p>
                    </div>
                    <div class="footer">
                        <p>© 2024 TidyGen ERP. All rights reserved.</p>
                        <p>This email was sent to {{ user.email }}. If you didn't request a password reset, please ignore this email.</p>
                    </div>
                </div>
            </body>
            </html>
            ''',
            'text_template': '''
            Password Reset Request - TidyGen ERP
            
            Hello {{ user.first_name }}!
            
            We received a request to reset your password for your TidyGen ERP account.
            
            Reset your password: {{ reset_url }}
            
            SECURITY NOTICE: This link will expire in 1 hour for your security. If you didn't request this password reset, please ignore this email and your password will remain unchanged.
            
            If you have any questions or need assistance, our support team is here to help at {{ support_email }}.
            
            Best regards,
            The TidyGen Team
            
            © 2024 TidyGen ERP. All rights reserved.
            This email was sent to {{ user.email }}. If you didn't request a password reset, please ignore this email.
            '''
        },
        
        'invoice': {
            'subject': 'TidyGen ERP - New Invoice #{{ invoice_number }}',
            'html_template': '''
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>New Invoice - TidyGen ERP</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #059669; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background: #f8fafc; }
                    .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
                    .button { display: inline-block; padding: 12px 24px; background: #059669; color: white; text-decoration: none; border-radius: 4px; }
                    .invoice-details { background: white; padding: 20px; border-radius: 4px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>New Invoice Generated</h1>
                    </div>
                    <div class="content">
                        <h2>Hello {{ client_name }}!</h2>
                        <p>A new invoice has been generated for your account through TidyGen ERP.</p>
                        
                        <div class="invoice-details">
                            <h3>Invoice Details:</h3>
                            <p><strong>Invoice Number:</strong> {{ invoice_number }}</p>
                            <p><strong>Amount:</strong> {{ invoice_amount }}</p>
                            <p><strong>Due Date:</strong> {{ due_date }}</p>
                            <p><strong>Description:</strong> {{ invoice_description }}</p>
                        </div>
                        
                        <p style="text-align: center; margin: 30px 0;">
                            <a href="{{ invoice_url }}" class="button">View Invoice</a>
                        </p>
                        
                        <p>If you have any questions about this invoice, please contact us at {{ support_email }}.</p>
                        
                        <p>Best regards,<br>The TidyGen Team</p>
                    </div>
                    <div class="footer">
                        <p>© 2024 TidyGen ERP. All rights reserved.</p>
                        <p>This invoice was generated through TidyGen ERP for {{ client_email }}.</p>
                    </div>
                </div>
            </body>
            </html>
            ''',
            'text_template': '''
            New Invoice Generated - TidyGen ERP
            
            Hello {{ client_name }}!
            
            A new invoice has been generated for your account through TidyGen ERP.
            
            Invoice Details:
            - Invoice Number: {{ invoice_number }}
            - Amount: {{ invoice_amount }}
            - Due Date: {{ due_date }}
            - Description: {{ invoice_description }}
            
            View Invoice: {{ invoice_url }}
            
            If you have any questions about this invoice, please contact us at {{ support_email }}.
            
            Best regards,
            The TidyGen Team
            
            © 2024 TidyGen ERP. All rights reserved.
            This invoice was generated through TidyGen ERP for {{ client_email }}.
            '''
        },
        
        'appointment_reminder': {
            'subject': 'TidyGen ERP - Appointment Reminder: {{ appointment_title }}',
            'html_template': '''
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Appointment Reminder - TidyGen ERP</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #7c3aed; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background: #f8fafc; }
                    .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
                    .appointment-details { background: white; padding: 20px; border-radius: 4px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Appointment Reminder</h1>
                    </div>
                    <div class="content">
                        <h2>Hello {{ user.first_name }}!</h2>
                        <p>This is a friendly reminder about your upcoming appointment scheduled through TidyGen ERP.</p>
                        
                        <div class="appointment-details">
                            <h3>Appointment Details:</h3>
                            <p><strong>Title:</strong> {{ appointment_title }}</p>
                            <p><strong>Date & Time:</strong> {{ appointment_datetime }}</p>
                            <p><strong>Duration:</strong> {{ appointment_duration }}</p>
                            <p><strong>Location:</strong> {{ appointment_location }}</p>
                            <p><strong>Description:</strong> {{ appointment_description }}</p>
                        </div>
                        
                        <p>If you need to reschedule or cancel this appointment, please contact us at {{ support_email }}.</p>
                        
                        <p>Best regards,<br>The TidyGen Team</p>
                    </div>
                    <div class="footer">
                        <p>© 2024 TidyGen ERP. All rights reserved.</p>
                        <p>This reminder was sent from TidyGen ERP to {{ user.email }}.</p>
                    </div>
                </div>
            </body>
            </html>
            ''',
            'text_template': '''
            Appointment Reminder - TidyGen ERP
            
            Hello {{ user.first_name }}!
            
            This is a friendly reminder about your upcoming appointment scheduled through TidyGen ERP.
            
            Appointment Details:
            - Title: {{ appointment_title }}
            - Date & Time: {{ appointment_datetime }}
            - Duration: {{ appointment_duration }}
            - Location: {{ appointment_location }}
            - Description: {{ appointment_description }}
            
            If you need to reschedule or cancel this appointment, please contact us at {{ support_email }}.
            
            Best regards,
            The TidyGen Team
            
            © 2024 TidyGen ERP. All rights reserved.
            This reminder was sent from TidyGen ERP to {{ user.email }}.
            '''
        }
    }
    
    @classmethod
    def send_welcome_email(cls, user, verification_url: str) -> bool:
        """Send welcome email to new user."""
        try:
            context = {
                'user': user,
                'verification_url': verification_url,
                'support_email': cls.SUPPORT_EMAIL,
                'brand_name': cls.BRAND_NAME
            }
            
            template = cls.TEMPLATES['welcome']
            html_content = cls._render_template(template['html_template'], context)
            text_content = cls._render_template(template['text_template'], context)
            
            return cls._send_email(
                subject=template['subject'],
                html_content=html_content,
                text_content=text_content,
                recipient_list=[user.email]
            )
        except Exception as e:
            logger.error(f"Failed to send welcome email to {user.email}: {e}")
            return False
    
    @classmethod
    def send_password_reset_email(cls, user, reset_url: str) -> bool:
        """Send password reset email."""
        try:
            context = {
                'user': user,
                'reset_url': reset_url,
                'support_email': cls.SUPPORT_EMAIL,
                'brand_name': cls.BRAND_NAME
            }
            
            template = cls.TEMPLATES['password_reset']
            html_content = cls._render_template(template['html_template'], context)
            text_content = cls._render_template(template['text_template'], context)
            
            return cls._send_email(
                subject=template['subject'],
                html_content=html_content,
                text_content=text_content,
                recipient_list=[user.email]
            )
        except Exception as e:
            logger.error(f"Failed to send password reset email to {user.email}: {e}")
            return False
    
    @classmethod
    def send_invoice_email(cls, client_email: str, client_name: str, invoice_data: Dict[str, Any]) -> bool:
        """Send invoice email to client."""
        try:
            context = {
                'client_name': client_name,
                'client_email': client_email,
                'support_email': cls.SUPPORT_EMAIL,
                'brand_name': cls.BRAND_NAME,
                **invoice_data
            }
            
            template = cls.TEMPLATES['invoice']
            html_content = cls._render_template(template['html_template'], context)
            text_content = cls._render_template(template['text_template'], context)
            
            return cls._send_email(
                subject=template['subject'].format(**invoice_data),
                html_content=html_content,
                text_content=text_content,
                recipient_list=[client_email]
            )
        except Exception as e:
            logger.error(f"Failed to send invoice email to {client_email}: {e}")
            return False
    
    @classmethod
    def send_appointment_reminder(cls, user, appointment_data: Dict[str, Any]) -> bool:
        """Send appointment reminder email."""
        try:
            context = {
                'user': user,
                'support_email': cls.SUPPORT_EMAIL,
                'brand_name': cls.BRAND_NAME,
                **appointment_data
            }
            
            template = cls.TEMPLATES['appointment_reminder']
            html_content = cls._render_template(template['html_template'], context)
            text_content = cls._render_template(template['text_template'], context)
            
            return cls._send_email(
                subject=template['subject'].format(**appointment_data),
                html_content=html_content,
                text_content=text_content,
                recipient_list=[user.email]
            )
        except Exception as e:
            logger.error(f"Failed to send appointment reminder to {user.email}: {e}")
            return False
    
    @classmethod
    def send_custom_notification(cls, recipient_email: str, subject: str, message: str, 
                                notification_type: str = 'general') -> bool:
        """Send custom notification email with TidyGen branding."""
        try:
            # Create a generic template for custom notifications
            html_content = f'''
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>{subject}</title>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: #2563eb; color: white; padding: 20px; text-align: center; }}
                    .content {{ padding: 20px; background: #f8fafc; }}
                    .footer {{ padding: 20px; text-align: center; color: #666; font-size: 12px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>TidyGen ERP Notification</h1>
                    </div>
                    <div class="content">
                        <h2>{subject}</h2>
                        <div style="white-space: pre-line;">{message}</div>
                        <p>If you have any questions, please contact our support team at {cls.SUPPORT_EMAIL}.</p>
                        <p>Best regards,<br>The TidyGen Team</p>
                    </div>
                    <div class="footer">
                        <p>© 2024 TidyGen ERP. All rights reserved.</p>
                        <p>This notification was sent from TidyGen ERP to {recipient_email}.</p>
                    </div>
                </div>
            </body>
            </html>
            '''
            
            text_content = f'''
            TidyGen ERP Notification
            
            {subject}
            
            {message}
            
            If you have any questions, please contact our support team at {cls.SUPPORT_EMAIL}.
            
            Best regards,
            The TidyGen Team
            
            © 2024 TidyGen ERP. All rights reserved.
            This notification was sent from TidyGen ERP to {recipient_email}.
            '''
            
            return cls._send_email(
                subject=f"TidyGen ERP - {subject}",
                html_content=html_content,
                text_content=text_content,
                recipient_list=[recipient_email]
            )
        except Exception as e:
            logger.error(f"Failed to send custom notification to {recipient_email}: {e}")
            return False
    
    @classmethod
    def _send_email(cls, subject: str, html_content: str, text_content: str, 
                   recipient_list: List[str]) -> bool:
        """Send email with both HTML and text content."""
        try:
            from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', cls.BRAND_EMAIL)
            
            # Create email message
            msg = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=from_email,
                to=recipient_list
            )
            
            # Attach HTML version
            msg.attach_alternative(html_content, "text/html")
            
            # Send email
            msg.send()
            logger.info(f"Email sent successfully to {recipient_list}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {recipient_list}: {e}")
            return False
    
    @classmethod
    def _render_template(cls, template_string: str, context: Dict[str, Any]) -> str:
        """Render template string with context."""
        try:
            from django.template import Template, Context
            template = Template(template_string)
            return template.render(Context(context))
        except Exception as e:
            logger.error(f"Failed to render template: {e}")
            return template_string


# Convenience functions for easy import
def send_welcome_email(user, verification_url: str) -> bool:
    """Send welcome email to new user."""
    return TidyGenEmailService.send_welcome_email(user, verification_url)


def send_password_reset_email(user, reset_url: str) -> bool:
    """Send password reset email."""
    return TidyGenEmailService.send_password_reset_email(user, reset_url)


def send_invoice_email(client_email: str, client_name: str, invoice_data: Dict[str, Any]) -> bool:
    """Send invoice email to client."""
    return TidyGenEmailService.send_invoice_email(client_email, client_name, invoice_data)


def send_appointment_reminder(user, appointment_data: Dict[str, Any]) -> bool:
    """Send appointment reminder email."""
    return TidyGenEmailService.send_appointment_reminder(user, appointment_data)


def send_custom_notification(recipient_email: str, subject: str, message: str, 
                           notification_type: str = 'general') -> bool:
    """Send custom notification email with TidyGen branding."""
    return TidyGenEmailService.send_custom_notification(recipient_email, subject, message, notification_type)
