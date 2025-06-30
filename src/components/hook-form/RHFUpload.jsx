import { FormHelperText, IconButton, Tooltip } from '@mui/material';
import PropTypes from 'prop-types';
// form
import { useFormContext, Controller } from 'react-hook-form';

// @mui
//
import Iconify from '../iconify';
import { UploadAvatar, Upload, UploadBox } from '../upload';

// ----------------------------------------------------------------------

RHFUploadAvatar.propTypes = {
  name: PropTypes.string,
};

// ----------------------------------------------------------------------

export function RHFUploadAvatar({ name, onEdit = null, editConfig = null, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div
          style={{
            position: 'relative',
            width: 'min-content',
          }}
        >
          <UploadAvatar
            accept={{
              'image/*': [],
            }}
            error={!!error}
            file={field.value}
            {...other}
          />
          {!!onEdit && (
            <Tooltip
              title={editConfig?.tooltip || 'Edit'}
              followCursor
              arrow
            >
              <IconButton
                onClick={onEdit}
                sx={{
                  position: 'absolute',
                  right: -15,
                  top: -15,
                }}
                children={
                  <Iconify
                    sx={{
                      pointerEvents: 'none',
                    }}
                    icon={editConfig?.icon || 'line-md:edit'}
                    width={editConfig?.iconWidth || 30}
                  />
                }
              />
            </Tooltip>
          )}

          {!!error && (
            <FormHelperText
              error
              sx={{ px: 2, textAlign: 'center' }}
            >
              {error.message}
            </FormHelperText>
          )}
        </div>
      )}
    />
  );
}

// ----------------------------------------------------------------------

RHFUploadBox.propTypes = {
  name: PropTypes.string,
};

export function RHFUploadBox({ name, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <UploadBox
          files={field.value}
          error={!!error}
          {...other}
        />
      )}
    />
  );
}

// ----------------------------------------------------------------------

RHFUpload.propTypes = {
  name: PropTypes.string,
  multiple: PropTypes.bool,
  helperText: PropTypes.node,
  images: PropTypes.bool,
};

export function RHFUpload({ name, multiple, helperText, images = false, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) =>
        multiple ? (
          <Upload
            multiple
            accept={{ 'image/*': [] }}
            files={field.value}
            error={!!error}
            helperText={
              (!!error || helperText) && (
                <FormHelperText
                  error={!!error}
                  sx={{ px: 2 }}
                >
                  {error ? error?.message : helperText}
                </FormHelperText>
              )
            }
            {...other}
          />
        ) : (
          <Upload
            accept={{ 'image/*': [] }}
            file={field.value}
            error={!!error}
            helperText={
              (!!error || helperText) && (
                <FormHelperText
                  error={!!error}
                  sx={{ px: 2 }}
                >
                  {error ? error?.message : helperText}
                </FormHelperText>
              )
            }
            {...other}
          />
        )}
    />
  );
}
