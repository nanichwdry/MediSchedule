import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, PhoneOff, BarChart2, Activity, User, Phone } from 'lucide-react';
import { Patient, CallStatus } from '../types';
import { analyzeTranscript } from '../services/geminiService';
import { startVapiCall, getCallStatus, CallStatus as BackendCallStatus } from '../services/vapiService';

interface VapiInterfaceProps {
  patients: Patient[];
  onCallComplete: (transcript: string, summary: string) => void;
}

const VapiInterface: React.FC<VapiInterfaceProps> = ({ patients, onCallComplete }) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [status, setStatus] = useState<CallStatus>(CallStatus.IDLE);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [duration, setDuration] = useState(0);
  const [currentCallId, setCurrentCallId] = useState<string | null>(null);
  const [consent, setConsent] = useState<'approved' | 'denied' | 'unknown'>('unknown');
  
  const timerRef = useRef<number>();
  const pollRef = useRef<number>();

  const pollCallStatus = useCallback(async () => {
    if (!currentCallId) return;
    
    try {
      const callData = await getCallStatus(currentCallId);
      setTranscript(callData.transcript);
      setConsent(callData.consent);
      
      if (callData.status === 'completed') {
        setStatus(CallStatus.COMPLETED);
        clearInterval(pollRef.current);
        
        const fullTranscript = callData.transcript.join('\n');
        if (fullTranscript) {
          const { summary } = await analyzeTranscript(fullTranscript);
          onCallComplete(fullTranscript, summary);
        }
        
        setTimeout(() => {
          setStatus(CallStatus.IDLE);
          setTranscript([]);
          setDuration(0);
          setCurrentCallId(null);
          setConsent('unknown');
        }, 3000);
      }
    } catch (error) {
      console.error('Failed to poll call status:', error);
    }
  }, [currentCallId, onCallComplete]);

  useEffect(() => {
    if (status === CallStatus.ACTIVE && currentCallId) {
      pollRef.current = window.setInterval(pollCallStatus, 2000);
    }
    return () => clearInterval(pollRef.current);
  }, [status, currentCallId, pollCallStatus]);

  const startCall = async () => {
    if (!selectedPatientId) return;
    const patient = patients.find(p => p._id === selectedPatientId);
    if (!patient) return;

    setStatus(CallStatus.CONNECTING);
    setTranscript([]);
    setDuration(0);
    setConsent('unknown');

    try {
      const result = await startVapiCall({
        phoneNumber: patient.phone,
        consentType: 'marketing',
        customerId: patient._id
      });
      
      setCurrentCallId(result.callId);
      setStatus(CallStatus.ACTIVE);
    } catch (error) {
      console.error('Failed to start call:', error);
      alert(`Failed to start call: ${error.message}`);
      setStatus(CallStatus.IDLE);
    }
  };

  const endCall = useCallback(async () => {
    if (status === CallStatus.IDLE) return;
    clearInterval(timerRef.current);
    clearInterval(pollRef.current);
    
    setStatus(CallStatus.ANALYZING);
    
    setTimeout(() => {
      setStatus(CallStatus.IDLE);
      setTranscript([]);
      setDuration(0);
      setCurrentCallId(null);
      setConsent('unknown');
    }, 2000);
  }, [status]);

  useEffect(() => {
    if (status === CallStatus.ACTIVE) {
      timerRef.current = window.setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [status]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Vapi Voice Agent</h2>
          <p className="text-slate-400">
            Select a patient to initiate an AI-driven appointment scheduling call.
          </p>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Select Patient</label>
            <div className="relative">
              <select 
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                disabled={status !== CallStatus.IDLE}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-3 appearance-none focus:outline-none focus:border-primary-500 transition-colors"
              >
                <option value="">-- Choose a patient --</option>
                {patients.map(p => (
                  <option key={p._id} value={p._id}>{p.name} - {p.phone}</option>
                ))}
              </select>
              <User className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 pointer-events-none" />
            </div>
          </div>

          <div className="flex justify-center py-4">
             {status === CallStatus.IDLE ? (
                <button
                  onClick={startCall}
                  disabled={!selectedPatientId}
                  className={`
                    w-full py-4 rounded-xl flex items-center justify-center gap-3 font-bold text-lg transition-all
                    ${selectedPatientId 
                      ? 'bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-900/20' 
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'}
                  `}
                >
                  <Phone className="w-6 h-6" />
                  Initiate Call
                </button>
             ) : (
                <button
                  onClick={endCall}
                  className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-xl flex items-center justify-center gap-3 font-bold text-lg shadow-lg shadow-red-900/20 transition-all"
                >
                  <PhoneOff className="w-6 h-6" />
                  End Call
                </button>
             )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
             <div className={`w-3 h-3 rounded-full ${status === CallStatus.ACTIVE ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`} />
             <div>
               <div className="text-slate-400 text-xs uppercase font-bold">Status</div>
               <div className="text-white font-medium">{status}</div>
             </div>
          </div>
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
             <Activity className="w-5 h-5 text-blue-500" />
             <div>
               <div className="text-slate-400 text-xs uppercase font-bold">Duration</div>
               <div className="text-white font-medium">{formatTime(duration)}</div>
             </div>
          </div>
        </div>
        
        {consent !== 'unknown' && (
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div className="text-slate-400 text-xs uppercase font-bold mb-2">Consent Status</div>
            <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
              consent === 'approved' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
              consent === 'denied' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
              'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}>
              {consent === 'approved' ? '✓ Approved' : consent === 'denied' ? '✗ Denied' : '? Unknown'}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-6 h-full">
         <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 h-48 flex items-center justify-center relative overflow-hidden">
            {status === CallStatus.ACTIVE ? (
               <div className="flex flex-col items-center gap-4">
                 <div className="w-12 h-12 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
                 <span className="text-green-400 font-medium">Call in Progress...</span>
                 <span className="text-slate-400 text-sm">Phone: {patients.find(p => p._id === selectedPatientId)?.phone}</span>
               </div>
            ) : status === CallStatus.CONNECTING ? (
               <div className="flex flex-col items-center gap-4">
                 <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
                 <span className="text-primary-400 font-medium">Initiating Call...</span>
               </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-600">
                 <BarChart2 className="w-12 h-12" />
                 <span>Real phone call will be placed</span>
              </div>
            )}
         </div>

         <div className="flex-1 bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col min-h-[300px]">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Mic className="w-4 h-4 text-slate-400" />
              Live Transcript
            </h3>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {transcript.length === 0 ? (
                <div className="text-slate-600 italic text-center mt-10">Transcript will appear here...</div>
              ) : (
                transcript.map((line, idx) => {
                  const [speaker, ...text] = line.split(':');
                  const isAI = speaker === 'AI';
                  return (
                    <div key={idx} className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}>
                       <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                         isAI 
                           ? 'bg-slate-800 text-slate-200 rounded-tl-none' 
                           : 'bg-primary-600 text-white rounded-tr-none'
                       }`}>
                         <span className="block text-xs opacity-50 mb-1">{speaker}</span>
                         {text.join(':')}
                       </div>
                    </div>
                  );
                })
              )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default VapiInterface;