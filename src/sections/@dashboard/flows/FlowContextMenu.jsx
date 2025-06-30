import React, { memo, useEffect, useMemo, useState } from 'react';

import ContextMenu from '../../../components/contextmenu/ContextMenu.jsx';
// import { selectModule } from '../../../redux/slices/flows';
// import { useSelector } from '../../../redux/store';

const findModulesCopiedInClipboard = async () => {
  try {
    // Clipboard API requires user interaction; ensure this function is called within an event handler
    const clipboardText = await navigator.clipboard.readText();
    // Updated regex to match N UUIDs (N >= 1), where '|' is optional when there's only one ID
    const regex = /___\{\{\$modulesCopied\}\}\(([\w-]+(?:\|[\w-]+)*)\)/g;
    const matches = [...clipboardText.matchAll(regex)];
    if (matches.length > 0) {
      // Collect all IDs from all matches
      const allIds = matches.flatMap((match) => match[1].split('|'));
      // console.log('allIds', allIds);
      return allIds;
    } else {
      // console.log('No matches found in clipboard');
      return null;
    }
  } catch {
    // console.error('Failed to read clipboard: ', err);
    return null;
  }
};

const FlowContextMenu = ({
  open,
  top,
  left,
  right,
  bottom,
  x: clientX,
  y: clientY,
  mode,
  selected,
  onSelect,
  // ...props
}) => {
  const [moduleIdsToPaste, setModuleIdsToPaste] = useState(null);
  // const moduleSelector = useMemo(() => (!moduleData?.after && !moduleData?.id) ? () => null : selectModule(moduleData.id, moduleData.after), [moduleData?.after, moduleData?.id]);
  // const module = useSelector(moduleSelector);

  const xPos = left ? left : right;
  const yPos = top ? top : bottom;

  const settingsMenuItems = useMemo(() => {
    const items = [];
    const hasSelected = !!selected?.length;
    if (!hasSelected && mode !== 'bg') {
      return items;
    }
    const single = !!hasSelected && selected.length === 1;
    const validStatus = hasSelected && !selected.some((e) => e.status === 'new');
    if (mode === 'module' && validStatus) {
      // NODE
      if (single) {
        items.push(
          { l: 'Run this module only', a: null, i: 'mdi-play-circle-outline' },
          { l: 'Add error handler', a: null, i: 'mdi-alert-outline' },
          {
            l: 'Rename',
            a: { k: 'renameModule', p: { moduleId: selected[0].id } },
            i: 'mdi-pencil-outline',
          },
        );
      }
      items.push(
        {
          l: `Duplicate${single ? '' : ` (${selected.length})`}`,
          a: { k: 'cloneModule', p: { moduleIds: selected.map((s) => s.id) } },
          i: 'mdi-content-duplicate',
        },
        {
          l: `Copy module${single ? '' : `s (${selected.length})`}`,
          a: { k: 'copyModule', p: { moduleIds: selected.map((s) => s.id) } },
          i: 'mdi-content-copy',
        },
      );
      if (single) {
        items.push({ l: 'Add a note', a: null, i: 'mdi-note-outline' });
      }
    }
    if (mode === 'bg') {
      items.push(
        {
          l: `Paste ${moduleIdsToPaste ? `(${moduleIdsToPaste?.length})` : ''}`,
          a: !moduleIdsToPaste
            ? null
            : {
                k: 'pasteModules',
                p: {
                  moduleIds: moduleIdsToPaste,
                  coordinates: { x: clientX, y: clientY },
                },
              },
          i: 'mdi-content-duplicate',
        },
        { l: 'Add a module', a: null, i: 'mdi-plus' },
      );
    }
    if (mode === 'edge' && hasSelected) {
      // EDGE
      if (single && validStatus) {
        items.push({ l: 'Set up a filter', a: null, i: 'mdi-filter-outline' });
      }
      items.push({
        l: `Unlink${single ? '' : ` (${selected.length})`}`,
        a: { k: `deleteEdge${single ? '' : 's'}`, p: { selected } },
        i: 'mdi-link-off',
      });
      if (single && validStatus) {
        items.push(
          { l: 'Select whole branch', a: null, i: 'mdi-vector-selection' },
          { l: 'Add a router', a: null, i: 'mdi-router-wireless' },
          { l: 'Add a module', a: null, i: 'mdi-plus' },
          { l: 'Add a note', a: null, i: 'mdi-note-outline' },
          // { l: 'Set up a filter', a: { k: "setupFilter", p: { branchId: branch.id } }, i: "mdi-filter-outline" },
          // { l: 'Unlink', a: { k: "unlinkBranch", p: { branchId: branch.id } }, i: "mdi-link-off" },
          // { l: 'Select whole branch', a: { k: "selectWholeBranch", p: { branchId: branch.id } }, i: "mdi-vector-selection" },
          // { l: 'Add a router', a: { k: "addRouter", p: { branchId: branch.id } }, i: "mdi-router-wireless" },
          // { l: 'Add a module', a: { k: "addModule", p: { branchId: branch.id } }, i: "mdi-plus" },
          // { l: 'Add a note', a: { k: "addNote", p: { branchId: branch.id } }, i: "mdi-note-outline" }
        );
      }
    }
    if (mode === 'module' && hasSelected) {
      items.push({
        l: `Delete module${single ? '' : `s (${selected.length})`}`,
        a: { k: `deleteModule${single ? '' : 's'}`, p: { selected } },
        i: 'mdi-delete-outline',
      });
    }
    return items;
  }, [clientX, clientY, mode, moduleIdsToPaste, selected]);

  useEffect(() => {
    if (mode === 'bg') {
      setModuleIdsToPaste(null);
      setTimeout(() =>
        findModulesCopiedInClipboard().then((result) => {
          if (result) {
            setModuleIdsToPaste(result);
          }
        }, 500),
      );
      // console.log('pasteAction', moduleIdsToPaste);
    }
  }, [mode, xPos, yPos]);

  return (
    <ContextMenu
      menuItems={settingsMenuItems}
      xPos={xPos}
      yPos={yPos}
      open={open}
      onClose={onSelect}
      disabledMessageTooltip="This feature will be available soon."
    />
  );
};

export default memo(FlowContextMenu);
