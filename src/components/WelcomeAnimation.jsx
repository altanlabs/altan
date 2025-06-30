import { Box, Typography, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';

export default function WelcomeAnimation({ big = false }) {
  const theme = useTheme();
  const [index, setIndex] = useState(0);
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const welcomes = [
    'Welcome',
    'Bienvenido',
    'Bienvenue',
    'Willkommen',
    'Benvenuto',
    '欢迎',
    '歡迎',
    'ようこそ',
    '환영합니다',
    'Добро пожаловать',
  ];

  useEffect(() => {
    const typingSpeed = 150;
    const deletingSpeed = 100;
    let timeout;

    if (!isDeleting) {
      timeout = setTimeout(() => {
        setText(welcomes[index].substring(0, text.length + 1));
        if (text === welcomes[index]) {
          setTimeout(() => setIsDeleting(true), 1000);
        }
      }, typingSpeed);
    } else {
      timeout = setTimeout(() => {
        setText(welcomes[index].substring(0, text.length - 1));
        if (text.length === 0) {
          setIsDeleting(false);
          setIndex((prevIndex) => (prevIndex + 1) % welcomes.length);
        }
      }, deletingSpeed);
    }

    return () => clearTimeout(timeout);
  }, [text, index, isDeleting]);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        minHeight: '56px',
      }}
    >
      <Typography
        variant={big ? 'h1' : 'h3'}
        sx={{ mb: 2, whiteSpace: 'pre' }}
      >
        {text}

        {/* <span
          style={{
            display: 'inline-block',
            marginLeft: '5px',
            width: "20px",
            height: "20px",
            borderRadius: '50%',
            backgroundColor: theme.palette.mode == 'light' ? '#000': '#FFF',
            animation: 'blink 1s step-start 0s infinite'
          }}
        /> */}
      </Typography>
    </Box>
  );
}
