import { LoadingButton } from '@mui/lab';
import {
  Card,
  Stack,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Box,
  Typography,
  Divider,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { categoryOptions } from './categoryOptions';
import { featureOptions } from './featureOptions';
import { useCaseOptions } from './useCaseOptions';
import { verticalOptions } from './verticalOptions';
import { selectIsAccountFree } from '../../../../../../redux/slices/general';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const DistributionForm = ({ template, onSave, isSubmitting }) => {
  const history = useHistory();
  const isAccountFree = useSelector(selectIsAccountFree);

  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    price: template?.price || 0,
    category: template?.meta_data?.category || '',
    verticals: template?.meta_data?.verticals || [],
    useCases: template?.meta_data?.useCases || [],
    features: template?.meta_data?.features || [],
    department: template?.meta_data?.department || '',
    isPrivate: template?.isPrivate || false,
  });
  const [priceDigits, setPriceDigits] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  useEffect(() => {
    const initialPrice = template?.price;
    if (typeof initialPrice === 'number') {
      setPriceDigits(String(initialPrice));
    } else {
      setPriceDigits('');
    }
  }, [template?.price]);

  const handleChange = (field) => (event) => {
    if (field === 'price') {
      const newDigit = event.target.value.replace(/[^0-9]/g, '').slice(-1);
      if (!newDigit && newDigit !== '0') return;

      const newPriceDigits = (priceDigits + newDigit).slice(-10);
      setPriceDigits(newPriceDigits);

      const cents = parseInt(newPriceDigits || '0', 10);
      setFormData((prev) => ({
        ...prev,
        price: cents,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    }
    setIsDirty(true);
  };

  const handleKeyDown = (event) => {
    const field = event.target.name;
    if (event.key === 'Backspace') {
      event.preventDefault();
      if (field === 'price') {
        const newPriceDigits = priceDigits.slice(0, -1);
        setPriceDigits(newPriceDigits);
        const cents = parseInt(newPriceDigits || '0', 10);
        setFormData((prev) => ({
          ...prev,
          price: cents,
        }));
      }
      setIsDirty(true);
    }
  };

  const handlePrivacyToggle = () => {
    if (isAccountFree) {
      setShowUpgradeDialog(true);
    } else {
      setFormData((prev) => ({
        ...prev,
        isPrivate: !prev.isPrivate,
      }));
      setIsDirty(true);
    }
  };

  const handleUpgradeDialogClose = () => {
    setShowUpgradeDialog(false);
  };

  const handleGoToPricing = () => {
            history.push('/pricing');
    setShowUpgradeDialog(false);
  };

  const formatPriceDisplay = (digits) => {
    if (!digits) return '0.00';
    const padded = digits.padStart(3, '0');
    const dollars = padded.slice(0, -2);
    const cents = padded.slice(-2);
    const formattedDollars = dollars.replace(/\B(?=(\d{3})+(?!\d))/g, ',') || '0';
    return `${formattedDollars}.${cents}`;
  };

  const handleSave = () => {
    const formattedData = {
      name: formData.name,
      description: formData.description,
      price: formData.price,
      category: formData.category, // Category should be top-level, not in meta_data
      meta_data: {
        verticals: formData.verticals,
        useCases: formData.useCases,
        features: formData.features,
        department: formData.department,
        isPrivate: formData.isPrivate,
      },
    };
    onSave(formattedData);
    setIsDirty(false);
  };

  return (
    <Card
      sx={{
        p: 2,
        borderRadius: 1,
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.800' : 'white'),
        border: '1px solid',
        borderColor: (theme) => (theme.palette.mode === 'dark' ? 'grey.700' : 'grey.200'),
      }}
    >
      <Stack spacing={3}>
        <Box>
          <Typography
            variant="subtitle2"
            sx={{ mb: 2 }}
          >
            Basic Information
          </Typography>
          <Stack spacing={2}>
            <TextField
              fullWidth
              size="small"
              variant="filled"
              label="Public Name"
              name="name"
              value={formData.name}
              onChange={handleChange('name')}
              helperText="The public name of your template that will appear in the marketplace"
            />
            <TextField
              fullWidth
              size="small"
              variant="filled"
              multiline
              rows={3}
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange('description')}
              helperText="Describe what your template does and why it's valuable"
            />
          </Stack>
        </Box>

        <Divider />

        <Box>
          <Typography
            variant="subtitle2"
            sx={{ mb: 2 }}
          >
            License
          </Typography>
          <Stack spacing={2}>
            <TextField
              fullWidth
              size="small"
              variant="filled"
              label="Template Price"
              name="price"
              value={`$${formatPriceDisplay(priceDigits)}`}
              onChange={handleChange('price')}
              onKeyDown={handleKeyDown}
              inputProps={{
                inputMode: 'numeric',
                pattern: '[0-9]*',
              }}
              sx={{
                '& input': {
                  fontFamily: 'monospace',
                  letterSpacing: '0.1em',
                },
              }}
            />
          </Stack>
        </Box>

        <Divider />

        <Box>
          <Typography
            variant="subtitle2"
            sx={{ mb: 2 }}
          >
            Categories
          </Typography>
          <Stack spacing={2}>
            <FormControl
              variant="filled"
              size="small"
              fullWidth
            >
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                onChange={handleChange('category')}
                MenuProps={MenuProps}
              >
                {categoryOptions.map((option) => (
                  <MenuItem
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl
              variant="filled"
              size="small"
              fullWidth
            >
              <InputLabel>Industry/Vertical</InputLabel>
              <Select
                multiple
                value={formData.verticals}
                onChange={handleChange('verticals')}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const option = verticalOptions.find((opt) => opt.value === value);
                      return (
                        <Chip
                          key={value}
                          label={option?.label || value}
                          size="small"
                        />
                      );
                    })}
                  </Box>
                )}
                MenuProps={MenuProps}
              >
                {verticalOptions.map((option) => (
                  <MenuItem
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl
              variant="filled"
              size="small"
              fullWidth
            >
              <InputLabel>Use Cases</InputLabel>
              <Select
                multiple
                value={formData.useCases}
                onChange={handleChange('useCases')}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const option = useCaseOptions.find((opt) => opt.value === value);
                      return (
                        <Chip
                          key={value}
                          label={option?.label || value}
                          size="small"
                        />
                      );
                    })}
                  </Box>
                )}
                MenuProps={MenuProps}
              >
                {useCaseOptions.map((option) => (
                  <MenuItem
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl
              variant="filled"
              size="small"
              fullWidth
            >
              <InputLabel>Key Features</InputLabel>
              <Select
                multiple
                value={formData.features}
                onChange={handleChange('features')}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const option = featureOptions.find((opt) => opt.value === value);
                      return (
                        <Chip
                          key={value}
                          label={option?.label || value}
                          size="small"
                        />
                      );
                    })}
                  </Box>
                )}
                MenuProps={MenuProps}
              >
                {featureOptions.map((option) => (
                  <MenuItem
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              size="small"
              variant="filled"
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleChange('department')}
              helperText="Select the department this template is most relevant for"
              select
            >
              {[
                'Accounting',
                'Business Development',
                'Customer Service',
                'Engineering',
                'Finance',
                'Human Resources',
                'Information Technology',
                'Legal',
                'Marketing',
                'Operations',
                'Product Management',
                'Research and Development',
                'Sales',
                'Support',
                'Other',
              ].map((dept) => (
                <MenuItem
                  key={dept}
                  value={dept}
                >
                  {dept}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </Box>

        <LoadingButton
          fullWidth
          variant="contained"
          color="primary"
          onClick={handleSave}
          loading={isSubmitting}
          disabled={!isDirty}
          sx={{ alignSelf: 'flex-end' }}
        >
          Save Changes
        </LoadingButton>
      </Stack>

      <Dialog
        open={showUpgradeDialog}
        onClose={handleUpgradeDialogClose}
        aria-labelledby="upgrade-dialog-title"
        aria-describedby="upgrade-dialog-description"
      >
        <DialogTitle id="upgrade-dialog-title">Upgrade Required</DialogTitle>
        <DialogContent>
          <Typography id="upgrade-dialog-description">
            To make your template private, you need to upgrade your account.
            This will allow you to set your own pricing and make your templates
            available for purchase by other users.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUpgradeDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleGoToPricing} color="primary" variant="contained">
            Go to Pricing
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default DistributionForm;
