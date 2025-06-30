// TestWebhook.tsx  –  a fully self-contained refactor (TS-flavoured React 18 + MUI v5)

import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Tabs, Tab, Stack, Box, Typography, Divider,
  TextField, Select, MenuItem, FormControl, InputLabel,
  FormHelperText, IconButton,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import React, { memo } from 'react';

import InteractiveButton from '../buttons/InteractiveButton';
import Iconify from '../iconify';
import AceWrapper from '../json/AceWrapper';

// ---------- 1. types & helpers ------------------------------------------------

type KeyValue = { key: string; value: string };
type Webhook = {
  name: string;
  url: string;
  details?: {
    schema?: Record<string, any>;
  };
};

const buildDefault = (schema?: Record<string, any>, parentRequired: boolean = false): any => {
  if (!schema?.properties) return parentRequired ? {} : null;

  const required = new Set(schema.required || []);

  return Object.entries(schema.properties).reduce((acc, [key, prop]: [string, any]) => {
    const isRequired = required.has(key);

    if (!isRequired) {
      acc[key] = null;
      return acc;
    }

    if ('default' in prop) {
      acc[key] = prop.default;
    } else if (prop.type === 'object') {
      acc[key] = buildDefault(prop, isRequired);
    } else if (prop.type === 'array') {
      acc[key] = [];
    } else if (prop.type === 'boolean') {
      acc[key] = false;
    } else if (['number', 'integer'].includes(prop.type)) {
      acc[key] = 0;
    } else {
      acc[key] = '';
    }

    return acc;
  }, {} as Record<string, any>);
};

// ---------- 2. generic, reusable editors -------------------------------------

interface KeyValueEditorProps {
  rows: KeyValue[];
  onChange(rows: KeyValue[]): void;
  label: string;
}

const KeyValueEditor = memo(({ rows, onChange, label }: KeyValueEditorProps) => {
  const update = (i: number, field: keyof KeyValue, v: string) =>
    onChange(rows.map((r, idx) => (idx === i ? { ...r, [field]: v } : r)));

  const addRow = () => onChange([...rows, { key: '', value: '' }]);
  const removeRow = (i: number) =>
    onChange(rows.length > 1 ? rows.filter((_, idx) => idx !== i) : rows);

  return (
    <Stack spacing={1}>
      {rows.map((r, i) => (
        <Stack key={i} direction="row" spacing={1} alignItems="center">
          <TextField
            size="small"
            placeholder={`${label} name`}
            sx={{ flex: 1 }}
            value={r.key}
            onChange={(e) => update(i, 'key', e.target.value)}
          />
          <TextField
            size="small"
            placeholder="Value"
            sx={{ flex: 2 }}
            value={r.value}
            onChange={(e) => update(i, 'value', e.target.value)}
          />
          <IconButton
            size="small"
            disabled={rows.length === 1}
            onClick={() => removeRow(i)}
          >
            <Iconify icon="mdi:delete-outline" width={20} />
          </IconButton>
        </Stack>
      ))}
      <Button
        size="small"
        startIcon={<Iconify icon="mdi:plus" />}
        onClick={addRow}
      >
        Add&nbsp;{label}
      </Button>
    </Stack>
  );
});

interface JsonSchemaFormProps {
  schema?: Record<string, any>;
  data: Record<string, any>;
  onChange(d: Record<string, any>): void;
}

