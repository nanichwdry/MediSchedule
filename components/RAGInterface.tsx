import React, { useState, useRef, useEffect } from 'react';
import { Search, BookOpen, AlertCircle, CheckCircle, Brain, FileText } from 'lucide-react';
import { ragService, MedicalDocument } from '../services/ragService';

interface QueryResult {
  answer: string;
  sources: MedicalDocument[];
  confidence: 'high' | 'medium' | 'low';
  timestamp: Date;
}

const RAGInterface: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<QueryResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { value: 'all', label: 'All Categories', icon: BookOpen },
    { value: 'symptoms', label: 'Symptoms', icon: AlertCircle },
    { value: 'treatments', label: 'Treatments', icon: CheckCircle },
    { value: 'procedures', label: 'Procedures', icon: FileText },
    { value: 'medications', label: 'Medications', icon: Brain },
    { value: 'guidelines', label: 'Guidelines', icon: BookOpen }
  ];

  const sampleQueries = [
    "How do you manage high blood pressure?",
    "What are the symptoms of chest pain to watch for?",
    "What should be included in a routine physical exam?",
    "How can we improve medication adherence?"
  ];

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    setLoading(true);
    try {
      const result = await ragService.queryMedicalKnowledge(query);
      const newResult: QueryResult = {
        ...result,
        timestamp: new Date()
      };
      setResults(prev => [newResult, ...prev]);
      setQuery('');
    } catch (error) {
      console.error('Query failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSampleQuery = (sampleQuery: string) => {
    setQuery(sampleQuery);
    inputRef.current?.focus();
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'low': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.icon : FileText;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Medical Knowledge Assistant</h1>
          <p className="text-slate-400">AI-powered medical information retrieval system</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-sm border border-blue-500/20">
            RAG Enabled
          </span>
        </div>
      </div>

      {/* Query Interface */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <form onSubmit={handleQuery} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a medical question..."
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:border-primary-500 transition-colors"
              disabled={loading}
            />
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex gap-2 flex-wrap">
              {sampleQueries.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSampleQuery(sample)}
                  className="text-xs px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full transition-colors"
                >
                  {sample}
                </button>
              ))}
            </div>
            
            <button
              type="submit"
              disabled={!query.trim() || loading}
              className={`px-6 py-2 rounded-xl font-medium transition-all ${
                query.trim() && !loading
                  ? 'bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-900/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-slate-400/30 border-t-slate-400 rounded-full animate-spin" />
                  Searching...
                </div>
              ) : (
                'Ask Question'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {results.length === 0 ? (
          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 text-center">
            <Brain className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-400 mb-2">Ready to Answer Medical Questions</h3>
            <p className="text-slate-500">Ask about symptoms, treatments, procedures, or medical guidelines.</p>
          </div>
        ) : (
          results.map((result, idx) => (
            <div key={idx} className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary-500" />
                  <span className="text-sm text-slate-400">
                    {result.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getConfidenceColor(result.confidence)}`}>
                  {result.confidence} confidence
                </div>
              </div>

              <div className="prose prose-invert max-w-none mb-4">
                <div className="text-white leading-relaxed whitespace-pre-wrap">
                  {result.answer}
                </div>
              </div>

              {result.sources.length > 0 && (
                <div className="border-t border-slate-800 pt-4">
                  <h4 className="text-sm font-medium text-slate-400 mb-3">Sources:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {result.sources.map((source) => {
                      const IconComponent = getCategoryIcon(source.category);
                      return (
                        <div key={source.id} className="bg-slate-950 p-3 rounded-lg border border-slate-700">
                          <div className="flex items-center gap-2 mb-2">
                            <IconComponent className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-medium text-white">{source.title}</span>
                            <span className="text-xs px-2 py-0.5 bg-slate-700 text-slate-300 rounded-full">
                              {source.category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-2">
                            {source.content}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RAGInterface;