import { Card, Avatar, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { memo } from 'react';
import { useHistory } from 'react-router';

UserMemberCard.propTypes = {
  member: PropTypes.object,
};

function UserMemberCard({ member }) {
  const history = useHistory();;
  const name = `${member?.person?.first_name} ${member.person?.last_name}`;
  const role = member?.role?.name || member?.role || 'Member';
  const userId = member?.id;
  const baseUrl = 'https://storage.googleapis.com/logos-chatbot-optimai/user/';
  const logoUrl = `${baseUrl}${userId}`;
  const avatarUrl = logoUrl;
  // const [openPopover, setOpenPopover] = useState(null);
  // const handleClosePopover = () => {
  //   setOpenPopover(null);
  // };

  // const handleDelete = () => {
  //   handleClosePopover();
  // };

  // const handleEdit = () => {
  //   handleClosePopover();
  // };

  const navigateToMember = () => {
    history.push(`/members/${member.id}`, { state: { type: 'human' } });
  };

  return (
    <>
      <Card
        onClick={navigateToMember}
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'transform 0.3s, box-shadow 0.3s',
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: 3,
          },
        }}
      >
        <Avatar
          alt={name}
          src={avatarUrl}
          sx={{ width: 60, height: 60, mb: 1 }}
        />
        <Typography
          variant="subtitle"
          sx={{ color: 'text.primary' }}
        >
          {name}
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary' }}
        >
          {role}
        </Typography>
      </Card>

      {/* <MenuPopover open={openPopover} onClose={handleClosePopover} arrow="right-top">
        <MenuItem onClick={handleEdit}>
          <Iconify icon="eva:edit-fill" />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Iconify icon="eva:trash-2-outline" />
          Delete
        </MenuItem>
      </MenuPopover> */}
    </>
  );
}

export default memo(UserMemberCard);
