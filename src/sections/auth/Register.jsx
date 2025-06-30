import { Stack, Typography, Link, Card, CardHeader, Container, Avatar } from '@mui/material';
import { blue } from '@mui/material/colors';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

// @mui
// layouts
import AuthRegisterForm from './AuthRegisterForm';
import AuthWithSocial from './AuthWithSocial';
import IconRenderer from '../../components/icons/IconRenderer';
import Logo from '../../components/logo/Logo';
// routes
import { PATH_AUTH } from '../../routes/paths';
//
import { optimai } from '../../utils/axios';

// ----------------------------------------------------------------------

const InvitationCard = ({ invitation }) => {
  const orgName = invitation?.company?.name || invitation?.account?.meta_data?.name;

  return (
    <Card
      elevation={3}
      sx={{
        position: 'fixed',
        top: 0,
        p: 0,
        right: 10,
        maxWidth: 400,
        margin: '16px auto',
      }}
    >
      <CardHeader
        sx={{
          p: 1,
        }}
        avatar={
          invitation?.company ? (
            <img
              style={{ height: '60px', width: '60px', borderRadius: '50%' }}
              src={invitation.company.logo_url}
              alt="organisation logo"
            />
          ) : (
            <Avatar style={{ backgroundColor: blue[500] }}>
              <IconRenderer icon="optimai" />
            </Avatar>
          )
        }
        title={`🎉 You've been invited to join ${orgName}.`}
      />
    </Card>
  );
};

const getUrlParameter = (name) => {
  const escapedName = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  const regex = new RegExp('[\\?&]' + escapedName + '=([^&#]*)');
  const results = regex.exec(window.location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

export const getInvitationInfo = async (invitationId) => {
  try {
    const response = await optimai.get(`/org/invitation/${invitationId}/`);
    const { invitation } = response.data;
    return Promise.resolve(invitation);
  } catch (e) {
    return Promise.reject(e);
  } finally {
  }
};

export default function Register() {
  const [invitation, setInvitation] = useState(null);
  const [idea, setIdea] = useState(null);

  useEffect(() => {
    const invitationId = getUrlParameter('iid');
    const idea_id = getUrlParameter('idea');
    setIdea(idea_id);

    // Fetch invitation details if iid is present
    if (invitationId) {
      getInvitationInfo(invitationId).then((res) => {
        setInvitation(res);
        // If invitation has expired or reached limit, redirect to error page
        if (res.error) {
          window.location.href = res.url;
        }
      });
    }
  }, []);

  return (
    <Container
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      }}
    >
      <Stack
        justifyContent="center"
        alignItems="center"
        spacing={2}
        sx={{
          width: '100%',
        }}
      >
        <Logo
          sx={{
            zIndex: 9,
            ml: 2,
            pt: 1,
          }}
        />
        <Typography variant="h3">Welcome to Altan</Typography>

        <Typography variant="body2">Get started absolutely free.</Typography>

        {/* Google Auth first */}
        <AuthWithSocial
          invitation={invitation}
          idea={idea}
        />

        {/* Registration form */}
        <AuthRegisterForm
          invitation={invitation}
          idea={idea}
        />

        <Stack
          direction="row"
          spacing={0.5}
          sx={{ mb: 1 }}
        >
          <Typography variant="body2"> Already have an account? </Typography>
          <Link
            component={RouterLink}
            to={`${PATH_AUTH.login}${window.location.search}`}
            variant="subtitle2"
          >
            Sign in
          </Link>
        </Stack>

        {!!invitation && <InvitationCard invitation={invitation} />}
        <Typography
          component="div"
          sx={{ color: 'text.secondary', mt: 2, typography: 'caption', textAlign: 'center' }}
        >
          {'By signing up, I agree to '}
          <Link
            underline="always"
            color="text.primary"
            href="https://altan.ai/terms"
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms of Service
          </Link>
          {' and '}
          <Link
            underline="always"
            color="text.primary"
            href="https://altan.ai/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy
          </Link>
          .
        </Typography>
      </Stack>
    </Container>
  );
}
