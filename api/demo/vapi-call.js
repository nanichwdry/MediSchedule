// Store call data in memory for demo (in production, use a database)
const callStore = new Map();

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
}