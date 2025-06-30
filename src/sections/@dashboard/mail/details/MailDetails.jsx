import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
// @mui

// components
import MailDetailsAttachments from './MailDetailsAttachments';
import MailDetailsReplyInput from './MailDetailsReplyInput';
import Markdown from '../../../../components/markdown';
import Scrollbar from '../../../../components/scrollbar';
//

// ----------------------------------------------------------------------

const StyledMarkdown = styled('div')(({ theme }) => ({
  '& > p': {
    ...theme.typography.body1,
    marginBottom: theme.spacing(2),
  },
}));

// ----------------------------------------------------------------------

MailDetails.propTypes = {
  attachments: PropTypes.array,
  message: PropTypes.string,
  subject: PropTypes.string,
};

export default function MailDetails({ subject, message, attachments }) {
  return (
    <>
      <Scrollbar>
        <Box
          sx={{
            p: { xs: 3, md: 5 },
          }}
        >
          <Typography
            variant="h3"
            gutterBottom
          >
            {subject}
          </Typography>

          <StyledMarkdown>
            <Markdown children={message} />
          </StyledMarkdown>
        </Box>
      </Scrollbar>

      {!!attachments.length && <MailDetailsAttachments attachments={attachments} />}

      <MailDetailsReplyInput />
    </>
  );
}
