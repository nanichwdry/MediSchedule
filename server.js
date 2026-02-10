import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';

config({ path: '.env.local' });

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'MediSchedule Backend API', status: 'running' });
});

// Store call data in memory for demo
const callStore = new Map();

// Demo outbound call endpoint
app.post('/api/demo/vapi-call', async (req, res) => {
  const { phoneNumber, consentType = 'marketing', customerId } = req.body;
  
  if (!phoneNumber) {
    return res.status(400).json({ error: 'phoneNumber required' });
  }

  try {
    const response = await fetch('https://api.vapi.ai/call', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        assistantId: process.env.VAPI_ASSISTANT_ID,
        phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID,
        customer: {
          number: phoneNumber
        },
        metadata: {
          consentType,
          customerId,
          source: 'demo'
        }
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Vapi call failed');
    }

    // Store call data
    callStore.set(data.id, {
      id: data.id,
      phoneNumber,
      status: 'initiated',
      transcript: [],
      consent: 'unknown',
      createdAt: new Date()
    });

    res.json({ callId: data.id, status: 'initiated' });
  } catch (error) {
    console.error('Vapi call error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook handler
app.post('/api/webhooks/vapi', (req, res) => {
  console.log('Webhook received:', JSON.stringify(req.body, null, 2));
  
  const { message } = req.body;
  
  if (!message) {
    console.log('No message in webhook payload');
    return res.status(400).json({ error: 'Invalid webhook payload' });
  }

  const callId = message.call?.id;
  if (!callId) {
    console.log('No call ID in message');
    return res.status(200).json({ received: true });
  }

  let callData = callStore.get(callId);
  if (!callData) {
    callData = {
      id: callId,
      phoneNumber: message.call?.customer?.number || 'unknown',
      status: 'unknown',
      transcript: [],
      consent: 'unknown',
      createdAt: new Date()
    };
  }

  console.log(`Processing message type: ${message.type} for call: ${callId}`);

  // Handle different message types
  switch (message.type) {
    case 'status-update':
      callData.status = message.status;
      console.log(`Status updated to: ${message.status}`);
      break;
      
    case 'transcript':
      if (message.transcriptType === 'final') {
        const speaker = message.role === 'assistant' ? 'AI' : 'Customer';
        const transcriptLine = `${speaker}: ${message.transcript}`;
        callData.transcript.push(transcriptLine);
        console.log(`Transcript added: ${transcriptLine}`);
        
        // Parse consent from transcript
        const text = message.transcript.toLowerCase();
        if (text.includes('yes') || text.includes('agree') || text.includes('accept')) {
          callData.consent = 'approved';
        } else if (text.includes('no') || text.includes('decline') || text.includes('refuse')) {
          callData.consent = 'denied';
        }
      }
      break;
      
    case 'call-end':
      callData.status = 'completed';
      console.log(`Call ended: ${callId}`);
      break;
      
    default:
      console.log(`Unhandled message type: ${message.type}`);
  }

  callStore.set(callId, callData);
  res.json({ received: true });
});

// Get call status
app.get('/api/demo/call/:callId', (req, res) => {
  const callData = callStore.get(req.params.callId);
  if (!callData) {
    return res.status(404).json({ error: 'Call not found' });
  }
  console.log(`Call status requested for ${req.params.callId}:`, callData);
  res.json(callData);
});

// Test webhook endpoint
app.get('/api/webhooks/test', (req, res) => {
  res.json({ 
    status: 'Webhook endpoint is working',
    activeCalls: Array.from(callStore.keys()),
    timestamp: new Date().toISOString()
  });
});

// List all calls for debugging
app.get('/api/demo/calls', (req, res) => {
  const calls = Array.from(callStore.values());
  res.json({ calls, count: calls.length });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});