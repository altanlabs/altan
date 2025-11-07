import {
  Search,
  FolderOpen,
  FolderPlus,
  MoreVertical,
  Trash2,
  Lock,
  Unlock,
  ArrowLeft,
  RefreshCw,
  File,
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { useToast } from '../../../hooks/use-toast';
import {
  selectBucketCacheForBase,
  selectBucketCacheState,
  preloadBucketsForBase,
  addBucketToCache,
  removeBucketFromCache,
  updateBucketInCache,
} from '../../../redux/slices/bases';
import { dispatch } from '../../../redux/store';
import { optimai_cloud } from '../../../utils/axios';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button.tsx';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Dialog, DialogContent, DialogTitle } from '../../ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Skeleton } from '../../ui/skeleton';
import { Switch } from '../../ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';

// Helper to format date
function formatRelativeDate(value) {
  if (!value) return 'N/A';
  try {
    const date = new Date(value);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 30) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  } catch {
    return 'N/A';
  }
}

function isImageFile(filename) {
  if (!filename) return false;
  const ext = filename.toLowerCase().split('.').pop();
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext);
}

function getFilePreviewUrl(cloudUrl, bucketId, fileName, isPublic) {
  if (!cloudUrl || !bucketId || !fileName) return null;
  const visibility = isPublic ? 'public' : 'authenticated';
  return `${cloudUrl}/storage/v1/object/${visibility}/${bucketId}/${fileName}`;
}

