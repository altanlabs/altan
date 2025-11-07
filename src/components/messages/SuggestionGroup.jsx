import { Lightbulb } from 'lucide-react';

import { Card, CardContent } from '../ui/card';

// Suggestion Group Component - for compact grouped suggestions
const SuggestionGroup = ({ children }) => {
  return (
    <Card className="my-3">
      <CardContent className="p-4">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10">
            <Lightbulb className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-semibold text-foreground">Next steps</span>
        </div>
        <div className="flex flex-col gap-2">{children}</div>
      </CardContent>
    </Card>
  );
};

export default SuggestionGroup;
