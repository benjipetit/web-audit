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
  const [url, setUrl] = useState("https://");

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
    <form onSubmit={handleSubmit} className="flex gap-2 bg-base-100">
      <div className="flex-1">
          <Input
            type="url"
            placeholder="Entrez une URL (ex: mon-site.fr ou https://mon-site.fr)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading}
            className="px-4 py-3 text-base w-full"
            required
          />
          <p className="validator-hint">Entrez une URL valide</p>
      </div>
      <Button
        type="submit"
        disabled={isLoading || !url.trim()}
        className="whitespace-nowrap px-6 py-3 btn btn-primary"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Vérification...
          </>
        ) : (
          'Vérifier'
        )}
      </Button>
    </form>
  );
}