const CloudStorage = () => {
  const { cloudId } = useParams();
  const { toast } = useToast();

  const bucketCacheObject = useSelector((state) => selectBucketCacheForBase(state, cloudId));
  const bucketCacheState = useSelector(selectBucketCacheState);

  const [searchQuery, setSearchQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [newBucketName, setNewBucketName] = useState('');
  const [newBucketPublic, setNewBucketPublic] = useState(false);
  const [operating, setOperating] = useState(false);

  // Files view state
  const [viewingBucket, setViewingBucket] = useState(null);
  const [files, setFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [filesError, setFilesError] = useState(null);
  const [cloudUrl, setCloudUrl] = useState(null);

  // Initial buckets load
  useEffect(() => {
    if (!cloudId) return;
    dispatch(preloadBucketsForBase(cloudId));
  }, [cloudId]);

  // Load instance info for file preview base URL
  useEffect(() => {
    if (!cloudId) return;
    const run = async () => {
      try {
        const response = await optimai_cloud.get(`/v1/instances/${cloudId}`);
        if (response.data?.connection?.cloud_url) {
          setCloudUrl(response.data.connection.cloud_url);
        }
      } catch {
        // ignore - previews may not work
      }
    };
    run();
  }, [cloudId]);

  // Derived buckets array
  const buckets = useMemo(() => {
    return Object.values(bucketCacheObject || {});
  }, [bucketCacheObject]);

  const filteredBuckets = useMemo(() => {
    if (!searchQuery) return buckets;
    const q = searchQuery.toLowerCase();
    return buckets.filter((b) => {
      const name = (b.name || '').toLowerCase();
      const id = (b.id || '').toString().toLowerCase();
      return name.includes(q) || id.includes(q);
    });
  }, [buckets, searchQuery]);

  const fetchFiles = useCallback(async (bucketId) => {
    setFilesLoading(true);
    setFilesError(null);
    try {
      const query = `
        SELECT id, name, bucket_id, owner, created_at, updated_at, last_accessed_at, 
               metadata::text as metadata
        FROM storage.objects
        WHERE bucket_id = '${bucketId}'
        ORDER BY created_at DESC;
      `;
      const response = await optimai_cloud.post(`/v1/pg-meta/${cloudId}/query`, { query });
      setFiles(response.data || []);
    } catch (error) {
      setFilesError(error.response?.data?.message || error.message || 'Failed to load files');
    } finally {
      setFilesLoading(false);
    }
  }, [cloudId]);

  const handleViewBucket = useCallback((bucket) => {
    setViewingBucket(bucket);
    fetchFiles(bucket.id);
  }, [fetchFiles]);

  const handleBackToBuckets = useCallback(() => {
    setViewingBucket(null);
    setFiles([]);
    setFilesError(null);
  }, []);

  const handleRefreshFiles = useCallback(() => {
    if (viewingBucket) {
      fetchFiles(viewingBucket.id);
    }
  }, [viewingBucket, fetchFiles]);

  const handleCreateBucket = useCallback(async () => {
    if (!newBucketName.trim()) {
      toast({ title: 'Bucket name is required', description: 'Please enter a bucket name.' });
      return;
    }
    setOperating(true);
    try {
      const bucketId = newBucketName.trim();
      const query = `
        INSERT INTO storage.buckets (id, name, public, created_at, updated_at)
        VALUES ('${bucketId}', '${bucketId}', ${newBucketPublic}, NOW(), NOW())
        RETURNING *;
      `;
      const response = await optimai_cloud.post(`/v1/pg-meta/${cloudId}/query`, { query });
      const newBucket = response.data?.[0] || {
        id: bucketId,
        name: bucketId,
        public: newBucketPublic,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      dispatch(addBucketToCache({ bucket: newBucket, baseId: cloudId }));
      toast({ title: 'Bucket created', description: `Bucket "${bucketId}" created successfully.` });
      setCreateOpen(false);
      setNewBucketName('');
      setNewBucketPublic(false);
    } catch (error) {
      toast({
        title: 'Failed to create bucket',
        description: error.response?.data?.message || error.message || 'Unknown error',
      });
    } finally {
      setOperating(false);
    }
  }, [newBucketName, newBucketPublic, cloudId, toast]);

  const handleDeleteBucket = useCallback(async (bucket) => {
    setOperating(true);
    try {
      const query = `
        DELETE FROM storage.buckets
        WHERE id = '${bucket.id}';
      `;
      await optimai_cloud.post(`/v1/pg-meta/${cloudId}/query`, { query });
      dispatch(removeBucketFromCache({ bucketId: bucket.id, baseId: cloudId }));
      toast({ title: 'Bucket deleted', description: `Bucket "${bucket.name}" deleted.` });
    } catch (error) {
      toast({
        title: 'Failed to delete bucket',
        description: error.response?.data?.message || error.message || 'Unknown error',
      });
    } finally {
      setOperating(false);
    }
  }, [cloudId, toast]);

  const handleTogglePublic = useCallback(async (bucket) => {
    const newPublicValue = !bucket.public;
    setOperating(true);
    try {
      const query = `
        UPDATE storage.buckets
        SET public = ${newPublicValue}, updated_at = NOW()
        WHERE id = '${bucket.id}'
        RETURNING *;
      `;
      const response = await optimai_cloud.post(`/v1/pg-meta/${cloudId}/query`, { query });
      const updatedBucket = response.data?.[0] || {
        ...bucket,
        public: newPublicValue,
        updated_at: new Date().toISOString(),
      };
      dispatch(updateBucketInCache({ bucket: updatedBucket, baseId: cloudId }));
      toast({
        title: 'Bucket updated',
        description: `Bucket is now ${newPublicValue ? 'public' : 'private'}.`,
      });
    } catch (error) {
      toast({
        title: 'Failed to update bucket',
        description: error.response?.data?.message || error.message || 'Unknown error',
      });
    } finally {
      setOperating(false);
    }
  }, [cloudId, toast]);

  const handleDeleteFile = useCallback(async (file) => {
    if (!viewingBucket) return;
    setOperating(true);
    try {
      const query = `
        DELETE FROM storage.objects
        WHERE id = '${file.id}';
      `;
      await optimai_cloud.post(`/v1/pg-meta/${cloudId}/query`, { query });
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
      toast({ title: 'File deleted', description: `${file.name} was removed.` });
    } catch (error) {
      toast({
        title: 'Failed to delete file',
        description: error.response?.data?.message || error.message || 'Unknown error',
      });
    } finally {
      setOperating(false);
    }
  }, [cloudId, viewingBucket, toast]);

  // Buckets screen
  if (!viewingBucket) {
    return (
      <div className="h-full w-full overflow-hidden">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center gap-2 p-3 border-b border-border bg-muted/20">
            <div className="font-semibold text-foreground">Storage</div>
            <div className="ml-auto flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="h-8 pl-8 w-[280px]"
                  placeholder="Search by name or ID"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8"
                onClick={() => dispatch(preloadBucketsForBase(cloudId))}
                aria-label="Refresh"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                onClick={() => setCreateOpen(true)}
                disabled={operating}
                className="h-8"
              >
                <FolderPlus className="h-4 w-4 mr-2" />
                Create Bucket
              </Button>
            </div>
          </div>

          {/* Buckets Table */}
          {bucketCacheState.loading && buckets.length === 0 ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <Card className="mx-3">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Buckets</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Table className="min-w-[700px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Public</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBuckets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5}>
                          <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                            <FolderOpen className="h-5 w-5 mr-2" />
                            No buckets found
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredBuckets.map((bucket) => {
                        const isPublic = bucket.public === true;
                        return (
                          <TableRow
                            key={bucket.id}
                            className="cursor-pointer"
                            onClick={() => handleViewBucket(bucket)}
                          >
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <FolderOpen className="h-4 w-4" />
                                <div className="font-medium">{bucket.name || 'Unnamed'}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-xs text-muted-foreground font-mono">{bucket.id}</div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="secondary"
                                className={`px-2 py-0 h-5 ${isPublic ? '' : ''}`}
                              >
                                {isPublic ? 'Public' : 'Private'}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatRelativeDate(bucket.created_at)}</TableCell>
                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="icon" variant="ghost" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleTogglePublic(bucket)}>
                                    {bucket.public ? (
                                      <Lock className="h-4 w-4 mr-2" />
                                    ) : (
                                      <Unlock className="h-4 w-4 mr-2" />
                                    )}
                                    {bucket.public ? 'Make private' : 'Make public'}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => handleDeleteBucket(bucket)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete bucket
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Create Bucket Dialog */}
        <Dialog open={createOpen} onOpenChange={(open) => !operating && setCreateOpen(open)}>
          <DialogContent className="max-w-md p-0 overflow-hidden">
            <div className="border-b px-6 py-4">
              <DialogTitle>Create New Bucket</DialogTitle>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Bucket Name</Label>
                <Input
                  placeholder="my-bucket"
                  value={newBucketName}
                  onChange={(e) => setNewBucketName(e.target.value)}
                  disabled={operating}
                />
                <div className="text-xs text-muted-foreground">
                  Use lowercase letters, numbers, and hyphens. Name will also be used as the ID.
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Public bucket</Label>
                  <p className="text-xs text-muted-foreground">Anyone can access files in public buckets.</p>
                </div>
                <Switch
                  checked={newBucketPublic}
                  onCheckedChange={setNewBucketPublic}
                  disabled={operating}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={operating}>
                  Cancel
                </Button>
                <Button onClick={handleCreateBucket} disabled={operating || !newBucketName.trim()}>
                  {operating ? 'Creating…' : 'Create Bucket'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Files screen
  return (
    <div className="p-3 h-full w-full overflow-hidden">
      <div className="space-y-3">
        {/* Header */}
        <div className="space-y-2">
          <Button variant="ghost" size="sm" className="h-8 w-auto px-2" onClick={handleBackToBuckets}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Buckets
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-semibold">{viewingBucket?.name}</div>
              <div className="text-sm text-muted-foreground">Files in this bucket</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshFiles}
              disabled={filesLoading}
              className="h-8"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Loading */}
        {filesLoading && (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        )}

        {/* Error */}
        {filesError && !filesLoading && (
          <Card>
            <CardContent className="py-6">
              <div className="flex flex-col items-center gap-2">
                <div className="text-sm font-medium text-destructive">Unable to load files</div>
                <div className="text-xs text-muted-foreground">{filesError}</div>
                <Button variant="outline" onClick={handleRefreshFiles} className="mt-2">
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Files Table */}
        {!filesLoading && !filesError && (
          <Card>
            <CardContent className="pt-4">
              <Table className="min-w-[700px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Accessed</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {files.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                          <File className="h-5 w-5 mr-2" />
                          No files found in this bucket
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    files.map((file) => {
                      const isImage = isImageFile(file.name);
                      const previewUrl =
                        cloudUrl && viewingBucket?.public
                          ? getFilePreviewUrl(cloudUrl, viewingBucket.id, file.name, viewingBucket.public)
                          : null;
                      return (
                        <TableRow key={file.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {isImage && previewUrl ? (
                                <img
                                  src={previewUrl}
                                  alt={file.name}
                                  className="h-10 w-10 rounded border object-cover"
                                  onError={(e) => (e.currentTarget.style.display = 'none')}
                                />
                              ) : (
                                <File className="h-4 w-4" />
                              )}
                              <div className="font-medium">{file.name || 'Unnamed'}</div>
                              {isImage && previewUrl && (
                                <a
                                  href={previewUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary hover:underline"
                                >
                                  View full image
                                </a>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">{file.owner || 'N/A'}</div>
                          </TableCell>
                          <TableCell>{formatRelativeDate(file.created_at)}</TableCell>
                          <TableCell>{formatRelativeDate(file.last_accessed_at)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 text-destructive"
                              onClick={() => handleDeleteFile(file)}
                              disabled={operating}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CloudStorage;
