"""
Tests for TidyGen Email Service
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from unittest.mock import patch, MagicMock
from apps.core.email_service import TidyGenEmailService, send_welcome_email, send_password_reset_email

User = get_user_model()


class TidyGenEmailServiceTest(TestCase):
    """Test cases for TidyGen Email Service."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            first_name='Test',
            last_name='User',
            password='testpass123'
        )
    
    @patch('apps.core.email_service.EmailMultiAlternatives')
    def test_send_welcome_email(self, mock_email):
        """Test sending welcome email."""
        # Mock the email sending
        mock_email_instance = MagicMock()
        mock_email.return_value = mock_email_instance
        
        # Test sending welcome email
        result = send_welcome_email(self.user, 'https://example.com/verify?token=abc123')
        
        # Verify email was created and sent
        self.assertTrue(result)
        mock_email.assert_called_once()
        mock_email_instance.attach_alternative.assert_called_once()
        mock_email_instance.send.assert_called_once()
    
    @patch('apps.core.email_service.EmailMultiAlternatives')
    def test_send_password_reset_email(self, mock_email):
        """Test sending password reset email."""
        # Mock the email sending
        mock_email_instance = MagicMock()
        mock_email.return_value = mock_email_instance
        
        # Test sending password reset email
        result = send_password_reset_email(self.user, 'https://example.com/reset?token=abc123')
        
        # Verify email was created and sent
        self.assertTrue(result)
        mock_email.assert_called_once()
        mock_email_instance.attach_alternative.assert_called_once()
        mock_email_instance.send.assert_called_once()
    
    @patch('apps.core.email_service.EmailMultiAlternatives')
    def test_send_invoice_email(self, mock_email):
        """Test sending invoice email."""
        # Mock the email sending
        mock_email_instance = MagicMock()
        mock_email.return_value = mock_email_instance
        
        # Test invoice data
        invoice_data = {
            'invoice_number': 'INV-001',
            'invoice_amount': '$1,000.00',
            'due_date': 'December 31, 2024',
            'invoice_description': 'Test invoice',
            'invoice_url': 'https://example.com/invoice/1'
        }
        
        # Test sending invoice email
        result = TidyGenEmailService.send_invoice_email(
            client_email='client@example.com',
            client_name='Test Client',
            invoice_data=invoice_data
        )
        
        # Verify email was created and sent
        self.assertTrue(result)
        mock_email.assert_called_once()
        mock_email_instance.attach_alternative.assert_called_once()
        mock_email_instance.send.assert_called_once()
    
    @patch('apps.core.email_service.EmailMultiAlternatives')
    def test_send_custom_notification(self, mock_email):
        """Test sending custom notification."""
        # Mock the email sending
        mock_email_instance = MagicMock()
        mock_email.return_value = mock_email_instance
        
        # Test sending custom notification
        result = TidyGenEmailService.send_custom_notification(
            recipient_email='user@example.com',
            subject='Test Notification',
            message='This is a test notification from TidyGen ERP.',
            notification_type='test'
        )
        
        # Verify email was created and sent
        self.assertTrue(result)
        mock_email.assert_called_once()
        mock_email_instance.attach_alternative.assert_called_once()
        mock_email_instance.send.assert_called_once()
    
    def test_email_templates_contain_tidygen_branding(self):
        """Test that email templates contain TidyGen branding."""
        # Check welcome template
        welcome_template = TidyGenEmailService.TEMPLATES['welcome']
        self.assertIn('TidyGen ERP', welcome_template['subject'])
        self.assertIn('TidyGen ERP', welcome_template['html_template'])
        self.assertIn('TidyGen ERP', welcome_template['text_template'])
        
        # Check password reset template
        reset_template = TidyGenEmailService.TEMPLATES['password_reset']
        self.assertIn('TidyGen ERP', reset_template['subject'])
        self.assertIn('TidyGen ERP', reset_template['html_template'])
        self.assertIn('TidyGen ERP', reset_template['text_template'])
        
        # Check invoice template
        invoice_template = TidyGenEmailService.TEMPLATES['invoice']
        self.assertIn('TidyGen ERP', invoice_template['subject'])
        self.assertIn('TidyGen ERP', invoice_template['html_template'])
        self.assertIn('TidyGen ERP', invoice_template['text_template'])
    
    def test_brand_configuration(self):
        """Test brand configuration."""
        self.assertEqual(TidyGenEmailService.BRAND_NAME, "TidyGen ERP")
        self.assertEqual(TidyGenEmailService.BRAND_EMAIL, "noreply@tidygen.com")
        self.assertEqual(TidyGenEmailService.SUPPORT_EMAIL, "support@tidygen.com")
    
    @patch('apps.core.email_service.EmailMultiAlternatives')
    def test_email_sending_failure_handling(self, mock_email):
        """Test email sending failure handling."""
        # Mock email sending to raise an exception
        mock_email_instance = MagicMock()
        mock_email_instance.send.side_effect = Exception("SMTP Error")
        mock_email.return_value = mock_email_instance
        
        # Test that failure is handled gracefully
        result = send_welcome_email(self.user, 'https://example.com/verify?token=abc123')
        
        # Verify that False is returned on failure
        self.assertFalse(result)