const JsonSchemaForm = memo(({ schema, data, onChange }: JsonSchemaFormProps) => {
  if (!schema?.properties) return null;
  const required = schema.required ?? [];

  return (
    <Box sx={{ overflowY: 'auto', maxHeight: '50vh', pr: 1 }}>
      {Object.entries(schema.properties).map(([k, p]: any) => {
        const fieldId = `field-${k}`;
        const desc = p.description ? (
          <FormHelperText>{p.description}</FormHelperText>
        ) : null;

        // ---- enums -----------------------------------------------------------
        if (p.enum) {
          return (
            <FormControl
              fullWidth
              required={required.includes(k)}
              size="small"
              key={k}
              sx={{ mb: 2 }}
            >
              <InputLabel id={`${fieldId}-label`}>{p.title || k}</InputLabel>
              <Select
                labelId={`${fieldId}-label`}
                id={fieldId}
                value={data[k] ?? ''}
                label={p.title || k}
                onChange={(e) =>
                  onChange({ ...data, [k]: e.target.value })
                }
              >
                {p.enum.map((val: any, idx: number) => (
                  <MenuItem key={val} value={val}>
                    {p.enumDescriptions?.[idx] ?? val}
                  </MenuItem>
                ))}
              </Select>
              {desc}
            </FormControl>
          );
        }

        // ---- primitives ------------------------------------------------------
        return (
          <Box key={k} sx={{ mb: 2 }}>
            <TextField
              fullWidth
              required={required.includes(k)}
              size="small"
              label={p.title || k}
              type={
                p.format === 'date-time'
                  ? 'datetime-local'
                  : ['number', 'integer'].includes(p.type)
                    ? 'number'
                    : 'text'
              }
              inputProps={{
                min: p.minimum,
                max: p.maximum,
                step: p.type === 'number' ? 'any' : undefined,
              }}
              value={data[k] ?? ''}
              onChange={(e) =>
                onChange({ ...data, [k]: e.target.value })
              }
            />
            {desc}
          </Box>
        );
      })}
    </Box>
  );
});

// ---------- 3. stateful logic extracted to a hook -----------------------------

type TabKey = 'body' | 'headers' | 'params';

const useWebhookTester = (webhook?: Webhook) => {
  const { enqueueSnackbar } = useSnackbar();
  const schema = webhook?.details?.schema;
  const bodySchema = schema?.body;
  const querySchema = schema?.query_params;
  const methods = schema?.methods ?? [
    'POST',
    'GET',
    'PUT',
    'DELETE',
    'PATCH',
  ];

  const [tab, setTab] = React.useState<TabKey>('body');
  const [busy, setBusy] = React.useState(false);
  const [form, setForm] = React.useState(() => buildDefault(bodySchema));

  const [req, setReq] = React.useState(() => ({
    method: methods[0],
    url: webhook?.url
      ? `https://api.altan.ai/galaxia/hook/${webhook.url}`
      : '',
    headers: [{ key: 'Content-Type', value: 'application/json' }] as KeyValue[],
    query: querySchema?.properties
      ? Object.keys(querySchema.properties).map((k) => ({ key: k, value: '' }))
      : [{ key: '', value: '' }],
    rawBody: '{}',
  }));

  const updateKV =
    (field: 'headers' | 'query') =>
      (rows: KeyValue[]) =>
        setReq((r) => ({ ...r, [field]: rows }));

  const send = async () => {
    if (!req.url) {
      enqueueSnackbar('Please enter a valid URL', { variant: 'error' });
      return;
    }

    // ---- validate required fields -----------------------------------------
    if (tab === 'body' && bodySchema?.required?.length) {
      const missing = bodySchema.required.filter(
        (f: string) =>
          form[f] === undefined || form[f] === '' || form[f] === null
      );
      if (missing.length) {
        enqueueSnackbar(
          `Missing required fields: ${missing.join(', ')}`,
          { variant: 'error' }
        );
        return;
      }
    }

    try {
      setBusy(true);
      const headers = Object.fromEntries(
        req.headers.filter(({ key }) => key).map(({ key, value }) => [key, value])
      );

      const qs = new URLSearchParams();
      req.query.forEach(({ key, value }) => key && qs.append(key, value));
      const url = qs.toString() ? `${req.url}?${qs}` : req.url;

      const body =
        tab === 'body' && bodySchema
          ? form
          : (() => {
            try {
              return req.rawBody?.trim()
                ? JSON.parse(req.rawBody)
                : undefined;
            } catch (e) {
              throw new Error('Invalid JSON in raw body');
            }
          })();

      const res = await fetch(url, {
        method: req.method,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });

      const resData =
        (await res.clone().json().catch(() => null)) ??
        `${res.status} ${res.statusText}`;

      enqueueSnackbar(`Status ${res.status}`, {
        variant: res.ok ? 'success' : 'warning',
      });
      // eslint-disable-next-line no-console
      console.log('Webhook response →', resData);
    } catch (err: any) {
      enqueueSnackbar(`Error: ${err.message}`, { variant: 'error' });
    } finally {
      setBusy(false);
    }
  };

  return {
    tab,
    setTab,
    busy,
    req,
    setReq,
    form,
    setForm,
    methods,
    schema: { bodySchema, querySchema },
    updateHeaders: updateKV('headers'),
    updateQuery: updateKV('query'),
    send,
  };
};

