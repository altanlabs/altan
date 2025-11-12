import { Download, RefreshCw } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useToast } from '../../../hooks/use-toast';
import { setSession } from '../../../utils/auth';
import { optimai_cloud } from '../../../utils/axios';
import { Button } from '../../ui/button.tsx';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Skeleton } from '../../ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '../../ui/tabs';

const SERVICES = [
  { value: 'all', label: 'All Services' },
  { value: 'postgres', label: 'postgres' },
  { value: 'postgrest', label: 'PostgREST' },
  { value: 'gotrue', label: 'Auth' },
  { value: 'pg-meta', label: 'pg-meta' },
  { value: 'storage', label: 'Storage' },
  { value: 'pypulse', label: 'Services' },
];

function formatTimestamp(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const ms = date.getMilliseconds().toString().padStart(3, '0');
  return `${hours}:${minutes}:${seconds}.${ms}`;
}

function getLogLevel(message) {
  if (!message) return 'info';
  const msg = message.toLowerCase();
  if (msg.includes('error') || msg.includes('fatal') || msg.includes('exited')) {
    return 'error';
  }
  if (msg.includes('warn') || msg.includes('deprecation')) {
    return 'warning';
  }
  if (msg.includes('success') || msg.includes('✅')) {
    return 'success';
  }
  return 'info';
}

const CloudLogs = () => {
  const { cloudId } = useParams();
  const { toast } = useToast();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');

  const fetchLogs = useCallback(
    async (showLoading = true) => {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);
      try {
        const authData = localStorage.getItem('oaiauth');
        if (authData) {
          try {
            const { access_token: accessToken } = JSON.parse(authData);
            if (accessToken) setSession(accessToken, optimai_cloud);
          } catch {}
        }

        let url = `/v1/instances/logs/cloud/${cloudId}`;
        if (serviceFilter !== 'all') {
          url += `/service/${serviceFilter}`;
        }
        url += '?tail=1000';

        const response = await optimai_cloud.get(url);
        const fetchedLogs = response.data?.lines || [];

        // Debug: log first few entries to see structure
        if (fetchedLogs.length > 0) {
          // eslint-disable-next-line no-console
          console.log('First 3 logs from API:', fetchedLogs.slice(0, 3));
          // eslint-disable-next-line no-console
          console.log('Total logs fetched:', fetchedLogs.length);
        }

        // Don't sort - keep the order from the API (which should be chronological from tail)
        setLogs(fetchedLogs);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load logs');
      } finally {
        setLoading(false);
      }
    },
    [cloudId, serviceFilter],
  );

  useEffect(() => {
    fetchLogs(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cloudId, serviceFilter]);

  // Auto-refresh every 10s
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        fetchLogs(false); // Refresh without showing loading spinner
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchLogs, loading]);

  const handleDownloadLogs = () => {
    const logsText = logs.map((log) => `[${log.timestamp}] ${log.message}`).join('\n');
    const blob = new Blob([logsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${cloudId}-${new Date().toISOString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: 'Logs downloaded', description: `${logs.length} log entries` });
  };

  const handleCopyLog = async (log) => {
    const logText = `[${log.timestamp}] ${log.message}`;
    try {
      await navigator.clipboard.writeText(logText);
      toast({ title: 'Copied', description: 'Log copied to clipboard' });
    } catch {
      // ignore
    }
  };

  const filteredLogs = useMemo(() => {
    const filtered = logs.filter((log) => {
      const message = log.message || '';
      const matchesSearch = !query || message.toLowerCase().includes(query.toLowerCase());
      const matchesLevel = levelFilter === 'all' || getLogLevel(log.message) === levelFilter;
      return matchesSearch && matchesLevel;
    });
    // Show most recent logs on top
    return [...filtered].reverse();
  }, [logs, query, levelFilter]);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b border-border bg-muted/20">
        <div className="font-semibold text-foreground">Logs</div>
        <div className="ml-auto flex items-center gap-2">
          <Input
            placeholder="Search logs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-8 w-[220px]"
          />
          <Select
            value={serviceFilter}
            onValueChange={setServiceFilter}
          >
            <SelectTrigger className="h-8 w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SERVICES.map((svc) => (
                <SelectItem
                  key={svc.value}
                  value={svc.value}
                >
                  {svc.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Tabs
            value={levelFilter}
            onValueChange={setLevelFilter}
          >
            <TabsList className="h-8">
              <TabsTrigger
                value="all"
                className="h-7 text-xs px-2"
              >
                All
              </TabsTrigger>
              <TabsTrigger
                value="error"
                className="h-7 text-xs px-2"
              >
                Errors
              </TabsTrigger>
              <TabsTrigger
                value="warning"
                className="h-7 text-xs px-2"
              >
                Warnings
              </TabsTrigger>
              <TabsTrigger
                value="success"
                className="h-7 text-xs px-2"
              >
                Success
              </TabsTrigger>
              <TabsTrigger
                value="info"
                className="h-7 text-xs px-2"
              >
                Info
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8"
            onClick={handleDownloadLogs}
            disabled={logs.length === 0}
            aria-label="Download logs"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8"
            onClick={() => fetchLogs(true)}
            disabled={loading}
            aria-label="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-3 mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Logs content */}
      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="h-full p-3 space-y-1">
            {Array.from({ length: 15 }).map((_, i) => (
              <div
                key={i}
                className="flex gap-2"
              >
                <Skeleton className="h-4 w-24" />
                <Skeleton className={`h-4 w-${40 + Math.floor(Math.random() * 40)}`} />
              </div>
            ))}
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="text-sm font-medium text-muted-foreground">No logs found</div>
              <div className="text-xs text-muted-foreground">
                {query || levelFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Logs will appear here when your application generates them'}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-auto font-mono text-xs">
            {filteredLogs.map((log, index) => {
              const level = getLogLevel(log.message);
              const levelColor =
                level === 'error'
                  ? 'text-red-400'
                  : level === 'warning'
                    ? 'text-yellow-400'
                    : level === 'success'
                      ? 'text-green-400'
                      : 'text-muted-foreground';
              return (
                <div
                  key={index}
                  onClick={() => handleCopyLog(log)}
                  className="flex gap-2 py-0.5 px-2 rounded hover:bg-muted/50 cursor-pointer group"
                >
                  <span className="text-muted-foreground/60 min-w-[90px] shrink-0">
                    {formatTimestamp(log.timestamp)}
                  </span>
                  <span className={`${levelColor} break-words flex-1 leading-relaxed`}>
                    {log.message || 'No message'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CloudLogs;
