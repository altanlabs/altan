import {
  // Button, ButtonGroup, Dialog, DialogTitle, DialogActions,
  Typography,
} from '@mui/material';
import { memo, useMemo } from 'react';
import { useParams } from 'react-router';

import AltanLogo from '../../components/loaders/AltanLogo';
import EditAgent from '../../components/members/EditAgent';
import EditOrgUser from '../../components/members/EditOrgUser';
import { CompactLayout } from '../../layouts/dashboard';
import { useSelector } from '../../redux/store';
// import { PATH_DASHBOARD } from '../../routes/paths';

// import Iconify from '../../components/iconify/Iconify';
// import { dispatch } from '../../redux/store';
// import { publishAgent } from '../../redux/slices/general';
// import LoadingFallback from '../../components/LoadingFallback';

// ----------------------------------------------------------------------

// const MemberActions = ({ memberType, member }) => {
//   const history = useHistory();;
//   const [open, setOpen] = useState(false);

//   const handleSendDm = () => {
//     window.open(`https://app.altan.ai?dm=${member.id}`, '_blank');
//   };

//   const handleTemplate = () => {
//     if (member?.templates?.items?.length) {
//       setOpen(true);
//     } else {
//       const data = {
//         "id": member.id
//       };
//       dispatch(publishAgent(data)).then(() => {
//         window.location.reload();
//       }).catch((error) => {
//         alert(`Error: ${error}`);
//       });
//     }
//   };

//   // const handleClose = () => {
//   //   setOpen(false);
//   // };

//   return (
//     <>
//       <ButtonGroup variant='soft'>
//         <Button onClick={handleSendDm} startIcon={<Iconify icon="streamline:mail-send-email-message-solid" />}>Direct Message</Button>
//         {memberType === 'agent' &&
//           <Button startIcon={<Iconify icon="icon-park-twotone:gate" />} color="secondary" onClick={() => history.push(`/conversations/gates?agent=${member.id}`)}>
//         Create Gate
//         </Button>}
//         {memberType === 'agent' &&
//           <Button onClick={handleTemplate} startIcon={<Iconify icon="solar:money-bag-bold" />} color="info">
//             {member?.templates?.items?.length ? "View Template" : "Publish marketplace"}
//           </Button>}
//       </ButtonGroup>
//       {/* {open && <TemplateDialog templates={member.templates.items} onClose={handleClose} mode="agent"/>} */}
//     </>
//   );
// };

// ----------------------------------------------------------------------

const getAccInit = (attr) => (state) => state.general.accountAssetsInitialized[attr];
const selectInitialized = (state) => getAccInit('members')(state) && getAccInit('agents')(state);
const selectMembers = (state) => state.general.account?.members;
const selectAgents = (state) => state.general.account?.agents;

function MemberPage() {
  const { memberId } = useParams();
  const members = useSelector(selectMembers);
  const agents = useSelector(selectAgents);
  const initialized = useSelector(selectInitialized);

  const { member, memberType } = useMemo(() => {
    if (!memberId || (!members && !agents)) {
      return { member: null, memberType: null };
    }

    const finding = [...(members || []), ...(agents || [])].find(
      (m) => m?.id?.toString() === memberId?.toString(),
    );
    return {
      member: finding,
      memberType: finding?.member?.member_type || 'user',
    };
  }, [agents, memberId, members]);

  const name = useMemo(
    () =>
      !!member && member.name
        ? member.name
        : `${member?.meta_data?.first_name || ''} ${member?.meta_data?.last_name || ''}`.trim(),
    [member],
  );

  console.log('initialized', initialized);
  return (
    <CompactLayout
      title={`${name} · Altan`}
      noPadding
      // toolbarChildren={
      //   !!member && <MemberActions memberType={memberType} member={member} />
      // }
      // breadcrumb={!!member && {
      //   title: name,
      //   links: [
      //     {
      //       name: memberType !== 'agent' ? "Team" : "Agents",
      //       href: memberType !== 'agent' ? PATH_DASHBOARD.members.root : "/agents",
      //     },
      //     { name: name }
      //   ]
      // }}
    >
      {!initialized ? (
        <AltanLogo wrapped />
      ) : !member ? (
        <Typography>Member not found</Typography>
      ) : (
        <>{memberType === 'agent' ? <EditAgent agent={member} /> : <EditOrgUser user={member} />}</>
      )}
    </CompactLayout>
  );
}

export default memo(MemberPage);
