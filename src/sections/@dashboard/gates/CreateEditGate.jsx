import { LoadingButton } from '@mui/lab';
import {
  Stack,
  Card,
  ButtonGroup,
} from '@mui/material';
import { capitalize } from 'lodash';
import { useState, useCallback, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useSelector } from 'react-redux';

import { RHFSelect, RHFTextField } from '@components/hook-form';

import AgentAutocomplete from '../../../components/AgentAutocomplete';
import InfoModal from '../../../components/helpers/InfoModal';
import Iconify from '../../../components/iconify/Iconify';
import useFeedbackDispatch from '../../../hooks/useFeedbackDispatch';
import { createGate, editGate } from '../../../redux/slices/gates';
import { bgBlur } from '../../../utils/cssStyles';
import { uploadMedia } from '../../../utils/media';

const statusOptions = ['opened', 'closed', 'filtered'];

const personAttributes = [
  'nickname',
  'first_name',
  'last_name',
  'emails',
  'phones',
  'addresses',
  'socials',
  'employment',
  'avatar_url',
];

const PRIVACY_ENUM = [
  {
    label: 'Private',
    description: '',
    value: 'private',
  },
  {
    label: 'Team',
    description: '',
    value: 'team',
  },
  {
    label: 'Department',
    description: '',
    value: 'department',
  },
  {
    label: 'Account',
    description: '',
    value: 'account',
  },
  {
    label: 'Public',
    description: '',
    value: 'public',
  },
];

const MEMBER_ROLES = [
  {
    label: 'Owner',
    description: '',
    value: 'owner',
  },
  {
    label: 'Admin',
    description: '',
    value: 'admin',
  },
  {
    label: 'Member',
    description: '',
    value: 'member',
  },
  {
    label: 'Listener',
    description: '',
    value: 'listener',
  },
  {
    label: 'Viewer',
    description: '',
    value: 'viewer',
  },
];

const AGENT_INTERACTION_ENUM = [
  {
    label: 'Mention Only',
    description: '',
    value: 'mention_only',
  },
  {
    label: 'Agents Only',
    description: '',
    value: 'agents_only',
  },
  {
    label: 'Always',
    description: '',
    value: 'always',
  },
];

const roomPolicyFields = [
  {
    title: 'Privacy',
    icon: '',
    description: 'Define who should have access to the Room.',
    key: 'policy.privacy',
    options: PRIVACY_ENUM,
  },
  {
    title: 'Default Role',
    icon: '',
    description: 'Define the default role for any new Room Member invited to the Room.',
    key: 'policy.default_role',
    options: MEMBER_ROLES,
  },
  {
    title: 'Max members',
    description: 'Set the maximum amoun of members of the room (-1 for unlimited)',
    icon: '',
    key: 'policy.max_members',
  },
  {
    title: 'AIgent Interaction',
    description: 'Define when the AIgent should engage in the Room.',
    icon: '',
    key: 'policy.agent_interaction',
    options: AGENT_INTERACTION_ENUM,
  },
  {
    title: 'AIgent Timeout',
    description: 'Set the minimum time between AIgent interactions in the same Thread.',
    icon: '',
    key: 'policy.agent_timeout',
  },
];

