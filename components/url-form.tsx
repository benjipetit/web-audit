'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

interface URLFormProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export default function URLForm({ onSubmit, isLoading }: URLFormProps) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (url.trim()) {
      // Ensure URL has protocol
      let urlWithProtocol = url.trim();
      if (!urlWithProtocol.match(/^https?:\/\//)) {
        urlWithProtocol = 'https://' + urlWithProtocol;
      }
      onSubmit(urlWithProtocol);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="url"
        placeholder="Enter website URL (e.g., example.com or https://example.com)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        disabled={isLoading}
        className="flex-1 px-4 py-3 text-base"
        required
      />
      <Button
        type="submit"
        disabled={isLoading || !url.trim()}
        className="whitespace-nowrap px-6 py-3"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Evaluating...
          </>
        ) : (
          'Evaluate'
        )}
      </Button>
    </form>
  );
}
