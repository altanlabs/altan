// @mui
import { Stack, Button } from '@mui/material';

// auth
import { useAuthContext } from '../../auth/useAuthContext.ts';
// components
import Iconify from '../../components/iconify';

// ----------------------------------------------------------------------

export default function AuthWithSocial({ invitation, idea }) {
  const { loginWithGoogle } = useAuthContext();

  const handleGoogleLogin = async () => {
    try {
      if (loginWithGoogle) {
        loginWithGoogle(invitation, idea);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Stack
      justifyContent="center"
      alignItems="center"
      spacing={2}
      sx={{ 
        width: '100%',
        maxWidth: { xs: '100%', sm: 400 },
      }}
    >
      <Button
        onClick={handleGoogleLogin}
        variant="contained"
        startIcon={
          <Iconify
            icon="flat-color-icons:google"
            width={20}
          />
        }
        sx={{
          color: 'black',
          backgroundColor: '#fff',
          textTransform: 'none',
          border: '1px solid #dadce0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          height: '48px',
          fontSize: '0.875rem',
          width: '100%',
          maxWidth: { xs: '280px', sm: '320px' },
          '&:hover': {
            backgroundColor: '#f8f9fa',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          },
        }}
        disabled={!!invitation}
      >
        Continue with Google
      </Button>

      {/* <Button onClick={handleFBLogin}
              size="large"
              variant="contained"
              disabled={true}
              startIcon={<Iconify icon="ic:baseline-facebook" width={22}/>}
              sx={{ color: 'white', textTransform: 'none', backgroundColor: "#4285F4",
              border: '1px solid black',
              '&:hover': {
                backgroundColor: '#4285F4',
                color: '#fff',
              }, }}
            >
              Continue with Facebook
          </Button> */}

      {/* <IconButton color="inherit" onClick={handleGithubLogin}>
        <Iconify icon="eva:github-fill" />
      </IconButton>

      <IconButton onClick={handleTwitterLogin}>
        <Iconify icon="eva:twitter-fill" color="#1C9CEA" />
      </IconButton> */}
    </Stack>
  );
}