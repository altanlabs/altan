import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  CircularProgress,
  Menu,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { Search, FolderOpen, FolderPlus, MoreVertical, Trash2, Lock, Unlock, ArrowLeft, RefreshCw, File } from 'lucide-react';
import React, { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';

import {
  selectBucketCacheForBase,
  selectBucketCacheState,
  preloadBucketsForBase,
  addBucketToCache,
  removeBucketFromCache,
  updateBucketInCache,
} from '../../../../redux/slices/bases';
import { dispatch } from '../../../../redux/store';
import { optimai_pg_meta, optimai_cloud } from '../../../../utils/axios';

// Helper to format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 30) return `${diffDays} days ago`;
  return date.toLocaleDateString();
};

// Helper to check if file is an image
const isImageFile = (filename) => {
  if (!filename) return false;
  const ext = filename.toLowerCase().split('.').pop();
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext);
};

// Helper to build file preview URL
const getFilePreviewUrl = (cloudUrl, bucketId, fileName, isPublic) => {
  if (!cloudUrl || !bucketId || !fileName) return null;
  const visibility = isPublic ? 'public' : 'authenticated';
  return `${cloudUrl}/storage/v1/object/${visibility}/${bucketId}/${fileName}`;
};

function BaseStorage({ baseId }) {
  const bucketCacheObject = useSelector((state) => selectBucketCacheForBase(state, baseId));
  const bucketCacheState = useSelector(selectBucketCacheState);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedBucket, setSelectedBucket] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newBucketName, setNewBucketName] = useState('');
  const [newBucketPublic, setNewBucketPublic] = useState(false);
  const [operating, setOperating] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Files view state
  const [viewingBucket, setViewingBucket] = useState(null);
  const [files, setFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [filesError, setFilesError] = useState(null);

  // Instance info for file previews
  const [cloudUrl, setCloudUrl] = useState(null);

  // Fetch buckets from database on mount
  useEffect(() => {
    dispatch(preloadBucketsForBase(baseId));
  }, [baseId]);

  // Fetch instance info to get cloud_url for file previews
  useEffect(() => {
    const fetchInstanceInfo = async () => {
      try {
        const response = await optimai_cloud.get(`/v1/instances/${baseId}`);
        if (response.data?.connection?.cloud_url) {
          setCloudUrl(response.data.connection.cloud_url);
        }
      } catch {
        // Silently fail - preview won't be available
      }
    };

    fetchInstanceInfo();
  }, [baseId]);

  // Convert bucket cache object to array
  const buckets = useMemo(() => {
    return Object.values(bucketCacheObject);
  }, [bucketCacheObject]);

  const filteredBuckets = useMemo(() => {
    if (!searchQuery) return buckets;
    const query = searchQuery.toLowerCase();
    return buckets.filter((bucket) => {
      const name = (bucket.name || '').toLowerCase();
      const id = (bucket.id || '').toString().toLowerCase();
      return name.includes(query) || id.includes(query);
    });
  }, [buckets, searchQuery]);

  const handleMenuOpen = (event, bucket) => {
    setMenuAnchor(event.currentTarget);
    setSelectedBucket(bucket);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedBucket(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const fetchFiles = async (bucketId) => {
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
      const response = await optimai_pg_meta.post(`/${baseId}/query`, { query });
      setFiles(response.data || []);
    } catch (error) {
      setFilesError(error.response?.data?.message || error.message || 'Failed to load files');
    } finally {
      setFilesLoading(false);
    }
  };

  const handleViewBucket = (bucket) => {
    setViewingBucket(bucket);
    fetchFiles(bucket.id);
  };

  const handleBackToBuckets = () => {
    setViewingBucket(null);
    setFiles([]);
    setFilesError(null);
  };

  const handleRefreshFiles = () => {
    if (viewingBucket) {
      fetchFiles(viewingBucket.id);
    }
  };

  const handleDeleteFile = async (file) => {
    setOperating(true);
    try {
      const query = `
        DELETE FROM storage.objects
        WHERE id = '${file.id}';
      `;
      await optimai_pg_meta.post(`/${baseId}/query`, { query });

      // Remove file from local state directly
      setFiles((prevFiles) => prevFiles.filter((f) => f.id !== file.id));

      setSnackbar({
        open: true,
        message: 'File deleted successfully',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || error.message || 'Failed to delete file',
        severity: 'error',
      });
    } finally {
      setOperating(false);
    }
  };

  const handleCreateBucket = async () => {
    if (!newBucketName.trim()) {
      setSnackbar({
        open: true,
        message: 'Bucket name is required',
        severity: 'error',
      });
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
      const response = await optimai_pg_meta.post(`/${baseId}/query`, { query });

      // Add bucket to Redux cache directly
      const newBucket = response.data?.[0] || {
        id: bucketId,
        name: bucketId,
        public: newBucketPublic,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      dispatch(addBucketToCache({ bucket: newBucket, baseId }));

      setSnackbar({
        open: true,
        message: 'Bucket created successfully',
        severity: 'success',
      });

      setCreateDialogOpen(false);
      setNewBucketName('');
      setNewBucketPublic(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || error.message || 'Failed to create bucket',
        severity: 'error',
      });
    } finally {
      setOperating(false);
    }
  };

  const handleDeleteBucket = async () => {
    if (!selectedBucket) return;

    handleMenuClose();
    setOperating(true);

    try {
      const query = `
        DELETE FROM storage.buckets
        WHERE id = '${selectedBucket.id}';
      `;
      await optimai_pg_meta.post(`/${baseId}/query`, { query });

      // Remove bucket from Redux cache directly
      dispatch(removeBucketFromCache({ bucketId: selectedBucket.id, baseId }));

      setSnackbar({
        open: true,
        message: 'Bucket deleted successfully',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || error.message || 'Failed to delete bucket',
        severity: 'error',
      });
    } finally {
      setOperating(false);
    }
  };

  const handleTogglePublic = async () => {
    if (!selectedBucket) return;

    const newPublicValue = !selectedBucket.public;
    handleMenuClose();
    setOperating(true);

    try {
      const query = `
        UPDATE storage.buckets
        SET public = ${newPublicValue}, updated_at = NOW()
        WHERE id = '${selectedBucket.id}'
        RETURNING *;
      `;
      const response = await optimai_pg_meta.post(`/${baseId}/query`, { query });

      // Update bucket in Redux cache directly
      const updatedBucket = response.data?.[0] || {
        ...selectedBucket,
        public: newPublicValue,
        updated_at: new Date().toISOString(),
      };
      dispatch(updateBucketInCache({ bucket: updatedBucket, baseId }));

      setSnackbar({
        open: true,
        message: `Bucket is now ${newPublicValue ? 'public' : 'private'}`,
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || error.message || 'Failed to update bucket',
        severity: 'error',
      });
    } finally {
      setOperating(false);
    }
  };

  // Show loading state
  if (bucketCacheState.loading && buckets.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 3 }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            Loading buckets...
          </Typography>
        </Stack>
      </Box>
    );
  }

  // Show error state if there's an error
  if (bucketCacheState.error && buckets.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Card>
          <CardContent>
            <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
              <Typography variant="h6" color="error">
                Unable to load buckets
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                {bucketCacheState.error}
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Make sure your database has the storage.buckets table.
              </Typography>
              <Button
                variant="outlined"
                onClick={() => dispatch(preloadBucketsForBase(baseId))}
              >
                Try Again
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Files view - show when viewing a specific bucket
  if (viewingBucket) {
    return (
      <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
        <Stack spacing={3}>
          {/* Header */}
          <Stack spacing={2}>
            <Button
              startIcon={<ArrowLeft size={20} />}
              onClick={handleBackToBuckets}
              sx={{ alignSelf: 'flex-start' }}
              variant="text"
            >
              Back to Buckets
            </Button>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h4" gutterBottom>
                  {viewingBucket.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Files in this bucket
                </Typography>
              </Box>
              <Button
                startIcon={<RefreshCw size={18} />}
                onClick={handleRefreshFiles}
                disabled={filesLoading}
                variant="outlined"
                size="small"
              >
                Refresh
              </Button>
            </Stack>
          </Stack>

          {/* Loading State */}
          {filesLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
              <Stack spacing={2} alignItems="center">
                <CircularProgress />
                <Typography variant="body2" color="text.secondary">
                  Loading files...
                </Typography>
              </Stack>
            </Box>
          )}

          {/* Error State */}
          {filesError && !filesLoading && (
            <Card>
              <CardContent>
                <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
                  <Typography variant="h6" color="error">
                    Unable to load files
                  </Typography>
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    {filesError}
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={handleRefreshFiles}
                  >
                    Try Again
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          )}

          {/* Files Table */}
          {!filesLoading && !filesError && (
            <Card>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Owner</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell>Last Accessed</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {files.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
                            <File size={48} color="gray" />
                            <Typography variant="body2" color="text.secondary">
                              No files found in this bucket
                            </Typography>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ) : (
                      files.map((file) => {
                        const isImage = isImageFile(file.name);
                        const previewUrl = cloudUrl && viewingBucket?.public
                          ? getFilePreviewUrl(cloudUrl, viewingBucket.id, file.name, viewingBucket.public)
                          : null;

                        return (
                          <TableRow key={file.id} hover>
                            <TableCell>
                              <Stack direction="row" spacing={1.5} alignItems="center">
                                {isImage && previewUrl ? (
                                  <Box
                                    component="img"
                                    src={previewUrl}
                                    alt={file.name}
                                    sx={{
                                      width: 40,
                                      height: 40,
                                      borderRadius: 1,
                                      objectFit: 'cover',
                                      border: '1px solid',
                                      borderColor: 'divider',
                                    }}
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <File size={20} />
                                )}
                                <Box>
                                  <Typography variant="body2" fontWeight={500}>
                                    {file.name || 'Unnamed'}
                                  </Typography>
                                  {isImage && previewUrl && (
                                    <Typography
                                      variant="caption"
                                      color="primary"
                                      component="a"
                                      href={previewUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      sx={{
                                        textDecoration: 'none',
                                        '&:hover': { textDecoration: 'underline' },
                                      }}
                                    >
                                      View full image
                                    </Typography>
                                  )}
                                </Box>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {file.owner || 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {formatDate(file.created_at)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {formatDate(file.last_accessed_at)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteFile(file)}
                                disabled={operating}
                                color="error"
                              >
                                <Trash2 size={18} />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          )}

          {/* Files count */}
          {!filesLoading && !filesError && (
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                {files.length} {files.length === 1 ? 'file' : 'files'}
              </Typography>
            </Stack>
          )}
        </Stack>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      <Stack spacing={3}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" gutterBottom>
              Storage
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage files, images, and documents in buckets.
            </Typography>
          </Box>
        </Stack>

        {/* Buckets Section */}
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">
              Buckets
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View and manage storage buckets.
            </Typography>
          </Stack>

          {/* Actions Bar */}
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<FolderPlus size={18} />}
              size="small"
              onClick={() => setCreateDialogOpen(true)}
              disabled={operating}
            >
              Create Bucket
            </Button>
            <TextField
              size="small"
              placeholder="Search by name or ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} />
                  </InputAdornment>
                ),
              }}
              sx={{ flex: 1, maxWidth: 400 }}
            />
          </Stack>

          {/* Buckets Table */}
          <Card>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>ID</TableCell>
                    <TableCell>Public</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredBuckets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
                          <FolderOpen size={48} color="gray" />
                          <Typography variant="body2" color="text.secondary">
                            No buckets found
                          </Typography>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBuckets.map((bucket) => {
                      const isPublic = bucket.public === true;
                      return (
                        <TableRow
                          key={bucket.id}
                          hover
                          onClick={() => handleViewBucket(bucket)}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <FolderOpen size={20} />
                              <Box>
                                <Typography variant="body2" fontWeight={500}>
                                  {bucket.name || 'Unnamed'}
                                </Typography>
                                {bucket.owner && (
                                  <Typography variant="caption" color="text.secondary">
                                    Owner: {bucket.owner}
                                  </Typography>
                                )}
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                              {bucket.id}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={isPublic ? <Unlock size={14} /> : <Lock size={14} />}
                              label={isPublic ? 'Public' : 'Private'}
                              size="small"
                              color={isPublic ? 'success' : 'default'}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(bucket.created_at)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMenuOpen(e, bucket);
                              }}
                            >
                              <MoreVertical size={18} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>

          {/* Pagination info */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {filteredBuckets.length} {filteredBuckets.length === 1 ? 'bucket found' : 'buckets found'}
            </Typography>
          </Stack>
        </Box>
      </Stack>

      {/* Bucket Actions Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleTogglePublic}>
          <ListItemIcon>
            {selectedBucket?.public ? <Lock size={18} /> : <Unlock size={18} />}
          </ListItemIcon>
          <ListItemText>
            {selectedBucket?.public ? 'Make private' : 'Make public'}
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteBucket} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <Trash2 size={18} color="currentColor" />
          </ListItemIcon>
          <ListItemText>Delete bucket</ListItemText>
        </MenuItem>
      </Menu>

      {/* Create Bucket Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => !operating && setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Bucket</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Bucket Name"
              placeholder="my-bucket"
              value={newBucketName}
              onChange={(e) => setNewBucketName(e.target.value)}
              fullWidth
              disabled={operating}
              helperText="Bucket name will be used as the ID. Use lowercase letters, numbers, and hyphens."
            />
            <FormControlLabel
              control={
                <Switch
                  checked={newBucketPublic}
                  onChange={(e) => setNewBucketPublic(e.target.checked)}
                  disabled={operating}
                />
              }
              label="Public bucket"
            />
            <Typography variant="body2" color="text.secondary">
              Public buckets allow anyone to access files. Private buckets require authentication.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)} disabled={operating}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateBucket}
            variant="contained"
            disabled={operating || !newBucketName.trim()}
          >
            {operating ? 'Creating...' : 'Create Bucket'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default BaseStorage;