// ---------- 4. the top-level component ---------------------------------------

interface Props {
  webhook?: Webhook;
}

function TestWebhook({ webhook }: Props) {
  const t = useWebhookTester(webhook);
  if (!webhook?.url) return null;

  return (
    <>
      <InteractiveButton
        icon="uil:bolt"
        title="Send a request to this webhook"
        onClick={() => t.setTab('body')} // open first, tab is managed in the dialog
        duration={8000}
        containerClassName="h-[40] border-transparent"
        borderClassName="h-[80px] w-[250px]"
        enableBorder
        className="p-2"
      />

      <Dialog
        open={Boolean(t.tab)} // a quick-n-dirty “open”
        onClose={() => t.setTab('' as any)} // close
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            minHeight: '70vh',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
          },
          elevation: 4,
        }}
      >
        {/* ---------- header -------------------------------------------------- */}
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="mdi:webhook" width={24} />
            <span>Test Webhook&nbsp;·&nbsp;{webhook.name}</span>
          </Stack>
        </DialogTitle>

        {/* ---------- main content ------------------------------------------- */}
        <DialogContent dividers sx={{ flex: 1, overflow: 'hidden' }}>
          <Stack spacing={2} sx={{ height: '100%' }}>
            {/* row: method & url */}
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <FormControl size="small" sx={{ minWidth: 110 }}>
                <InputLabel>Method</InputLabel>
                <Select
                  label="Method"
                  value={t.req.method}
                  onChange={(e) =>
                    t.setReq({ ...t.req, method: e.target.value })
                  }
                >
                  {t.methods.map((m) => (
                    <MenuItem key={m} value={m}>
                      {m}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Request URL
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={t.req.url}
                  onChange={(e) =>
                    t.setReq({ ...t.req, url: e.target.value })
                  }
                />
              </Box>
            </Stack>

            {/* row: tabs */}
            <Tabs
              value={t.tab}
              onChange={(_, v) => t.setTab(v)}
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab value="body" label="Body" />
              <Tab value="headers" label="Headers" />
              <Tab value="params" label="Query&nbsp;Params" />
            </Tabs>

            {/* row: tab content */}
            {t.tab === 'body' && (
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {t.schema.bodySchema?.properties && (
                  <>
                    <Typography variant="subtitle2" gutterBottom>
                      Request Body (via Schema)
                    </Typography>
                    <JsonSchemaForm
                      schema={t.schema.bodySchema}
                      data={t.form}
                      onChange={t.setForm}
                    />
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" gutterBottom>
                      Raw JSON
                    </Typography>
                  </>
                )}
                <AceWrapper
                  name="webhook-raw-body"
                  value={
                    t.schema.bodySchema
                      ? JSON.stringify(t.form, null, 2)
                      : t.req.rawBody
                  }
                  onChange={(val: any) => t.setReq({ ...t.req, rawBody: val })}
                  fieldType="string"
                  style={{
                    flex: 1,
                    minHeight: 200,
                    borderRadius: 1,
                    border: '1px solid rgba(0,0,0,0.23)',
                  }}
                />
              </Box>
            )}

            {t.tab === 'headers' && (
              <KeyValueEditor
                rows={t.req.headers}
                onChange={t.updateHeaders}
                label="Header"
              />
            )}

            {t.tab === 'params' && (
              <KeyValueEditor
                rows={t.req.query}
                onChange={t.updateQuery}
                label="Parameter"
              />
            )}
          </Stack>
        </DialogContent>

        {/* ---------- actions ------------------------------------------------- */}
        <DialogActions sx={{ borderTop: 1, borderColor: 'divider' }}>
          <Button
            color="inherit"
            onClick={() => t.setTab('' as any)}
            disabled={t.busy}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={t.send}
            startIcon={<Iconify icon="mdi:send" />}
            disabled={t.busy}
          >
            {t.busy ? 'Sending…' : 'Send Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default memo(TestWebhook);
