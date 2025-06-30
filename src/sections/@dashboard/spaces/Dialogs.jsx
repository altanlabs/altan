import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Tooltip,
  Grid,
  Chip,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import Iconify from '../../../components/iconify';
import {
  deleteSpace,
  setDialogActive,
  setDialogHidden,
  setNavigationActive,
  upadateSpaceTranslations,
  updateSpace,
} from '../../../redux/slices/spaces.js';
import { dispatch } from '../../../redux/store.js';
import { PATH_DASHBOARD } from '../../../routes/paths.js';

export function RenameDialog({ isOpen, onClose, space }) {
  const dispatch = useDispatch();
  const [name, setName] = useState(space?.name || '');

  const handleRename = () => {
    if (space && space.id && name) {
      dispatch(updateSpace(space.id, name));
    }
    onClose();
  };

  const handleTextChange = (e) => {
    setName(e.target.value);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
    >
      <DialogTitle>Rename Space</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Space Name"
          sx={{ mt: 1 }}
          value={name}
          onChange={handleTextChange}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          color="error"
        >
          Cancel
        </Button>
        <Button
          onClick={handleRename}
          variant="soft"
        >
          Rename
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function TranslationsDialog({ isOpen, onClose, space }) {
  const [translations, setTranslations] = useState(space?.meta_data?.translations || {});
  const [newLang, setNewLang] = useState('');
  const [newTranslation, setNewTranslation] = useState('');
  const dispatch = useDispatch();

  const updateTranslation = (lang, value) => {
    setTranslations({ ...translations, [lang]: value });
  };

  const handleDeleteAllTranslations = () => {
    setTranslations({});
  };

  const handleSaveTranslations = () => {
    dispatch(upadateSpaceTranslations(space.id, { translations }));
    onClose();
  };

  const addNewTranslation = () => {
    if (newLang && newTranslation) {
      setTranslations({ ...translations, [newLang]: newTranslation });
      setNewLang('');
      setNewTranslation('');
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
    >
      <DialogTitle>Manage Translations</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Grid
            container
            spacing={1}
          >
            {Object.keys(translations).length > 1 &&
              Object.keys(translations).map((lang) => (
                <Grid
                  container
                  item
                  xs={12}
                  key={lang}
                >
                  <Grid
                    item
                    xs={4}
                  >
                    <Chip
                      label={lang}
                      size="large"
                      variant="soft"
                      color="info"
                      sx={{ mt: 1 }}
                    />
                  </Grid>
                  <Grid
                    item
                    xs={8}
                  >
                    <TextField
                      fullWidth
                      value={translations[lang]}
                      onChange={(e) => updateTranslation(lang, e.target.value)}
                    />
                  </Grid>
                </Grid>
              ))}
          </Grid>

          <Button
            fullWidth
            color="error"
            startIcon={<Iconify icon="ion:warning" />}
            onClick={handleDeleteAllTranslations}
          >
            Delete all translations
          </Button>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          color="error"
        >
          Cancel
        </Button>
        <Button
          variant="soft"
          onClick={handleSaveTranslations}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function DeleteDialog() {
  const history = useHistory();
  const { current, dialogs, spaces } = useSelector((state) => state.spaces);
  const { delete: deleteDialog } = dialogs;
  const onClose = () => dispatch(setDialogHidden('delete'));

  const handleDeleteCurrentSpace = () => {
    dispatch(deleteSpace(deleteDialog.current.id)).then(() => {
      onClose();
      if (deleteDialog.current.id === current.id)
        history.push(PATH_DASHBOARD.spaces.view(current.parent_id || 'root'));
      dispatch(setDialogHidden('settings'));
    });
  };

  return (
    <Dialog
      open={!!deleteDialog.active}
      onClose={onClose}
    >
      <DialogTitle>Are you sure you want to delete this space?</DialogTitle>
      <DialogContent>Deleting a space is an irreversible process.</DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          color="primary"
        >
          Cancel
        </Button>
        <Button
          onClick={handleDeleteCurrentSpace}
          color="error"
          variant="soft"
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function SettingsDialog() {
  const { current, dialogs, spaces } = useSelector((state) => state.spaces);
  const { settings } = dialogs;
  const [label, setLabel] = useState('');
  const [location, setLocation] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');

  useEffect(() => {
    if (settings.current?.type === 'space')
      setLabel(current.children?.items.find((s) => s.id === settings.current.id)?.name);
    else if (settings.current?.type === 'link')
      setLabel(current.links?.items.find((l) => l.id === settings.current.id)?.reference.name);
    else if (settings.current?.type === 'knowledge') {
      const file = current.knowledge?.items.find((f) => f.id === settings.current.id);
      setLabel(file?.meta_data?.name || file?.file.meta_data.file_name || '');
    } else setLabel('');
  }, [settings.current]);
  const onClose = () => dispatch(setDialogHidden('settings'));
  const onMoveTo = () => {
    const originSpace = !!spaces[settings.current.id]
      ? spaces[settings.current.id]
      : {
          parent: current.id !== 'root' ? current.id : null,
          ...current.children.spaces.find((s) => s.id === settings.current.id),
        };
    console.log(`SPACE in settings (${settings.current.id})`, originSpace);
    dispatch(setNavigationActive({ origin: originSpace, mode: 'move' }));
    onClose();
  };

  const title =
    !!settings.current &&
    settings.current.type.charAt(0).toUpperCase() + settings.current.type.slice(1);

  return (
    <Dialog
      open={!!settings.active}
      onClose={onClose}
      fullWidth
    >
      <DialogTitle> {title} Settings</DialogTitle>
      <DialogContent>
        <Stack
          spacing={2}
          padding={1}
        >
          {current.id !== 'root' && (
            <TextField
              fullWidth
              label={`${title} Label`}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          )}

          {/* <Autocomplete
                    sx={{ borderRadius: '10px', minWidth: '300px' }}
                    fullWidth
                    autoHighlight
                    options={languages}
                    getOptionLabel={(option) => option.label}
                    onChange={(event, newValue) => setSelectedLanguage(newValue)}
                    renderOption={(props, option) => (
                    <Box component="li" {...props} sx={{ px: '8px !important' }}>
                        <Box component="span" sx={{ flexShrink: 1, mr: 2, fontSize: 22 }}></Box>
                        {option.label}
                    </Box>
                    )}
                    renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Select Space Language"
                        inputProps={{
                        ...params.inputProps,
                        autoComplete: 'paragraph',
                        }}
                    />
                    )}
                ></Autocomplete> */}
          {settings.current?.type === 'space' && (
            <>
              <Button
                color="inherit"
                onClick={onMoveTo}
                variant="outlined"
                sx={{ height: 50, textTransform: 'none' }}
                endIcon={<Iconify icon="solar:move-to-folder-broken" />}
              >
                Move to
              </Button>
              <Tooltip
                title="Coming soon"
                arrow
              >
                <Stack width="100%">
                  <Button
                    color="inherit"
                    onClick={onClose}
                    variant="outlined"
                    sx={{ height: 50 }}
                    endIcon={<Iconify icon="ion:duplicate-outline" />}
                    disabled
                  >
                    Duplicate
                  </Button>
                </Stack>
              </Tooltip>
              <Button
                color="error"
                onClick={() =>
                  dispatch(
                    setDialogActive({
                      item: { id: settings.current.id, type: settings.current.type },
                      dialog: 'delete',
                    }),
                  )}
                variant="outlined"
                sx={{ height: 50, textTransform: 'none' }}
                endIcon={<Iconify icon="ic:twotone-delete" />}
              >
                Delete
              </Button>
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          color="error"
        >
          Cancel
        </Button>
        <Button
          variant="soft"
          color="success"
          onClick={() => {
            onSave({ label, location });
            onClose();
          }}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
