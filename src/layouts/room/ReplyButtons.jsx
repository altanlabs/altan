import { getTranslation } from '@assets/translations';
import { Box, TextField, Autocomplete, Button, capitalize } from '@mui/material';
import React, { memo, useMemo, useState } from 'react';
import { dispatch, useSelector } from 'react-redux';

import { selectGate } from '../redux/slices/gate';

const getButtonName = (button, lang) => {
  const shortLang = lang?.substring(0, 2).toUpperCase();
  const translation = button?.meta_data?.translations?.[shortLang];
  return translation || button.name;
};

const IndividualReplyButton = memo(({ active, buttonId, buttonName, theme, dispatchAction, brandColor }) => {
  const [selected, setselected] = useState(false);
  let buttonLabel = '';
  if (buttonName) {
    buttonLabel = buttonName.charAt(0).toUpperCase() + buttonName.slice(1);
  }
  const handleClick = async () => {
    setselected(true);
    try {
      await dispatchAction(buttonId);
    } catch (error) {
      console.error(error);
    }
    setselected(false);
  };

  return (
    <Button
      sx={{ p: '8px', m: '5px', textTransform: 'none' }}
      variant="soft"
      color="primary"
      disabled={!active}
      onClick={handleClick}
      selected={selected}
    >
      {buttonLabel}
    </Button>
  );
});

const ReplyButtons = ({ active = true, space, mode, theme, brandColor }) => {
  const gate = useSelector(selectGate);
  const browserLanguage = navigator.language || navigator.userLanguage;
  const shouldFilter = space.children?.spaces?.length > 10;
  const replyButtons = (!!space && !!space.children?.spaces)
    ? space.children.spaces.map(sc => sc.type === 'link' ? sc.child.reference : sc.child)
    : [];

  const goBackButton = {
    id: ((chat?.space_breadcrumbs || []).length > 1 && space.parent) || (gate && gate.space && gate.space.id),
    name: getTranslation('back', browserLanguage),
  };

  const handleButtonClick = (buttonId) => {
    dispatch(getSpace(buttonId));
  };

  const handleAutoCompleteChange = (event, newValue) => {
    if (newValue) {
      handleButtonClick(newValue.id);
    }
  };

  const renderReplyButtons = useMemo(() => !shouldFilter && replyButtons.map((button, index) => (
    <IndividualReplyButton
      key={`reply_button_${index}_${button.id}`}
      buttonId={button.id}
      buttonName={getButtonName(button, browserLanguage)}
      active={active}
      theme={theme}
      dispatchAction={handleButtonClick}
      brandColor={brandColor}
    />
  )), [active, theme, shouldFilter, replyButtons, browserLanguage, brandColor]);

  const renderGoBackButton = useMemo(() => (
    !!chat?.space_breadcrumbs?.length && chat.space_breadcrumbs.slice(-1)[0].space.id !== gate?.space?.id
    || space && space?.parent && gate?.space?.id !== space.id
  ) && (
    <IndividualReplyButton
      key={'reply_button_go_back'}
      buttonId={goBackButton.id}
      buttonName={goBackButton.name}
      active={active}
      theme={theme}
      dispatchAction={handleButtonClick}
      brandColor={brandColor}
    />
  ), [active, theme, chat, gate, space, goBackButton, browserLanguage, brandColor]);

  const renderAutocompleteReplyButtons = useMemo(() => shouldFilter && (
    <Autocomplete
      size="small"
      sx={{ ml: 1, mt: 2, width: '275px' }}
      theme={theme}
      options={replyButtons}
      getOptionLabel={(option) => getButtonName(option, browserLanguage)}
      onChange={handleAutoCompleteChange}
      renderOption={(props, option) => (
        <Box component="li" {...props} sx={{ zIndex: 999 }}>
          {capitalize(getButtonName(option, browserLanguage))}
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          fullWidth
          {...params}
          label={`Search in ${getButtonName(space, browserLanguage)}...`}
          inputProps={{
            ...params.inputProps,
            autoComplete: 'off',
          }}
        />
      )}
    />
  ), [shouldFilter, replyButtons, browserLanguage]);

  return (
    mode === 'demo'  ? (
      <>
        <div className="relative w-full ml-4 flex justify-center z-10 transition-all duration-100 ease-in-out">
          <div className="py-2 relative table">
            { renderReplyButtons }
            { renderGoBackButton }
          </div>
          { renderAutocompleteReplyButtons }
        </div>
      </>
    )
      : null
  );
};

export default memo(ReplyButtons);
