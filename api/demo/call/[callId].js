// Store call data in memory for demo (in production, use a database)
const callStore = new Map();

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { callId } = req.query;
  const callData = callStore.get(callId);
  
  if (!callData) {
    return res.status(404).json({ error: 'Call not found' });
  }

  console.log(`Call status requested for ${callId}:`, callData);
  res.json(callData);
}