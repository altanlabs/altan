// @mui
import { Stack, Button } from '@mui/material';

// auth
import { useAuthContext } from '../../auth/useAuthContext';
// components
import Iconify from '../../components/iconify';

// ----------------------------------------------------------------------

export default function AuthWithSocial({ invitation }) {
  const { loginWithGoogle } = useAuthContext();

  const handleGoogleLogin = async () => {
    try {
      if (loginWithGoogle) {
        loginWithGoogle(invitation?.id);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Stack
      justifyContent="center"
      spacing={2}
      sx={{ minWidth: 300 }}
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

// const handleGithubLogin = async () => {
//   try {
//     if (loginWithGithub) {
//       loginWithGithub();
//     }
//     console.log('GITHUB LOGIN');
//   } catch (error) {
//     console.error(error);
//   }
// };

// const handleTwitterLogin = async () => {
//   try {
//     if (loginWithTwitter) {
//       loginWithTwitter();
//     }
//     console.log('TWITTER LOGIN');
//   } catch (error) {
//     console.error(error);
//   }
// };

// const handleFBLogin = () => {
//   FB.login(function (response) {
//     if (response.authResponse) {
//       // User has successfully authenticated
//       // Send token to your server for verification
//       const token = response.authResponse.accessToken;

//       // TODO: send `token` to your server for verification and user registration

//       console.log('You are logged in.', response);
//     } else {
//       console.log('User cancelled login or did not fully authorize.');
//     }
//   });
// };
