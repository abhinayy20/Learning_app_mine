# User Service - Environment Variables

## Setup Instructions

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Twilio credentials in `.env`:
   - `TWILIO_ACCOUNT_SID`: Your Twilio Account SID
   - `TWILIO_AUTH_TOKEN`: Your Twilio Auth Token
   - `TWILIO_VERIFY_SERVICE_SID`: Your Twilio Verify Service SID

3. Get Twilio credentials from: https://www.twilio.com/console

## Required Environment Variables

- `TWILIO_ACCOUNT_SID`: Twilio Account identifier
- `TWILIO_AUTH_TOKEN`: Twilio authentication token
- `TWILIO_VERIFY_SERVICE_SID`: Twilio Verify service identifier

**Note**: Never commit the `.env` file to version control!
