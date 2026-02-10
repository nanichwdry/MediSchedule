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

  private retrieveRelevantDocs(query: string, topK: number = 3): MedicalDocument[] {
    const queryWords = query.toLowerCase().split(' ');
    return this.documents
      .map(doc => {
        const docWords = doc.content.toLowerCase().split(' ');
        const titleWords = doc.title.toLowerCase().split(' ');
        let score = 0;
        queryWords.forEach(word => {
          if (docWords.includes(word)) score += 1;
          if (titleWords.includes(word)) score += 2;
        });
        return { doc, score: score / queryWords.length };
      })
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
    const relevantDocs = this.retrieveRelevantDocs(question, 3);
    
    if (relevantDocs.length === 0) {
      return {
        answer: "I don't have specific information about that topic in my medical knowledge base. Please consult with a healthcare professional for accurate medical advice.",
        sources: [],
        confidence: 'low'
      };
    }

    // Simple rule-based responses
    const context = relevantDocs.map(doc => doc.content).join(' ');
    let answer = "Based on the available medical information: ";
    
    if (relevantDocs.length >= 2) {
      answer += relevantDocs[0].content;
    } else {
      answer += "Limited information available. " + relevantDocs[0].content;
    }
    
    answer += " Please consult with a healthcare professional for personalized medical advice.";

    return {
      answer,
      sources: relevantDocs,
      confidence: relevantDocs.length >= 2 ? 'high' : 'medium'
    };
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