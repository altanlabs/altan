import Editor from '@monaco-editor/react';
import { Loader2 } from 'lucide-react';
import React from 'react';

import { Button } from '../../../ui/button.tsx';
import { Dialog, DialogContent, DialogTitle } from '../../../ui/dialog';

export const ViewServiceDialog = ({ open, onClose, service, code, loading }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden max-h-[90vh]">
        <div className="border-b px-6 py-4">
          <DialogTitle>Service: {service?.name}</DialogTitle>
          {service?.description && (
            <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
          )}
        </div>
        <div className="p-6">
          {loading ? (
            <div className="h-[500px] flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="border border-border rounded-lg overflow-hidden">
              <Editor
                height="500px"
                defaultLanguage="python"
                value={code}
                options={{ readOnly: true, minimap: { enabled: false }, fontSize: 14 }}
                theme="vs-dark"
              />
            </div>
          )}
        </div>
        <div className="border-t px-6 py-4 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
