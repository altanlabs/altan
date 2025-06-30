import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  TextField,
} from '@mui/material';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import { createModel } from '../../../redux/slices/media';

const Upload3dDialog = ({ open, onClose }) => {
  const [usdzFile, setUsdzFile] = useState(null);
  const [androidFile, setAndroidFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [modelName, setModelName] = useState('');
  const [modelDescription, setModelDescription] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const dispatch = useDispatch();

  const createPreview = (file, setPreview) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUsdzFileChange = (event) => {
    const file = event.target.files[0];
    setUsdzFile(file);
  };

  const handleAndroidFileChange = (event) => {
    const file = event.target.files[0];
    setAndroidFile(file);
  };

  const handleImageFileChange = (event) => {
    const file = event.target.files[0];
    setImageFile(file);
    createPreview(file, setImagePreview);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('name', modelName);
    formData.append('description', modelDescription);
    formData.append('is_public', true); // Assuming default value as true
    formData.append('usdz_file', usdzFile);
    formData.append('android_file', androidFile);
    formData.append('image_file', imageFile);

    try {
      const response = await dispatch(createModel({ data: formData }));
      console.log(response); // Handle the success response
      onClose();
    } catch (error) {
      console.error(`Upload failed: ${error.message}`);
      // Handle the error
    }
  };

  const handleClose = () => {
    setUsdzFile(null);
    setAndroidFile(null);
    setImageFile(null);
    setModelName('');
    setModelDescription('');
    setImagePreview(null);
    onClose();
  };

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={handleClose}
    >
      <DialogTitle>Upload 3D Media</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Typography variant="body2">
            Provide model details and upload the corresponding files.
          </Typography>
          <TextField
            label="Model Name"
            variant="outlined"
            fullWidth
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
          />
          <TextField
            label="Model Description"
            variant="outlined"
            multiline
            rows={4}
            fullWidth
            value={modelDescription}
            onChange={(e) => setModelDescription(e.target.value)}
          />

          <Typography variant="caption">USDZ file for iOS (e.g., model.usdz)</Typography>
          <input
            type="file"
            accept=".usdz"
            onChange={handleUsdzFileChange}
          />

          <Typography variant="caption">
            GLTF/GLB file for Android (e.g., model.gltf, model.glb)
          </Typography>
          <input
            type="file"
            accept=".gltf, .glb"
            onChange={handleAndroidFileChange}
          />

          <Typography variant="caption">Image file for preview (e.g., thumbnail.jpg)</Typography>
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageFileChange}
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Image preview"
                style={{ maxWidth: '100%', maxHeight: 200, marginTop: 10 }}
              />
            )}
          </div>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="soft"
          onClick={handleUpload}
          disabled={!usdzFile || !androidFile || !imageFile || !modelName || !modelDescription}
        >
          Upload
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Upload3dDialog;
