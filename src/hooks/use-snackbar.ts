import { toast } from './use-toast';

export interface SnackbarOptions {
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info'
  autoHideDuration?: number
  anchorOrigin?: {
    vertical: 'top' | 'bottom'
    horizontal: 'left' | 'center' | 'right'
  }
}

export function useSnackbar() {
  return {
    enqueueSnackbar: (message: string, options?: SnackbarOptions) => {
      const variant = options?.variant || 'default'
      
      const title = {
        'success': 'Success',
        'error': 'Error',
        'warning': 'Warning',
        'info': 'Info',
        'default': ''
      }[variant]

      toast({
        title: title || undefined,
        description: message,
        variant: variant === 'error' ? 'destructive' : 'default',
        duration: options?.autoHideDuration,
      })
    },
    closeSnackbar: () => {
      // Toast lib handles auto-close, this is for compatibility
    }
  }
}

