import {
  DndContext,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Grid, Stack, useMediaQuery } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';

import WidgetCard from './WidgetCard';
import { deleteSectionWidget, updateWidgetSectionLayout } from '../../../redux/slices/layout';
import { deleteWidgetFromSpace, updateWidgetSpaceLayout } from '../../../redux/slices/spaces';
import { dispatch } from '../../../redux/store';
import AddWidgetMenu from '../widgets/drawers/widgets/AddWidgetMenu';

function findMovedWidgets(oldArray, newArray) {
  const movedWidgets = [];
  for (let i = 0; i < newArray.length; i++) {
    if (oldArray[i] && newArray[i].id !== oldArray[i].id) {
      movedWidgets.push({
        widget_id: newArray[i].id,
        new_position: i,
      });
    }
  }
  return movedWidgets;
}

const WidgetCardElement = ({
  item,
  mode,
  parent,
  defaultValues,
  isEdit,
  onEdit,
  isEditLayout,
  onDelete,
}) => {
  if (!item?.widget) return null;

  const renderWidget = (
    <WidgetCard
      // key={`widget_${widget.id}`}
      item={item.widget}
      defaultValues={defaultValues}
      isEdit={isEdit}
      isEditLayout={isEditLayout}
      onEdit={onEdit}
      onDelete={onDelete}
      mode={mode}
      parent={parent}
    />
  );

  return mode === 'space' ? (
    renderWidget
  ) : (
    <Grid
      item
      xs={12}
      md={item.size}
    >
      {renderWidget}
    </Grid>
  );
};

const Widgets = ({ theme, widgets, isEditLayout, mode = 'space', parent = null }) => {
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [newWidget, setNewWidget] = useState(null);
  const [editingWidgetCards, setEditingWidgetCards] = useState({});
  const [widgetsCopy, setWidgetsCopy] = useState([]);
  const [changes, setChanges] = useState(false);

  const onDelete = (widgetId) => {
    if (widgetId === 'new') setNewWidget(null);
    else
      dispatch(
        mode === 'space'
          ? deleteWidgetFromSpace(widgetId)
          : deleteSectionWidget({ sectionId: parent, widgetId }),
      );
    setEditingWidgetCards((widgetCards) => ({ ...widgetCards, [widgetId]: null }));
  };

  const onEdit = (widgetId, name, oldName) => {
    setEditingWidgetCards((widgetCards) => {
      if (widgetId in widgetCards && !!widgetCards[widgetId]) {
        if (widgetId === 'new') setNewWidget(null);
        // else if (oldName !== name) dispatch(updateWidget(id, name));
        // dispatch(updateWidgetInRedux(editingState[widgetId]));
        return { ...widgetCards, [widgetId]: null };
      }
      return { ...widgetCards, [widgetId]: widgets.find((w) => w.widget.id === widgetId).widget };
    });
  };

  const onNewWidget = (value) => {
    setNewWidget(value);
    setEditingWidgetCards((widgetCards) => ({ ...widgetCards, new: value.widget }));
  };

  const handleWidgetDragEnd = (e) => {
    const { active, over } = e;
    if (active?.id !== over?.id) {
      setWidgetsCopy((items) => {
        const oldIndex = items.findIndex((i) => i.widget.id === active.id);
        const newIndex = items.findIndex((i) => i.widget.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      setChanges(true);
    }
  };

  const sortedWidgets = useMemo(
    () =>
      [...widgets].sort((sw1, sw2) =>
        sw1.position > sw2.position ? 1 : sw1.position < sw2.position ? -1 : 0,
      ),
    [widgets],
  );

  const allWidgets = useMemo(
    () => (!!newWidget ? [...sortedWidgets, newWidget] : sortedWidgets),
    [sortedWidgets, newWidget],
  );

  const widgetsCopyLength = widgetsCopy.length;

  useEffect(() => {
    if (!isEditLayout && !!changes && widgetsCopyLength) {
      const changedPositionWidgets = findMovedWidgets(sortedWidgets, widgetsCopy);
      dispatch(
        mode === 'section'
          ? updateWidgetSectionLayout(parent, changedPositionWidgets)
          : updateWidgetSpaceLayout(changedPositionWidgets),
      );
    }
    if (!isEditLayout) setChanges(false);
    setWidgetsCopy(!isEditLayout ? [] : widgets);
  }, [isEditLayout]);

  const widgetsToRender = !isEditLayout ? allWidgets : widgetsCopy;

  const renderChildren = useMemo(
    () => (
      <SortableContext
        items={widgetsToRender.map((pw) => pw.widget.id)}
        strategy={mode === 'space' ? verticalListSortingStrategy : rectSortingStrategy}
      >
        {widgetsToRender.map((item, index) => {
          const widget = item?.widget;
          if (!widget?.id) return null;
          const isEdit = widget.id in editingWidgetCards && !!editingWidgetCards[widget.id];
          return (
            <WidgetCardElement
              key={`section_widget_${item.id}`}
              item={item}
              mode={mode}
              parent={parent}
              defaultValues={isEdit && editingWidgetCards[widget.id].meta_data}
              isEdit={isEdit}
              onEdit={onEdit}
              isEditLayout={isEditLayout}
              onDelete={onDelete}
            />
          );
        })}
      </SortableContext>
    ),
    [mode, widgetsToRender, editingWidgetCards, isEditLayout, onDelete, onEdit],
  );

  const renderAddWidget = !newWidget && !isEditLayout && (
    <AddWidgetMenu
      mode={mode}
      setWidget={onNewWidget}
      parent={parent}
    />
  );

  const renderWrapper =
    mode === 'space' ? (
      <Stack
        direction="column"
        spacing={0.5}
      >
        {renderChildren}
        {renderAddWidget}
      </Stack>
    ) : (
      <Grid
        container
        spacing={2}
        sx={{
          margin: 0,
          padding: 1,
          mt: isMobile ? 0 : 1,
          width: '100%',
        }}
      >
        {renderChildren}
        {renderAddWidget}
      </Grid>
    );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleWidgetDragEnd}
    >
      {renderWrapper}
    </DndContext>
  );
};

export default Widgets;
