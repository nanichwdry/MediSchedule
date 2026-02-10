# Vapi Integration

This project integrates Vapi voice AI for automated patient appointment scheduling calls.

## Features

- Real-time voice calls with AI assistant
- Live transcription display
- Audio visualization
- Automatic appointment booking from call results
- Call analytics with Gemini AI

## Configuration

The following environment variables are configured in `.env.local`:

- `VITE_VAPI_API_KEY` - Your Vapi API key
- `VITE_VAPI_ASSISTANT_ID` - Your Vapi assistant ID
- `VITE_VAPI_PHONE_NUMBER_ID` - Your Vapi phone number ID
- `VITE_VAPI_WEBHOOK_SECRET` - Webhook secret for security
- `VITE_PUBLIC_BASE_URL` - Your public URL for webhooks

## Usage

1. Navigate to the "Voice Calls" tab
2. Select a patient from the dropdown
3. Click "Initiate Call" to start a Vapi voice call
4. Monitor the live transcript and audio visualization
5. End the call manually or let it complete automatically
6. The system will analyze the transcript and create appointments

## How It Works

1. **Call Initiation**: Uses Vapi SDK to start a call with the selected patient
2. **Real-time Events**: Listens to Vapi events for transcription and call status
3. **Visualization**: Shows audio levels and conversation flow
4. **AI Analysis**: Uses Gemini to analyze the transcript and extract appointment details
5. **Auto-booking**: Creates appointments based on the call outcome
