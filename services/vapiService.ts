// Backend API service for Vapi calls
const API_BASE = 'http://localhost:3001';

export interface CallRequest {
  phoneNumber: string;
  consentType?: string;
  customerId?: string;
}

export interface CallStatus {
  id: string;
  phoneNumber: string;
  status: string;
  transcript: string[];
  consent: 'approved' | 'denied' | 'unknown';
  createdAt: string;
}

export const startVapiCall = async (request: CallRequest): Promise<{ callId: string; status: string }> => {
  const response = await fetch(`${API_BASE}/api/demo/vapi-call`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to start call');
  }

  return response.json();
};

export const getCallStatus = async (callId: string): Promise<CallStatus> => {
  const response = await fetch(`${API_BASE}/api/demo/call/${callId}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get call status');
  }

  return response.json();
};

// Remove all browser Vapi integration
export const vapi = null;
export const stopVapiCall = async () => {
  // Calls are handled by backend, no frontend stop needed
};