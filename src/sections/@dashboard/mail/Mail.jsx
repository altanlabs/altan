import { Container, Card, Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

// @mui
// redux
import MailDetails from './details/MailDetails';
import MailHeader from './header/MailHeader';
import MailHeaderDetails from './header/MailHeaderDetails';
import MailList from './list/MailList';
import MailComposePortal from './MailComposePortal';
import MailNav from './nav/MailNav';
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs';
import { useSettingsContext } from '../../../components/settings';
import { getMail, getLabels, getMails } from '../../../redux/slices/mail';
import { useDispatch, useSelector } from '../../../redux/store';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// components
// sections

// ----------------------------------------------------------------------

export default function Mail() {
  const { themeStretch } = useSettingsContext();

  const dispatch = useDispatch();

  const params = useParams();

  const { mailId = '' } = params;

  const { mails, labels, isLoading } = useSelector((state) => state.mail);

  const mail = useSelector((state) => state.mail.mails.byId[mailId]);

  const [dense, setDense] = useState(false);

  const [openNav, setOpenNav] = useState(false);

  const [openCompose, setOpenCompose] = useState(false);

  const [selectedMails, setSelectedMails] = useState([]);

  useEffect(() => {
    dispatch(getMails(params));
  }, [dispatch, params]);

  useEffect(() => {
    if (mailId) {
      dispatch(getMail(mailId));
    }
  }, [dispatch, mailId]);

  useEffect(() => {
    dispatch(getLabels());
  }, [dispatch]);

  useEffect(() => {
    if (openCompose) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [openCompose]);

  const handleToggleDense = () => {
    setDense(!dense);
  };

  const handleOpenNav = () => {
    setOpenNav(true);
  };

  const handleCloseNav = () => {
    setOpenNav(false);
  };

  const handleOpenCompose = () => {
    setOpenCompose(true);
  };

  const handleCloseCompose = () => {
    setOpenCompose(false);
  };

  const handleSelectMail = (selectedMailId) => {
    setSelectedMails((mailIds) => {
      if (!mailIds.includes(selectedMailId)) {
        return [...mailIds, selectedMailId];
      }
      return mailIds;
    });
  };

  const handleSelectAllMails = () => {
    setSelectedMails(mails.allIds.map((id) => id));
  };

  const handleDeselectMail = (selectedMailId) => {
    setSelectedMails((selected) => selected.filter((id) => id !== selectedMailId));
  };

  const handleDeselectAllMails = () => {
    setSelectedMails([]);
  };

  return (
    <>
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <CustomBreadcrumbs
          heading="Mail"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.general.dashboard,
            },
            { name: 'Mail' },
          ]}
        />
        <Card
          sx={{
            height: { md: '72vh' },
            display: { md: 'flex' },
          }}
        >
          <MailNav
            items={labels}
            openNav={openNav}
            onCloseNav={handleCloseNav}
            onOpenCompose={handleOpenCompose}
          />

          <Stack
            flexGrow={1}
            sx={{ overflow: 'hidden' }}
          >
            {mail ? (
              <>
                <MailHeaderDetails
                  mailFrom={mail.from}
                  mailTo={mail.to}
                  createdAt={mail.createdAt}
                />
                <MailDetails
                  subject={mail.subject}
                  message={mail.message}
                  attachments={mail.attachments}
                />
              </>
            ) : (
              <>
                <MailHeader
                  onOpenNav={handleOpenNav}
                  mailsLength={mails.allIds.length}
                  selectedMailsLength={selectedMails.length}
                  onSelectAllMails={handleSelectAllMails}
                  onDeselectAllMails={handleDeselectAllMails}
                  onToggleDense={handleToggleDense}
                />
                <MailList
                  dense={dense}
                  mails={mails}
                  labels={labels}
                  onSelectMail={(id) => handleSelectMail(id)}
                  onDeselectMail={(id) => handleDeselectMail(id)}
                  selectedMails={(id) => selectedMails.includes(id)}
                  isLoading={isLoading}
                  isEmpty={!mails.allIds.length && !isLoading}
                />
              </>
            )}
          </Stack>
        </Card>
      </Container>

      {openCompose && <MailComposePortal onCloseCompose={handleCloseCompose} />}
    </>
  );
}
