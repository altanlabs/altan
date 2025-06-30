import {
  Button,
  Dialog,
  TextField,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  Box,
} from '@mui/material';
import { useState } from 'react';
import { useDispatch } from 'react-redux';

// ----------------------------------------------------------------------

const languages = [
  { code: 'AF', label: 'Afrikaans' },
  { code: 'AR', label: 'Arabic' },
  { code: 'BN', label: 'Bengali' },
  { code: 'ZH', label: 'Chinese' },
  { code: 'CS', label: 'Czech' },
  { code: 'CA', label: 'Catalan' },
  { code: 'DA', label: 'Danish' },
  { code: 'NL', label: 'Dutch' },
  { code: 'EN', label: 'English' },
  { code: 'FI', label: 'Finnish' },
  { code: 'FR', label: 'French' },
  { code: 'DE', label: 'German' },
  { code: 'EL', label: 'Greek' },
  { code: 'HE', label: 'Hebrew' },
  { code: 'HI', label: 'Hindi' },
  { code: 'HU', label: 'Hungarian' },
  { code: 'ID', label: 'Indonesian' },
  { code: 'IT', label: 'Italian' },
  { code: 'JA', label: 'Japanese' },
  { code: 'KO', label: 'Korean' },
  { code: 'MS', label: 'Malay' },
  { code: 'NO', label: 'Norwegian' },
  { code: 'FA', label: 'Persian' },
  { code: 'PL', label: 'Polish' },
  { code: 'PT', label: 'Portuguese' },
  { code: 'RU', label: 'Russian' },
  { code: 'ES', label: 'Spanish' },
  { code: 'SV', label: 'Swedish' },
  { code: 'TH', label: 'Thai' },
  { code: 'TR', label: 'Turkish' },
  { code: 'UK', label: 'Ukrainian' },
  { code: 'VI', label: 'Vietnamese' },
];

export default function TranslateDialog({ isHovered, text }) {
  const [open, setOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(null); // New state for selected language
  const dispatch = useDispatch();
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleTranslate = () => {
    dispatch(translateMsg(text, selectedLanguage['code']));
    setOpen(false);
  };

  return (
    <>
      <Button
        startIcon={
          <Iconify
            icon="bi:translate"
            style={{ width: '15px' }}
          />
        }
        disabled={viewOriginal}
      >
        Translate
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        sx={{ border: 'black', color: 'black', outline: 'none', backgroundColor: 'transparent' }}
      >
        <DialogTitle sx={{ outline: 'none', border: 'none' }}>
          {' '}
          <Iconify
            icon={'bi:translate'}
            width={'15px'}
          />{' '}
          Translate
        </DialogTitle>
        <DialogContent>
          <Autocomplete
            sx={{ border: '1px solid white', borderRadius: '10px', minWidth: '300px', mt: 1 }}
            fullWidth
            autoHighlight
            options={languages}
            getOptionLabel={(option) => option.label}
            onChange={(event, newValue) => setSelectedLanguage(newValue)}
            renderOption={(props, option) => (
              <Box
                component="li"
                {...props}
                sx={{ px: '8px !important' }}
              >
                <Box
                  component="span"
                  sx={{ flexShrink: 0, mr: 2, fontSize: 22 }}
                >
                </Box>
                {option.label}
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Target Language"
                inputProps={{
                  ...params.inputProps,
                  autoComplete: 'paragraph',
                }}
              />
            )}
          >
          </Autocomplete>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            onClick={handleTranslate}
            variant="contained"
          >
            Translate
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
