'use client';

import { Card } from '@/components/ui/card';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import type { EvaluationResponse } from '@/app/page';

interface EvaluationResultsProps {
  evaluation: EvaluationResponse;
}

const severityConfig = {
  critical: {
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    badgeColor: 'bg-red-100 text-red-800',
  },
  high: {
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    badgeColor: 'bg-orange-100 text-orange-800',
  },
  medium: {
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    badgeColor: 'bg-yellow-100 text-yellow-800',
  },
  low: {
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    badgeColor: 'bg-blue-100 text-blue-800',
  },
};

export default function EvaluationResults({
  evaluation,
}: EvaluationResultsProps) {
  const { score, results, url } = evaluation;
  const scorePercentage = score.percentage;

  // Determine score color based on percentage
  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-50 border-green-200';
    if (percentage >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  // Group results by passed/failed
  const passedResults = results.filter((r) => r.passed);
  const failedResults = results.filter((r) => !r.passed);

  return (
    <div className="space-y-6">
      {/* Score Card */}
      <Card
        className={`shadow-lg border-2 ${getScoreBgColor(scorePercentage)}`}
      >
        <div className="p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Overall Score
          </h2>
          <div className="flex items-center gap-6">
            <div>
              <div className={`text-5xl font-bold ${getScoreColor(scorePercentage)}`}>
                {scorePercentage}%
              </div>
              <p className="text-gray-600 mt-2">
                {score.passed} out of {score.total} checks passed
              </p>
            </div>
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full transition-all rounded-full ${
                    scorePercentage >= 80
                      ? 'bg-green-500'
                      : scorePercentage >= 60
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                  }`}
                  style={{ width: `${scorePercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* URL Card */}
      <Card className="shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Evaluated URL</p>
          <p className="text-lg font-semibold text-gray-900 break-all">{url}</p>
        </div>
      </Card>

      {/* Detailed Results */}
      <div className="grid gap-6">
        {/* Passed Checks */}
        {passedResults.length > 0 && (
          <Card className="shadow-lg">
            <div className="p-6 border-b border-green-200 bg-green-50">
              <h3 className="text-lg font-semibold text-green-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Passed Checks ({passedResults.length})
              </h3>
            </div>
            <div className="divide-y">
              {passedResults.map((result) => (
                <ResultItem key={result.id} result={result} passed />
              ))}
            </div>
          </Card>
        )}

        {/* Failed Checks */}
        {failedResults.length > 0 && (
          <Card className="shadow-lg">
            <div className="p-6 border-b border-red-200 bg-red-50">
              <h3 className="text-lg font-semibold text-red-900 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                Failed Checks ({failedResults.length})
              </h3>
            </div>
            <div className="divide-y">
              {failedResults.map((result) => (
                <ResultItem key={result.id} result={result} passed={false} />
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

interface ResultItemProps {
  result: any;
  passed: boolean;
}

function ResultItem({ result, passed }: ResultItemProps) {
  const config = severityConfig[result.severity as keyof typeof severityConfig];

  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">
          {passed ? (
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="font-semibold text-gray-900">{result.name}</h4>
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${config.badgeColor}`}
            >
              {result.severity}
            </span>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            {result.description}
          </p>
          {passed && (
            <p className="text-green-700 text-sm mt-2 font-medium">✓ Detected</p>
          )}
          {!passed && (
            <p className="text-red-700 text-sm mt-2 font-medium">
              ✗ Not found - this could impact your website performance
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
