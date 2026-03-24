'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import URLForm from '@/components/url-form';
import EvaluationResults from '@/components/evaluation-results';

export interface EvaluationResult {
  id: string;
  name: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  passed: boolean;
}

export interface EvaluationResponse {
  url: string;
  score: {
    passed: number;
    total: number;
    percentage: number;
  };
  results: EvaluationResult[];
}

export default function Home() {
  const [evaluation, setEvaluation] = useState<EvaluationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (url: string) => {
    setIsLoading(true);
    setError(null);
    setEvaluation(null);

    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'An error occurred while evaluating the website');
        return;
      }

      setEvaluation(data);
    } catch (err) {
      setError('Failed to connect to the server. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Website Evaluator
          </h1>
          <p className="text-lg text-gray-600">
            Audit your website for SEO, accessibility, and best practices
          </p>
        </div>

        {/* Form Card */}
        <Card className="mb-8 shadow-lg">
          <div className="p-8">
            <URLForm onSubmit={handleSubmit} isLoading={isLoading} />
          </div>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="mb-8 border-red-200 bg-red-50 shadow-lg">
            <div className="p-6 flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">
                  Evaluation Failed
                </h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <Card className="mb-8 shadow-lg">
            <div className="p-12 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="text-gray-700 font-medium">
                Evaluating your website...
              </p>
            </div>
          </Card>
        )}

        {/* Results */}
        {evaluation && !isLoading && (
          <EvaluationResults evaluation={evaluation} />
        )}
      </div>
    </main>
  );
}
