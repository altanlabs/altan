import { Stack, IconButton } from '@mui/material';
import { useSnackbar } from 'notistack';
import React, { useCallback, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { BaseCard } from './StyledCards';
import WidgetSizeModal from './WidgetSizeModal';
import Iconify from '../../../components/iconify/Iconify';
import { createWidget as createWidgetLayout } from '../../../redux/slices/layout';
import { createWidget as createWidgetSpace } from '../../../redux/slices/spaces';
import { updateWidget } from '../../../redux/slices/widgets';
import { dispatch } from '../../../redux/store';
import { CustomMessage } from '../widgets/custom_message/CustomMessage';
import DynamicForm from '../widgets/edit_components/DynamicForm';
import WidgetRenderer from '../widgets/render_components/WidgetRenderer';
import { getWidgetSchema } from '../widgets/schemas';

const WidgetCard = ({
  item,
  defaultValues,
  isEdit,
  isEditLayout,
  onEdit,
  onDelete,
  mode = 'space',
  parent = null,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const createWidget = mode === 'space' ? createWidgetSpace : createWidgetLayout;
  const [isResizeOpen, setIsResizeOpen] = useState(false);

  const onSave = useCallback(
    ({ id, meta_data, type, create = true }) => {
      if (create) {
        dispatch(createWidget({ type, meta_data, sectionId: mode === 'section' && parent }))
          .then(() => onEdit(id))
          .catch((e) =>
            enqueueSnackbar(`Error creating widget ${type} in ${mode}.`, { variant: 'error' }),
          );
      } else {
        dispatch(
          updateWidget({
            widgetId: id,
            type: type,
            meta_data,
            sectionId: mode === 'section' && parent,
          }),
        )
          .then(() => onEdit(item.id))
          .catch((e) =>
            enqueueSnackbar(`Error updating widget ${type} in ${mode}.`, { variant: 'error' }),
          );
      }
    },
    [mode, parent, dispatch, enqueueSnackbar, onEdit, updateWidget, createWidget],
  );

  const schema = getWidgetSchema(item.type);
  const onSubmit = (data) => {
    console.log('DATA', data);
    onSave({ id: item.id, type: item.type, meta_data: data, create: item.id === 'new' }); // validateAndConvert(schema, data)
  };

  const methods = useForm();
  // console.log("DEFAULT VALS:", defaultValues);
  const { watch, reset } = methods;
  const values = watch();

  useEffect(() => {
    if (item.type !== 'custom_message') reset(defaultValues);
  }, [item, defaultValues]);

  if (item.type === 'custom_message')
    return (
      <CustomMessage
        item={item}
        isEdit={isEdit}
        onEdit={onEdit}
        onDelete={onDelete}
        onSave={onSave}
        isEditLayout={isEditLayout}
        defaultValues={defaultValues}
        enqueueSnackbar={enqueueSnackbar}
      />
    );

  if (!values) return null;

  if (!isEdit)
    return (
      <BaseCard
        item={item}
        isEditLayout={isEditLayout}
        mode="widget"
        onEdit={onEdit}
        onDelete={onDelete}
      >
        {parent && (
          <>
            <IconButton
              color="primary"
              sx={{ position: 'absolute', top: 0, left: 0, zIndex: 9999 }}
              onClick={() => setIsResizeOpen(true)}
            >
              <Iconify
                icon="vaadin:resize-v"
                color="inherit"
                width={20}
                rotate={2}
              />
            </IconButton>
            <WidgetSizeModal
              isOpen={isResizeOpen}
              closeModal={() => setIsResizeOpen(false)}
              widgetId={item.id}
              parent={parent}
            />
          </>
        )}
        <WidgetRenderer widget={item} />
      </BaseCard>
    );
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <BaseCard
          item={item}
          isEditLayout={isEditLayout}
          isEditMode={isEdit}
          mode="widget"
          onEdit={onEdit}
          onDelete={onDelete}
        >
          <Stack
            padding={1.25}
            width="100%"
          >
            <DynamicForm schema={schema} />
          </Stack>
        </BaseCard>
        {/* <button type="submit">Submit</button> */}
      </form>
    </FormProvider>
  );
};

export default WidgetCard;
