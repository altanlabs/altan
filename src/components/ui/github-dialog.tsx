import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as React from 'react';

// --- Utility Function ---
type ClassValue = string | number | boolean | null | undefined;
function cn(...inputs: ClassValue[]): string {
  return inputs.filter(Boolean).join(' ');
}

// --- XIcon for Dialog Close ---
const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// --- Dialog Components ---
const Dialog = DialogPrimitive.Root;
const DialogPortal = DialogPrimitive.Portal;
const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-[50%] top-[50%] z-50 grid w-full max-w-[90vw] md:max-w-[800px] translate-x-[-50%] translate-y-[-50%] gap-4 border-none bg-transparent p-0 shadow-none duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        className,
      )}
      {...props}
    >
      <div className="relative bg-card dark:bg-[#303030] rounded-[28px] overflow-hidden shadow-2xl p-1">
        {children}
        <DialogPrimitive.Close className="absolute right-3 top-3 z-10 rounded-full bg-background/50 dark:bg-[#303030] p-1 hover:bg-accent dark:hover:bg-[#515151] transition-all">
          <XIcon className="h-5 w-5 text-muted-foreground dark:text-gray-200 hover:text-foreground dark:hover:text-white" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </div>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

// --- GitHub Dialog Component ---
export interface GitHubDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  githubUrl: string;
  githubBranch: string;
  githubToken: string;
  onGithubUrlChange: (url: string) => void;
  onGithubBranchChange: (branch: string) => void;
  onGithubTokenChange: (token: string) => void;
  onSave: () => void;
}

export const GitHubDialog: React.FC<GitHubDialogProps> = ({
  open,
  onOpenChange,
  githubUrl,
  githubBranch,
  githubToken,
  onGithubUrlChange,
  onGithubBranchChange,
  onGithubTokenChange,
  onSave,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground dark:text-white">
            Connect GitHub Repository
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground dark:text-white">
                Repository URL
              </label>
              <input
                type="text"
                value={githubUrl}
                onChange={(e) => onGithubUrlChange(e.target.value)}
                placeholder="https://github.com/username/repo"
                className="w-full px-3 py-2 rounded-lg border border-border dark:border-gray-600 bg-background dark:bg-[#202020] text-foreground dark:text-white focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground dark:text-white">
                Branch
              </label>
              <input
                type="text"
                value={githubBranch}
                onChange={(e) => onGithubBranchChange(e.target.value)}
                placeholder="main"
                className="w-full px-3 py-2 rounded-lg border border-border dark:border-gray-600 bg-background dark:bg-[#202020] text-foreground dark:text-white focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground dark:text-white">
                GitHub Token (Optional)
              </label>
              <input
                type="password"
                value={githubToken}
                onChange={(e) => onGithubTokenChange(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxx"
                className="w-full px-3 py-2 rounded-lg border border-border dark:border-gray-600 bg-background dark:bg-[#202020] text-foreground dark:text-white focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">
                Required for private repositories
              </p>
            </div>
            <button
              onClick={onSave}
              className="w-full px-4 py-2 rounded-lg bg-black dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/80 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

