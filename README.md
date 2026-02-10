# MediSchedule - AI-Powered Medical Appointment System

A modern medical appointment scheduling system with AI voice agents and intelligent chatbot assistance.

## 🚀 Features

- **Dashboard Analytics** - Real-time appointment statistics and patient insights
- **AI Voice Agent** - Automated patient calls using Vapi for appointment scheduling
- **Live Transcription** - Real-time call transcripts during voice interactions
- **Patient Management** - Comprehensive patient records with risk profiling
- **Schedule Management** - Appointment tracking with status updates
- **App Assistant** - RAG-powered chatbot for app guidance and troubleshooting
- **Responsive Design** - Modern dark theme with Tailwind CSS

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Charts**: Recharts for data visualization
- **AI**: Google Gemini for intelligent responses
- **Voice**: Vapi for AI voice calls
- **Backend**: Node.js, Express
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js (v16 or higher)
- Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
- Vapi account and API credentials
- ngrok for local webhook testing

## 🔧 Installation

1. **Clone the repository**
```bash
git clone https://github.com/nanichwdry/MediSchedule.git
cd MediSchedule
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create `.env.local` file:
```env
GEMINI_API_KEY=your_gemini_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key

# Vapi Configuration
VAPI_API_KEY=your_vapi_api_key
VAPI_ASSISTANT_ID=your_assistant_id
VAPI_PHONE_NUMBER_ID=your_phone_number_id
VAPI_WEBHOOK_SECRET=your_webhook_secret
PUBLIC_BASE_URL=your_ngrok_url
```

4. **Start the application**
```bash
# Start backend server
node server.js

# Start frontend (in new terminal)
npm run dev
```

## 🌐 Deployment

### Vercel Deployment

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Deploy**
```bash
vercel login
vercel
```

3. **Set Environment Variables** in Vercel dashboard
4. **Update Vapi webhook URL** to your Vercel domain

## 🎯 Usage

### Voice Agent Setup
1. Configure Vapi webhook URL: `your-domain/api/webhooks/vapi`
2. Select a patient from the Voice Agent tab
3. Click "Initiate Call" to start AI-powered conversation
4. Monitor live transcripts during calls

### App Assistant
- Ask questions about app features
- Get troubleshooting help
- Learn about dashboard metrics
- Understand voice agent functionality

## 📊 Features Overview

### Dashboard
- Total appointments and patient statistics
- Weekly activity charts
- Appointment type distribution
- Revenue tracking

### Voice Agent
- Real-time phone calls to patients
- Live transcript display
- Consent tracking
- Call status monitoring

### Patient Management
- Patient records with risk profiles
- Contact information management
- Editable patient details

### Schedule Management
- Appointment status tracking
- Calendar integration
- AI-generated summaries

## 🔒 Security

- Environment variables for sensitive data
- Webhook signature verification
- Secure API key management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the App Assistant for feature guidance
- Review the troubleshooting section
- Open an issue on GitHub

## 🔄 Updates

- v1.0.0 - Initial release with voice agent and dashboard
- v1.1.0 - Added RAG chatbot assistant
- v1.2.0 - Enhanced charts and patient management

---

Built with ❤️ for modern healthcare management