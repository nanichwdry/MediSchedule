import React, { useState } from 'react';
import { Bot, X, HelpCircle, BarChart3, Phone, Users, Calendar, Settings } from 'lucide-react';

const AppChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const appFeatures = [
    {
      icon: BarChart3,
      title: "Dashboard Analytics",
      description: "View real-time appointment statistics, patient insights, weekly activity charts, and revenue tracking."
    },
    {
      icon: Phone,
      title: "AI Voice Agent",
      description: "Make automated patient calls using Vapi. Monitor live transcripts and track call status in real-time."
    },
    {
      icon: Users,
      title: "Patient Management",
      description: "Manage comprehensive patient records with risk profiling. Edit patient details and contact information."
    },
    {
      icon: Calendar,
      title: "Schedule Management",
      description: "Track appointments with status updates. View appointment types and manage scheduling efficiently."
    }
  ];

  const troubleshooting = [
    {
      question: "How do I make voice calls to patients?",
      answer: "Go to Voice Agent tab, select a patient, and click 'Initiate Call'. Monitor live transcripts during calls."
    },
    {
      question: "Why aren't live transcripts showing?",
      answer: "Check your Vapi webhook configuration and ensure PUBLIC_BASE_URL is set correctly in environment variables."
    },
    {
      question: "How do I edit patient information?",
      answer: "Go to Patients tab, hover over a patient card, and click the edit (pencil) icon to modify details."
    },
    {
      question: "What does the dashboard show?",
      answer: "Dashboard displays total appointments, patient statistics, weekly activity charts, and appointment distribution."
    }
  ];

  return (
    <>
      {/* Floating Help Icon */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-primary-600 hover:bg-primary-500 text-white rounded-full shadow-lg shadow-primary-900/20 flex items-center justify-center transition-all hover:scale-105"
        >
          <Bot className="w-6 h-6" />
        </button>
      </div>

      {/* Help Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">MediSchedule Assistant</h2>
                  <p className="text-slate-400 text-sm">Application guide and troubleshooting</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Features Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary-500" />
                  Application Features
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {appFeatures.map((feature, idx) => (
                    <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-primary-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <feature.icon className="w-5 h-5 text-primary-500" />
                        </div>
                        <div>
                          <h4 className="font-medium text-white mb-1">{feature.title}</h4>
                          <p className="text-sm text-slate-400">{feature.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Troubleshooting Section */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-primary-500" />
                  Frequently Asked Questions
                </h3>
                <div className="space-y-4">
                  {troubleshooting.map((item, idx) => (
                    <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <h4 className="font-medium text-white mb-2">{item.question}</h4>
                      <p className="text-sm text-slate-400">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tech Stack Info */}
              <div className="mt-8 p-4 bg-slate-950 rounded-xl border border-slate-800">
                <h4 className="font-medium text-white mb-2">Tech Stack</h4>
                <p className="text-sm text-slate-400">
                  Built with React, TypeScript, Tailwind CSS, Vapi for voice calls, and Google Gemini for AI responses.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AppChatbot;