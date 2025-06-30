import { TextField } from '@mui/material';
import { m } from 'framer-motion';
import { memo, useState } from 'react';

function CreateWithAI({ onChange, value, label = 'Describe the structure of your base' }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative p-px rounded-xl overflow-hidden w-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <m.div
        className="absolute inset-0 z-0 blur-sm"
        initial={{
          background:
            'radial-gradient(20.7% 50% at 50% 0%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)',
        }}
        animate={{
          background: hovered
            ? 'radial-gradient(75% 181.15% at 50% 50%, #3275F8 0%, rgba(255, 255, 255, 0) 100%)'
            : 'radial-gradient(20.7% 50% at 50% 0%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)',
        }}
        transition={{ ease: 'linear', duration: 0.3 }}
      />
      <div className="relative z-10 w-full">
        <TextField
          fullWidth
          multiline
          rows={4}
          size="small"
          placeholder={label}
          variant="outlined"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          sx={{
            width: '100%',
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              '.dark &': {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
              },
              '& fieldset': {
                borderColor: 'transparent',
              },
              '&:hover fieldset': {
                borderColor: 'transparent',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'transparent',
              },
            },
          }}
        />
      </div>
    </div>
  );
}

export default memo(CreateWithAI);
