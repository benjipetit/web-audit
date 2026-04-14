'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, XCircle, Loader2, ArrowUpRight } from 'lucide-react';
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
        setError(data.error || "Une erreur est survenue pendant l'audit du site");
        return;
      }

      setEvaluation(data);
    } catch (err) {
      setError("Erreur de connexion au serveur. Merci de réessayer.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="hero-bg" className="relative">
      <div className="bg absolute inset-0 z-0">
      </div>
      <main className="min-h-screen p-6 z-1 relative">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <a href="https://bakpak.fr">
            <img src="logo_dark.svg" alt="" className="h-20"/>
          </a>
          <button className="btn btn-primary btn-outline">
            Réserver un appel
            <ArrowUpRight/>
          </button>
        </div>
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-base-content mb-2">
              Audit gratuit
            </h1>
            <p className="text-lg text-base-content/70">
            Audit gratuit et immédiat de votre site. Vérifiez que votre site suit les bonnes pratiques pour être visible.
            </p>
          </div>

          {/* Form Card */}
          <Card className="mb-8 shadow-lg bg-base-100">
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
                    Echec de l'audit
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
                  Vérification en cours...
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
    </div>
  );
}
