// Vercel serverless function for Vapi webhooks
const callStore = new Map();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Invalid webhook payload' });
  }

  const callId = message.call?.id;
  if (!callId) {
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

  switch (message.type) {
    case 'status-update':
      callData.status = message.status;
      break;
      
    case 'transcript':
      if (message.transcriptType === 'final') {
        const speaker = message.role === 'assistant' ? 'AI' : 'Customer';
        callData.transcript.push(`${speaker}: ${message.transcript}`);
        
        const text = message.transcript.toLowerCase();
        if (text.includes('yes') || text.includes('agree')) {
          callData.consent = 'approved';
        } else if (text.includes('no') || text.includes('decline')) {
          callData.consent = 'denied';
        }
      }
      break;
      
    case 'call-end':
      callData.status = 'completed';
      break;
  }

  callStore.set(callId, callData);
  res.json({ received: true });
}