const extractBackgroundUrl = (background) => {
  const match = background.match(/url:(https?.*?)(?="|$)/);
  return match ? match[1] : null;
};

export default function CreateEditGate({ gate, handleClose }) {
  const { account, initialized } = useSelector((state) => state.general);
  const [avatarSrc, setAvatarSrc] = useState(
    (gate?.background && extractBackgroundUrl(gate.background)) || null,
  );
  const [avatarFile, setAvatarFile] = useState(null);
  const agents = account?.agents || [];
  const isNewGate = !gate;
  const [dispatchWithFeedback, isSubmitting] = useFeedbackDispatch();
  const methods = useForm({
    defaultValues: {
      name: isNewGate ? 'New gate' : gate.name,
      agent_id: isNewGate ? null : gate?.agent_id,
      status: isNewGate ? 'opened' : gate.status,
      admin_room_id: isNewGate ? null : gate?.admin_room_id,
      enable_shop: isNewGate ? true : gate?.meta_data?.enable_shop,
      enable_contact: isNewGate ? true : gate?.meta_data?.enable_contact,
      policy: isNewGate
        ? {
            privacy: 'public',
            default_role: 'member',
            max_members: -1,
            agent_interaction: 'always',
            agent_timeout: 1,
            requirements: [],
          }
        : {
            privacy: gate?.policy?.privacy || 'public',
            default_role: gate?.policy?.default_role || 'member',
            max_members: gate?.policy?.max_members || -1,
            agent_interaction: gate?.policy?.agent_interaction || 'always',
            agent_timeout: gate?.policy?.agent_timeout || 1,
            requirements: gate?.policy?.requirements?.data || [],
          },
    },
  });

  const { watch, setValue, handleSubmit } = methods;
  // const agent_id = agents?.find(agent => agent.id === watch("agent_id")) || null;
  const agent_id = watch('agent_id');
  const onSubmit = async () => {
    const data = watch();
    const completeData = {
      name: data.name,
      agent_id: data.agent_id,
      status: data.status,
      background: avatarSrc,
      meta_data: {
        enable_shop: data.enable_shop,
        enable_contact: data.enable_contact,
      },
      policy: {
        privacy: data.policy?.privacy || 'public',
        default_role: data?.policy?.default_role || 'member',
        max_members: data?.policy?.max_members || -1,
        agent_interaction: data?.policy?.agent_interaction || 'always',
        agent_timeout: data?.policy?.agent_timeout || 3,
        requirements: { data: data?.policy?.requirements },
      },
    };
    if (!!avatarFile) {
      await uploadMedia(avatarFile).then((mediaUrl) => {
        completeData.background = `url:${mediaUrl}`;
      });
    }
    dispatchWithFeedback(isNewGate ? createGate(completeData) : editGate(completeData, gate.id), {
      successMessage: `Gate ${isNewGate ? 'created' : 'updated'} successfully`,
      errorMessage: `There was an error ${isNewGate ? 'creating' : 'updating'} the gate: `,
      useSnackbar: true,
      useConsole: true,
    }).then(() => {
      handleClose();
    });
  };

  const handleDropSingleFile = useCallback(
    (acceptedFiles, value) => {
      const file = acceptedFiles[0];
      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });
      if (newFile) {
        setValue(value, newFile, { shouldValidate: true });
        setAvatarFile(file);
        setAvatarSrc(file.preview);
      }
    },
    [setValue],
  );

  const selectedRequirements = watch('policy.requirements');

  // Use useMemo to filter out already selected options dynamically
  const availableOptions = useMemo(() => {
    return personAttributes.filter(
      (option) => !selectedRequirements.find((selected) => selected === option),
    );
  }, [selectedRequirements]);

  // Modify the Autocomplete's onChange handler to update the form's state
  const handleRequirementChange = (_, newValue) => {
    setValue('policy.requirements', newValue);
  };
  return (
    <Card
      sx={{
        overflowY: 'auto',
      }}
    >
      <FormProvider {...methods}>
        <Stack
          direction="row"
          spacing={2}
          padding={2}
          alignItems="center"
          sx={{ position: 'sticky', top: 0, ...bgBlur({ opacity: 0.5 }), zIndex: 1 }}
        >
          <InfoModal
            title=""
            description="A portal to the external world. Please add company information to be displayed in the gate."
          />
          <RHFTextField
            name="name"
            size="small"
          />
          <RHFSelect
            sx={{ maxWidth: 120 }}
            native
            name="status"
            label="Status"
            size="small"
          >
            {statusOptions.map((option) => (
              <option
                key={option}
                value={option}
              >
                {capitalize(option)}
              </option>
            ))}
          </RHFSelect>
        </Stack>
        <Stack
          sx={{
            px: 1,
          }}
        >
          <Stack
            spacing={2}
            sx={{ p: 2 }}
            component="form"
          >
            <AgentAutocomplete
              onChange={(agentId) => {
                setValue('agent_id', agentId);
              }}
              value={agent_id}
              hideCreation={true}
            />
          </Stack>

          {/* <Paper sx={{ background: 'none', py: 1, m: 2, px: 2, border: (theme) => `dashed 1px ${theme.palette.divider}` }}>
            <InfoModal title="Configuration" description="What type of data to display" />
            <RHFSwitch name="enable_shop" label="display shop" />
            <RHFSwitch name="enable_contact" label="enable customers to create a room with the agent" />
            <Autocomplete
              multiple
              size="small"
              id="policy.requirements"
              options={availableOptions}
              getOptionLabel={(option) => option}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Data Requirements"
                  variant="outlined"
                />
              )}
              onChange={handleRequirementChange}
              value={selectedRequirements}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip key={option.key} label={option} {...getTagProps({ index })} />
                ))
              }
              fullWidth
            />
          </Paper>

          <Paper sx={{ background: 'none', py: 1, m: 2, px: 2, border: (theme) => `dashed 1px ${theme.palette.divider}` }}>
            <InfoModal title="Background" description="Default policy of the rooms generated automatically." />
            <RHFUpload
              file={avatarSrc || null}
              name="avatar"
              multiple={false}
              maxSize={3145728}
              onDrop={(accepted) => handleDropSingleFile(accepted, "avatar")}
              onDelete={() => setValue('avatar', null)}
            />

          </Paper> */}
        </Stack>
        <ButtonGroup
          fullWidth
          sx={{ position: 'sticky', bottom: 0, ...bgBlur({ opacity: 0.5 }) }}
        >
          <LoadingButton
            startIcon={<Iconify icon={isNewGate ? 'lets-icons:add-duotone' : 'mdi:check'} />}
            loading={isSubmitting}
            color="primary"
            variant="soft"
            onClick={handleSubmit(onSubmit)}
          >
            {isNewGate ? 'Create' : 'Save'}
          </LoadingButton>
        </ButtonGroup>
      </FormProvider>
    </Card>
  );
}

// const handleOpenSpaceNavigator = () => {
//   dispatch(setNavigationActive({ mode: 'gate' }));
// };

{
  /* <SpaceNavigator setSpace={setSpace}/>
    <Button variant="soft" startIcon={<Iconify icon="gridicons:layout" width={22}></Iconify>}
      onClick={handleOpenSpaceNavigator}>
      {space?.name || "Space"}
    </Button> */
}

{
  /* <Autocomplete
    id="layout-autocomplete"
    options={spaces}
    getOptionLabel={(option) => option}
    renderInput={(params) => (
      <TextField
        {...params}
        label="Layout"
        variant="outlined"
      />
    )}
    value={watch("layout_id")}
    onChange={(_, newValue) => {
      setValue("layout_id", newValue);
    }}
  /> */
}

{
  /* {roomPolicyFields.map((field, index) => (
      <RHFTextField
        key={index}
        size="small"
        select={!!field.options}
        name={`policy.${field.key}`}
        label={field.title}
        helperText={field.description}
        fullWidth
        onChange={(e) => field.onChange(e.target.value)}
      >
        {field.options?.map(option => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </RHFTextField>
    ))} */
}
