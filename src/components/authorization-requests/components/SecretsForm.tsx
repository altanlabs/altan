import React, { memo } from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import type { RequestedSecret, SecretValues } from '../types';

interface SecretsFormProps {
  secrets: RequestedSecret[];
  values: SecretValues;
  onChange: (key: string, value: string) => void;
}

export const SecretsForm = memo<SecretsFormProps>(({ secrets, values, onChange }) => {
  return (
    <div className="space-y-3">
      {secrets.map((secret) => (
        <div
          key={secret.key}
          className="space-y-1.5"
        >
          <Label className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
            {secret.label}
            {secret.required && (
              <span className="text-neutral-500 dark:text-neutral-500 ml-0.5">*</span>
            )}
          </Label>
          {secret.description && (
            <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-tight">
              {secret.description}
            </p>
          )}
          <Input
            type={secret.type || 'text'}
            placeholder={secret.placeholder}
            value={values[secret.key] || ''}
            onChange={(e) => onChange(secret.key, e.target.value)}
            required={secret.required}
            className="h-7 text-xs"
          />
        </div>
      ))}
    </div>
  );
});

SecretsForm.displayName = 'SecretsForm';

