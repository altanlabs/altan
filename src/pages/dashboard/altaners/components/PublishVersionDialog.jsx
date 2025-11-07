import PropTypes from 'prop-types';
import { memo, useState } from 'react';
import { 
  Share2, 
  Copy, 
  Check, 
  Globe, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  Rocket,
  Info,
  ExternalLink,
  X
} from 'lucide-react';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button.tsx';
import { Badge } from '../../../../components/ui/badge';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import { optimai_pods } from '../../../../utils/axios';
import AddDomainDialog from '../../../dashboard/interfaces/components/AddDomainDialog';

const versionTypes = ['major', 'minor', 'patch'];

// Social media icon components (inline SVGs)
const WhatsAppIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const socialPlatforms = [
  {
    name: 'WhatsApp',
    icon: WhatsAppIcon,
    color: '#25D366',
    getUrl: (url) => `https://wa.me/?text=${encodeURIComponent(`Check this out: ${url}`)}`,
  },
  {
    name: 'Twitter',
    icon: TwitterIcon,
    color: '#1DA1F2',
    getUrl: (url) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent('Check out this AI agent!')}`,
  },
  {
    name: 'LinkedIn',
    icon: LinkedInIcon,
    color: '#0A66C2',
    getUrl: (url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    name: 'Facebook',
    icon: FacebookIcon,
    color: '#1877F2',
    getUrl: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
];

function PublishVersionDialog({ open, onClose, altaner, ui = null }) {
  const [name, setName] = useState('');
  const [versionType, setVersionType] = useState('patch');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isDomainDialogOpen, setIsDomainDialogOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(null);

  const handleCopyUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleNativeShare = async (url) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this AI Agent',
          text: `Try out this AI agent built with Altan:`,
          url,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      handleCopyUrl(url);
    }
  };

  const handleShare = (platform, url) => {
    const shareUrl = platform.getUrl(url);
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const interfaceId = ui?.id;
      
      if (!interfaceId) {
        throw new Error('Interface ID is required');
      }

      await optimai_pods.post(`/interfaces/${interfaceId}/publish`, null, {
        params: {
          message: name || 'New version',
          subdomain: ui?.name || '',
        },
      });

      onClose();
    } catch (error) {
      console.error('Failed to publish interface:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const altanerDomains = altaner?.meta_data?.domains ? Object.keys(altaner.meta_data.domains) : [];
  const uiDomains = ui?.meta_data?.domains ? Object.keys(ui.meta_data.domains) : [];
  const allCustomDomains = [...new Set([...altanerDomains, ...uiDomains])];
  const defaultDomain = ui?.deployment_url;

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-[550px] p-0 gap-0">
          {/* Header */}
          <DialogHeader className="px-6 pt-6 pb-4 space-y-2">
            <DialogTitle className="text-xl font-semibold">Publish New Version</DialogTitle>
            
            {!defaultDomain && allCustomDomains.length === 0 && (
              <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Publishing will create a public domain that you can share with others.
                </p>
              </div>
            )}

            {(defaultDomain || allCustomDomains.length > 0) && (
              <p className="text-sm text-muted-foreground">
                Deploy your latest changes to all configured domains.
              </p>
            )}
          </DialogHeader>

          {/* Content */}
          <ScrollArea className="max-h-[60vh]">
            <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
              {/* Publishing Destination */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">
                  {defaultDomain || allCustomDomains.length > 0 ? 'Publishing to Domains' : 'Deployment'}
                </Label>
                
                <div className="space-y-2.5">
                  {/* First-time users message */}
                  {!defaultDomain && allCustomDomains.length === 0 && (
                    <div className="flex items-center gap-2.5 p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <Rocket className="h-4 w-4 text-primary flex-shrink-0" />
                      <p className="text-xs font-medium">
                        A public domain will be created automatically
                      </p>
                    </div>
                  )}

                  {/* Default domain */}
                  {defaultDomain && (
                    <div className="group p-3.5 rounded-lg bg-muted/40 border border-border hover:border-primary/40 transition-all">
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-primary flex-shrink-0" />
                          <a
                            href={defaultDomain}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 font-mono text-xs hover:text-primary transition-colors truncate"
                          >
                            {defaultDomain}
                          </a>
                          <Badge className="text-[10px] h-5 px-2">Primary</Badge>
                          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        {/* Share buttons */}
                        <div className="flex items-center gap-1.5 pl-6">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleNativeShare(defaultDomain)}
                            className="h-7 text-xs px-2.5"
                          >
                            <Share2 className="h-3 w-3 mr-1.5" />
                            Share
                          </Button>

                          <div className="h-4 w-px bg-border" />

                          {socialPlatforms.slice(0, 2).map((platform) => {
                            const Icon = platform.icon;
                            return (
                              <Button
                                key={platform.name}
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => handleShare(platform, defaultDomain)}
                                className="h-7 w-7 hover:scale-110 transition-transform"
                                title={`Share on ${platform.name}`}
                              >
                                <Icon />
                              </Button>
                            );
                          })}
                          
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => handleCopyUrl(defaultDomain)}
                            className={`h-7 w-7 transition-all ${
                              copiedUrl === defaultDomain ? 'text-green-500' : ''
                            }`}
                            title="Copy link"
                          >
                            {copiedUrl === defaultDomain ? (
                              <Check className="h-3.5 w-3.5" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Custom domains */}
                  {allCustomDomains.map((domain) => {
                    const fullDomain = `https://${domain}`;
                    return (
                      <div
                        key={domain}
                        className="group p-3.5 rounded-lg bg-muted/40 border border-border hover:border-primary/40 transition-all"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <a
                              href={fullDomain}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 font-mono text-xs hover:text-primary transition-colors truncate"
                            >
                              {domain}
                            </a>
                            <Badge variant="outline" className="text-[10px] h-5 px-2">Custom</Badge>
                            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>

                          <div className="flex items-center gap-1.5 pl-6">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleNativeShare(fullDomain)}
                              className="h-7 text-xs px-2.5"
                            >
                              <Share2 className="h-3 w-3 mr-1.5" />
                              Share
                            </Button>

                            <div className="h-4 w-px bg-border" />

                            {socialPlatforms.slice(0, 2).map((platform) => {
                              const Icon = platform.icon;
                              return (
                                <Button
                                  key={platform.name}
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleShare(platform, fullDomain)}
                                  className="h-7 w-7 hover:scale-110 transition-transform"
                                  title={`Share on ${platform.name}`}
                                >
                                  <Icon />
                                </Button>
                              );
                            })}
                            
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => handleCopyUrl(fullDomain)}
                              className={`h-7 w-7 transition-all ${
                                copiedUrl === fullDomain ? 'text-green-500' : ''
                              }`}
                              title="Copy link"
                            >
                              {copiedUrl === fullDomain ? (
                                <Check className="h-3.5 w-3.5" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add Domain Button */}
                  <button
                    type="button"
                    onClick={() => setIsDomainDialogOpen(true)}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all text-sm font-medium text-muted-foreground hover:text-primary group"
                  >
                    <Plus className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    Add Custom Domain
                  </button>
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-sm font-semibold hover:opacity-70 transition-opacity"
                >
                  Advanced Settings
                  {showAdvanced ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>

                {showAdvanced && (
                  <div className="pl-3 border-l-2 border-border space-y-3.5 animate-in slide-in-from-top-2">
                    <div className="space-y-2">
                      <Label htmlFor="version-name" className="text-xs font-semibold">
                        Version Name <span className="text-muted-foreground font-normal">(Optional)</span>
                      </Label>
                      <Input
                        id="version-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., New features release, Bug fixes..."
                        className="h-9 text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="version-type" className="text-xs font-semibold">
                        Version Type
                      </Label>
                      <select
                        id="version-type"
                        value={versionType}
                        onChange={(e) => setVersionType(e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        {versionTypes.map((type) => (
                          <option key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-muted-foreground">
                        {versionType === 'major' && 'Breaking changes that are not backwards compatible'}
                        {versionType === 'minor' && 'New features that are backwards compatible'}
                        {versionType === 'patch' && 'Bug fixes and minor improvements'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  className="h-9 px-4"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-9 px-6"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 mr-2 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Rocket className="h-4 w-4 mr-2" />
                      Publish Version
                    </>
                  )}
                </Button>
              </div>
            </form>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <AddDomainDialog
        open={isDomainDialogOpen}
        onClose={() => setIsDomainDialogOpen(false)}
        ui={ui}
      />
    </>
  );
}

PublishVersionDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  altaner: PropTypes.object,
  ui: PropTypes.object,
};

export default memo(PublishVersionDialog);
