import React, { useState } from 'react';
import { Trash2, Copy, Check, Globe, AlertCircle } from 'lucide-react';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button.tsx';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Badge } from '../../../../components/ui/badge';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import { optimai_pods } from '../../../../utils/axios';

function AddDomainDialog({ open, onClose, ui }) {
  const [domain, setDomain] = useState('');
  const [error, setError] = useState('');
  const [domainInfo, setDomainInfo] = useState(null);
  const [copiedValue, setCopiedValue] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCopyValue = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedValue(value);
      setTimeout(() => setCopiedValue(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleAddDomain = async () => {
    if (!domain.trim()) {
      setError('Please enter a domain');
      return;
    }

    setIsLoading(true);
    try {
      const response = await optimai_pods.post(`/interfaces/${ui.id}/domains`, { domain: domain.trim() });
      setDomainInfo(response.data.domain);
      setDomain('');
      setError('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to add domain. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDomain = async (domainName) => {
    try {
      await optimai_pods.delete(`/interfaces/${ui.id}/domains/${domainName}`);
      setDomainInfo(null);
      onClose();
    } catch (err) {
      setError('Failed to delete domain. Please try again.');
    }
  };

  const handleClose = () => {
    setDomain('');
    setError('');
    setDomainInfo(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[600px] p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl font-semibold">Add Custom Domain</DialogTitle>
          <p className="text-sm text-muted-foreground pt-1">
            Connect your own domain to this interface
          </p>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="px-6 pb-6 space-y-5">
            {/* Domain Input */}
            <div className="space-y-2">
              <Label htmlFor="domain" className="text-sm font-semibold">
                Domain Name
              </Label>
              <div className="flex gap-2">
                <Input
                  id="domain"
                  type="text"
                  placeholder="e.g., example.com"
                  value={domain}
                  onChange={(e) => {
                    setDomain(e.target.value);
                    setError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddDomain();
                    }
                  }}
                  className={`flex-1 ${error ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  disabled={isLoading}
                />
                <Button
                  onClick={handleAddDomain}
                  disabled={isLoading || !domain.trim()}
                  className="px-6"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 mr-2 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Domain'
                  )}
                </Button>
              </div>
              {error && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}
            </div>

            {/* DNS Configuration */}
            {domainInfo && (
              <div className="space-y-4 animate-in slide-in-from-top-2">
                {/* Domain Header */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/40 border border-border">
                  <div className="flex items-center gap-2.5">
                    <Globe className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold text-sm">{domainInfo.configuration.name}</p>
                      <p className="text-xs text-muted-foreground">Custom domain</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteDomain(domainInfo.configuration.name)}
                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    title="Delete domain"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Instructions */}
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      Configure DNS Records
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Add the following DNS records to your domain provider to complete the setup.
                    </p>
                  </div>
                </div>

                {/* DNS Records */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">DNS Records</Label>
                  
                  {domainInfo.dns_records.map((record, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg bg-muted/30 border border-border space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={record.type === 'A' ? 'default' : 'secondary'} className="font-mono">
                            {record.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {record.type === 'A' ? 'Main Record' : 'Verification Record'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {/* Type */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-muted-foreground mb-1">Type</p>
                            <p className="text-sm font-mono bg-background px-2 py-1.5 rounded border">
                              {record.type}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCopyValue(record.type)}
                            className="h-8 w-8 mt-5"
                            title="Copy type"
                          >
                            {copiedValue === record.type ? (
                              <Check className="h-3.5 w-3.5 text-green-500" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>

                        {/* Name */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-muted-foreground mb-1">Name</p>
                            <p className="text-sm font-mono bg-background px-2 py-1.5 rounded border break-all">
                              {record.name}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCopyValue(record.name)}
                            className="h-8 w-8 mt-5"
                            title="Copy name"
                          >
                            {copiedValue === record.name ? (
                              <Check className="h-3.5 w-3.5 text-green-500" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>

                        {/* Value */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-muted-foreground mb-1">Value</p>
                            <p className="text-sm font-mono bg-background px-2 py-1.5 rounded border break-all">
                              {record.value}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCopyValue(record.value)}
                            className="h-8 w-8 mt-5"
                            title="Copy value"
                          >
                            {copiedValue === record.value ? (
                              <Check className="h-3.5 w-3.5 text-green-500" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Propagation Notice */}
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-muted/40 border border-border">
                  <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground italic">
                    DNS changes may take up to 24-48 hours to propagate globally. Your domain will be active once propagation is complete.
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t">
              <Button
                variant="ghost"
                onClick={handleClose}
                className="px-4"
              >
                {domainInfo ? 'Done' : 'Cancel'}
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default AddDomainDialog;
