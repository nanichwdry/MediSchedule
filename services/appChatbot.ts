interface AppKnowledge {
  id: string;
  topic: string;
  content: string;
  category: 'features' | 'usage' | 'technical' | 'troubleshooting';
}

class AppChatbotService {
  private appKnowledge: AppKnowledge[] = [
    {
      id: '1',
      topic: 'Dashboard Overview',
      content: 'The MediSchedule dashboard shows appointment statistics, patient counts, weekly activity charts, and appointment type breakdowns. It displays total appointments, pending confirmations, active patients, and estimated monthly revenue.',
      category: 'features'
    },
    {
      id: '2',
      topic: 'Voice Agent Calls',
      content: 'The Voice Agent uses Vapi to make real phone calls to patients for appointment scheduling. Select a patient, click "Initiate Call", and the AI will handle the conversation. Live transcripts appear during calls.',
      category: 'features'
    },
    {
      id: '3',
      topic: 'Patient Management',
      content: 'The Patients tab shows all patient records with risk profiles (Low, Moderate, High). You can edit patient information by clicking the pencil icon. Each patient has contact details and medical risk assessment.',
      category: 'features'
    },
    {
      id: '4',
      topic: 'Schedule Management',
      content: 'The Schedule tab displays all appointments with status tracking (Pending, Scheduled, Completed). You can update appointment statuses and view appointment details including AI summaries from voice calls.',
      category: 'features'
    },
    {
      id: '5',
      topic: 'Webhook Configuration',
      content: 'For live transcripts to work, configure your Vapi assistant webhook URL to point to your ngrok tunnel + /api/webhooks/vapi. The backend server handles webhook events and stores call data.',
      category: 'technical'
    },
    {
      id: '6',
      topic: 'Environment Setup',
      content: 'Required environment variables: VITE_GEMINI_API_KEY for AI features, VAPI_API_KEY, VAPI_ASSISTANT_ID, VAPI_PHONE_NUMBER_ID for voice calls, and PUBLIC_BASE_URL for webhook endpoints.',
      category: 'technical'
    },
    {
      id: '7',
      topic: 'Transcript Issues',
      content: 'If live transcripts are not appearing: 1) Check if backend server is running on port 3001, 2) Verify ngrok tunnel is active, 3) Confirm Vapi webhook URL is correctly configured, 4) Check browser console for errors.',
      category: 'troubleshooting'
    }
  ];

  private findRelevantKnowledge(query: string): AppKnowledge[] {
    const queryWords = query.toLowerCase().split(' ');
    return this.appKnowledge
      .map(item => {
        const contentWords = item.content.toLowerCase().split(' ');
        const topicWords = item.topic.toLowerCase().split(' ');
        
        let score = 0;
        queryWords.forEach(word => {
          if (contentWords.includes(word)) score += 1;
          if (topicWords.includes(word)) score += 2;
        });
        
        return { item, score: score / queryWords.length };
      })
      .filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(result => result.item);
  }

  async chatWithBot(message: string, conversationHistory: string[] = []): Promise<{
    response: string;
    sources: AppKnowledge[];
  }> {
    try {
      const relevantKnowledge = this.findRelevantKnowledge(message);
      
      // Fallback responses without API
      const responses: Record<string, string> = {
        'voice calls': 'To make voice calls: 1) Go to Voice Agent tab, 2) Select a patient from the dropdown, 3) Click "Initiate Call", 4) The AI will handle the conversation automatically.',
        'dashboard': 'The Dashboard shows: Total appointments (50), Pending confirmations (5), Active patients (1,284), Weekly activity chart, and Appointment types breakdown.',
        'patients': 'Patient Management: View all patients with risk profiles, edit patient info by clicking the pencil icon, see contact details and medical risk assessments.',
        'schedule': 'Schedule Management: View all appointments, update status (Pending/Scheduled/Completed), see AI summaries from voice calls.',
        'transcript': 'For live transcripts: 1) Start backend server, 2) Configure Vapi webhook URL, 3) Make actual phone calls - transcripts appear during real conversations.',
        'webhook': 'Webhook setup: Set your Vapi assistant webhook to your ngrok URL + /api/webhooks/vapi. Backend server must be running on port 3001.'
      };
      
      const query = message.toLowerCase();
      let response = "I can help with MediSchedule features! Ask about: dashboard stats, voice agent calls, patient management, scheduling, or troubleshooting.";
      
      for (const [key, value] of Object.entries(responses)) {
        if (query.includes(key)) {
          response = value;
          break;
        }
      }
      
      return {
        response,
        sources: relevantKnowledge
      };

    } catch (error) {
      console.error('Chatbot error:', error);
      return {
        response: "I can help with MediSchedule features! Ask about: dashboard stats, voice agent calls, patient management, scheduling, or troubleshooting.",
        sources: []
      };
    }
  }
}

export const appChatbot = new AppChatbotService();
export type { AppKnowledge };