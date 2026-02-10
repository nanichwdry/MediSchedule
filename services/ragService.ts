import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
console.log('Gemini API Key loaded:', apiKey ? 'Yes' : 'No');
const genAI = new GoogleGenerativeAI(apiKey || 'PLACEHOLDER_API_KEY');

interface MedicalDocument {
  id: string;
  title: string;
  content: string;
  category: 'symptoms' | 'treatments' | 'procedures' | 'medications' | 'guidelines';
  embedding?: number[];
}

class RAGService {
  private documents: MedicalDocument[] = [
    {
      id: '1',
      title: 'Hypertension Management',
      content: 'Hypertension (high blood pressure) is managed through lifestyle changes including diet modification, regular exercise, weight management, and medication when necessary. First-line treatments include ACE inhibitors, ARBs, calcium channel blockers, and thiazide diuretics.',
      category: 'treatments'
    },
    {
      id: '2', 
      title: 'Diabetes Type 2 Care',
      content: 'Type 2 diabetes management involves blood glucose monitoring, dietary control, regular exercise, and medications like metformin, insulin, or other antidiabetic drugs. Regular HbA1c testing and monitoring for complications is essential.',
      category: 'treatments'
    },
    {
      id: '3',
      title: 'Chest Pain Symptoms',
      content: 'Chest pain can indicate various conditions from cardiac issues to musculoskeletal problems. Red flags include crushing pain, radiation to arm/jaw, shortness of breath, sweating, and nausea. Immediate evaluation needed for suspected cardiac events.',
      category: 'symptoms'
    },
    {
      id: '4',
      title: 'Routine Physical Exam',
      content: 'Annual physical exams should include vital signs, BMI calculation, cardiovascular assessment, respiratory examination, abdominal palpation, neurological screening, and age-appropriate screenings like mammograms, colonoscopies, and blood work.',
      category: 'procedures'
    },
    {
      id: '5',
      title: 'Medication Adherence',
      content: 'Poor medication adherence leads to treatment failures and complications. Strategies include patient education, simplified dosing regimens, pill organizers, reminder systems, and addressing cost barriers.',
      category: 'guidelines'
    }
  ];

  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  // Simple text similarity scoring (in production, use proper embeddings)
  private calculateSimilarity(query: string, document: MedicalDocument): number {
    const queryWords = query.toLowerCase().split(' ');
    const docWords = document.content.toLowerCase().split(' ');
    const titleWords = document.title.toLowerCase().split(' ');
    
    let score = 0;
    queryWords.forEach(word => {
      if (docWords.includes(word)) score += 1;
      if (titleWords.includes(word)) score += 2; // Title matches weighted higher
    });
    
    return score / queryWords.length;
  }

  private retrieveRelevantDocs(query: string, topK: number = 3): MedicalDocument[] {
    return this.documents
      .map(doc => ({ doc, score: this.calculateSimilarity(query, doc) }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(item => item.doc);
  }

  async queryMedicalKnowledge(question: string): Promise<{
    answer: string;
    sources: MedicalDocument[];
    confidence: 'high' | 'medium' | 'low';
  }> {
    try {
      // Retrieve relevant documents
      const relevantDocs = this.retrieveRelevantDocs(question, 3);
      
      if (relevantDocs.length === 0) {
        return {
          answer: "I don't have specific information about that topic in my medical knowledge base. Please consult with a healthcare professional for accurate medical advice.",
          sources: [],
          confidence: 'low'
        };
      }

      // Create context from retrieved documents
      const context = relevantDocs
        .map(doc => `**${doc.title}**: ${doc.content}`)
        .join('\n\n');

      const prompt = `
You are a medical AI assistant. Based on the following medical knowledge base excerpts, answer the user's question. 

IMPORTANT GUIDELINES:
- Only use information from the provided context
- If the context doesn't contain enough information, say so
- Always recommend consulting healthcare professionals for medical decisions
- Be precise and avoid speculation
- Include relevant details from the context

CONTEXT:
${context}

QUESTION: ${question}

ANSWER:`;

      const result = await this.model.generateContent(prompt);
      const answer = result.response.text();

      // Determine confidence based on number of relevant docs and content quality
      let confidence: 'high' | 'medium' | 'low' = 'medium';
      if (relevantDocs.length >= 2 && answer.length > 100) {
        confidence = 'high';
      } else if (relevantDocs.length === 1 || answer.length < 50) {
        confidence = 'low';
      }

      return {
        answer,
        sources: relevantDocs,
        confidence
      };

    } catch (error) {
      console.error('RAG query error:', error);
      return {
        answer: "I'm experiencing technical difficulties. Please try again or consult with a healthcare professional.",
        sources: [],
        confidence: 'low'
      };
    }
  }

  async addDocument(doc: Omit<MedicalDocument, 'id'>): Promise<void> {
    const newDoc: MedicalDocument = {
      ...doc,
      id: Date.now().toString()
    };
    this.documents.push(newDoc);
  }

  getDocumentsByCategory(category: MedicalDocument['category']): MedicalDocument[] {
    return this.documents.filter(doc => doc.category === category);
  }

  getAllDocuments(): MedicalDocument[] {
    return [...this.documents];
  }
}

export const ragService = new RAGService();
export type { MedicalDocument };