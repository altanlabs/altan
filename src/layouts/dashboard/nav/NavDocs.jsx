// @mui
import { useLocales } from '@locales';
import { Stack, Button, Typography } from '@mui/material';

// auth
import { useAuthContext } from '../../../auth/useAuthContext';
// locales
import { CustomAvatar } from '../../../components/custom-avatar';
import Iconify from '../../../components/iconify/Iconify';

// ----------------------------------------------------------------------

export default function NavDocs() {
  const { user } = useAuthContext();

  const { translate } = useLocales();

  return (
    <Stack
      spacing={1}
      sx={{
        px: 5,
        pb: 5,
        mt: 5,
        width: 1,
        textAlign: 'center',
        alignItems: 'center',
      }}
    >
      <CustomAvatar
        sx={{ width: '50px', height: '50px' }}
        src={user?.photoURL}
        alt={user?.first_name}
        name={user?.first_name}
      />
      <div>
        <Typography
          gutterBottom
          variant="subtitle1"
        >
          {`${translate('docs.hi')}, ${user?.first_name}`}
        </Typography>

        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', whiteSpace: 'pre-line' }}
        >
          {`${translate('docs.description')}`}
        </Typography>
      </div>

      <Button
        startIcon={<Iconify icon="logos:discord-icon" />}
        href="https://discord.gg/2zPbKuukgx"
        target="_blank"
        rel="noopener"
        variant="soft"
        color="inherit"
        sx={{ ml: 0.5 }}
      >
        Discord
      </Button>

      <Button
        startIcon={<Iconify icon="oui:documentation" />}
        href="https://docs.altan.ai/"
        target="_blank"
        rel="noopener"
        variant="soft"
        sx={{ ml: 0.5 }}
      >
        {translate('docs.documentation')}
      </Button>

      {/* <Button startIcon={<Iconify icon="uil:feedback" />}
      href="https://app.altan.ai/form/c8699553-7c75-40fc-9942-d064143d3538" target="_blank" rel="noopener" variant="soft" color="secondary" sx={{ ml: .5 }}>
        {translate('docs.provide_feedback')}
      </Button>
      <Button startIcon={<Iconify icon="solar:bug-bold"/>}
        href='https://app.altan.ai/form/1c3c9a9b-27a6-4180-968d-d351da211b3c' target="_blank" rel="noopener" variant="soft" color="warning" sx={{ml:.5}}>
          {translate('docs.report_bug')}
        </Button> */}
      {/* <Button variant="soft">Upgrade plan</Button> */}
    </Stack>
  );
}
