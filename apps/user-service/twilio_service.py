from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException
import os

# Twilio configuration from environment variables
TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN')
TWILIO_VERIFY_SERVICE_SID = os.getenv('TWILIO_VERIFY_SERVICE_SID')

client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN else None

def send_verification_code(phone_number):
    """
    Send OTP verification code to phone number
    """
    try:
        verification = client.verify.v2.services(TWILIO_VERIFY_SERVICE_SID) \
            .verifications \
            .create(to=phone_number, channel='sms')
        
        return {
            'success': True,
            'status': verification.status,
            'message': f'Verification code sent to {phone_number}'
        }
    except TwilioRestException as e:
        return {
            'success': False,
            'error': str(e),
            'message': 'Failed to send verification code'
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'message': 'Unexpected error occurred'
        }

def verify_code(phone_number, code):
    """
    Verify the OTP code for phone number
    """
    try:
        verification_check = client.verify.v2.services(TWILIO_VERIFY_SERVICE_SID) \
            .verification_checks \
            .create(to=phone_number, code=code)
        
        return {
            'success': True,
            'valid': verification_check.valid,
            'status': verification_check.status,
            'message': 'Code verified successfully' if verification_check.valid else 'Invalid code'
        }
    except TwilioRestException as e:
        return {
            'success': False,
            'error': str(e),
            'message': 'Verification failed'
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'message': 'Unexpected error occurred'
        }
