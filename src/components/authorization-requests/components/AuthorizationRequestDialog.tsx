import React, { memo } from 'react';
import { X, HelpCircle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import CreateConnection from '../../tools/CreateConnection';
import { SecretsForm } from './SecretsForm';
import type { AuthorizationRequest, SecretValues } from '../types';

interface AuthorizationRequestDialogProps {
  request: AuthorizationRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReject: () => void;
  onSubmit: () => void;
  onGetHelp: () => void;
  secretValues: SecretValues;
  onSecretChange: (key: string, value: string) => void;
  isSubmitting: boolean;
  isFormValid: boolean;
  accountId: string | undefined;
}

export const AuthorizationRequestDialog = memo<AuthorizationRequestDialogProps>(
  ({
    request,
    open,
    onOpenChange,
    onReject,
    onSubmit,
    onGetHelp,
    secretValues,
    onSecretChange,
    isSubmitting,
    isFormValid,
    accountId,
  }) => {
    if (!request) return null;

    const isSecretsType = request.meta_data?.type === 'secrets';
    const requestTitle = isSecretsType
      ? 'Secret Authorization Required'
      : 'Connection Authorization';

    const requestDescription = isSecretsType
      ? 'Provide the requested credentials to continue'
      : 'Create a new connection to authorize this request';

    return (
      <Dialog
        open={open}
        onOpenChange={onOpenChange}
      >
        <DialogContent className="max-w-md max-h-[85vh] p-0 gap-0 flex flex-col">
          {/* Sticky Header */}
          <DialogHeader className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {requestTitle}
                </DialogTitle>
                <DialogDescription className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                  {requestDescription}
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onGetHelp}
                className="h-7 px-2 text-xs flex-shrink-0"
              >
                <HelpCircle className="h-3 w-3 mr-1" />
                Help
              </Button>
            </div>
          </DialogHeader>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {isSecretsType && request.meta_data?.requested_secrets ? (
              <SecretsForm
                secrets={request.meta_data.requested_secrets}
                values={secretValues}
                onChange={onSecretChange}
              />
            ) : (
              <CreateConnection
                id={request.connection_type_id}
                accountId={accountId}
                external_id={request.id}
                popup={true}
              />
            )}
          </div>

          {/* Sticky Footer */}
          {isSecretsType && (
            <DialogFooter className="px-4 py-3 border-t border-neutral-200 dark:border-neutral-800 flex-shrink-0">
              <div className="flex items-center gap-2 w-full">
                <Button
                  variant="outline"
                  onClick={onReject}
                  disabled={isSubmitting}
                  className="flex-1 h-7 text-xs"
                >
                  Reject
                </Button>
                <Button
                  onClick={onSubmit}
                  disabled={isSubmitting || !isFormValid}
                  className="flex-1 h-7 text-xs"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                      Authorizing...
                    </>
                  ) : (
                    'Authorize'
                  )}
                </Button>
              </div>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    );
  },
);

AuthorizationRequestDialog.displayName = 'AuthorizationRequestDialog';

