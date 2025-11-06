import React from 'react';
import { Construction } from 'lucide-react';
import { Button } from '../../ui/button';

function CloudPlaceholder({ title, description }) {
  return (
    <div className="flex items-center justify-center h-full p-6">
      <div className="flex flex-col items-center text-center max-w-md space-y-6">
        <div className="w-20 h-20 rounded-lg bg-accent/50 flex items-center justify-center">
          <Construction className="h-10 w-10 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          <p className="text-sm text-muted-foreground">
            {description || 'This section is coming soon.'}
          </p>
        </div>
        <Button variant="outline" disabled>
          Coming Soon
        </Button>
      </div>
    </div>
  );
}

export default CloudPlaceholder;

