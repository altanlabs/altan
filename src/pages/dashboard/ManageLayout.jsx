import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Button,
  useTheme,
  Container,
  Stack,
  Skeleton,
  IconButton,
  Divider,
  ButtonGroup,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import {
  getLayout,
  deleteLayoutSection,
  updateSection,
  switchSectionsPosition,
} from '@redux/slices/layout';
import Footer from '@sections/@dashboard/layout/Footer';
import Header from '@sections/@dashboard/layout/Header';
import HomeHero from '@sections/@dashboard/layout/HomeHero';
import LayoutDialog from '@sections/@dashboard/layout/LayoutDialog';
import SectionDialog from '@sections/@dashboard/layout/SectionDialog';
import SectionTitle from '@sections/@dashboard/layout/SectionTitle';
import deepmerge from 'deepmerge';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import WebFont from 'webfontloader';

import Iconify from '@components/iconify';
import { dispatch, useSelector } from '@redux/store.ts';

import { DynamicIsland } from '../../components/dynamic-island/DynamicIsland';
import { CompactLayout } from '../../layouts/dashboard';
import { PATH_DASHBOARD } from '../../routes/paths';
import Widgets from '../../sections/@dashboard/spaces/Widgets';

const moveSection = async (layout, ls, direction) => {
  if (!ls) return;
  const currentPosition = ls.position;
  const targetPosition = direction === 'up' ? currentPosition - 1 : currentPosition + 1;
  const targetSection = layout?.sections?.find((section) => section.position === targetPosition);
  if (!targetSection) return;

  const sectionOriginId = ls.id;
  const sectionTargetId = targetSection.id;

  if (sectionOriginId && sectionTargetId) {
    try {
      await dispatch(switchSectionsPosition({ sectionOriginId, sectionTargetId }));
    } catch {
      // console.error('Failed to switch section positions:', error);
    }
  }
};

const createExtendedTheme = (customFontFamily) => ({
  typography: {
    fontFamily: customFontFamily,
    fontSize: 14,
    htmlFontSize: 16,
    fontWeightBold: 700,
    fontWeightLight: 300,
    fontWeightMedium: 600,
    fontWeightRegular: 400,
    body1: {
      lineHeight: 1.5,
      fontSize: '1rem',
      fontFamily: customFontFamily,
      fontWeight: 400,
    },
    body2: {
      lineHeight: 1.5714285714285714,
      fontSize: '0.875rem',
      fontFamily: customFontFamily,
      fontWeight: 400,
    },
    button: {
      fontWeight: 700,
      lineHeight: 1.7142857142857142,
      fontSize: '0.875rem',
      textTransform: 'capitalize',
      fontFamily: customFontFamily,
    },
    caption: {
      lineHeight: 1.5,
      fontSize: '0.75rem',
      fontFamily: customFontFamily,
      fontWeight: 400,
    },
    h1: {
      fontFamily: customFontFamily,
      fontSize: '2.5rem',
      fontWeight: 800,
      lineHeight: 1.25,
      '@media (min-width:600px)': { fontSize: '3.25rem' },
      '@media (min-width:900px)': { fontSize: '3.625rem' },
      '@media (min-width:1200px)': { fontSize: '4rem' },
    },
    h2: {
      fontFamily: customFontFamily,
      fontSize: '2rem',
      fontWeight: 800,
      lineHeight: 1.3333333333333333,
      '@media (min-width:600px)': { fontSize: '2.5rem' },
      '@media (min-width:900px)': { fontSize: '2.75rem' },
      '@media (min-width:1200px)': { fontSize: '3rem' },
    },
    h3: {
      fontFamily: customFontFamily,
      fontSize: '1.5rem',
      fontWeight: 700,
      lineHeight: 1.5,
      '@media (min-width:600px)': { fontSize: '1.625rem' },
      '@media (min-width:900px)': { fontSize: '1.875rem' },
      '@media (min-width:1200px)': { fontSize: '2rem' },
    },
    h4: {
      fontFamily: customFontFamily,
      fontSize: '1.25rem',
      fontWeight: 700,
      lineHeight: 1.5,
      '@media (min-width:600px)': { fontSize: '1.25rem' },
      '@media (min-width:900px)': { fontSize: '1.5rem' },
      '@media (min-width:1200px)': { fontSize: '1.5rem' },
    },
    inherit: {
      fontFamily: 'inherit',
      fontWeight: 'inherit',
      fontSize: 'inherit',
      lineHeight: 'inherit',
      letterSpacing: 'inherit',
    },
    overline: {
      fontWeight: 700,
      lineHeight: 1.5,
      fontSize: '0.75rem',
      textTransform: 'uppercase',
      fontFamily: customFontFamily,
    },
    subtitle1: {
      fontWeight: 600,
      lineHeight: 1.5,
      fontSize: '1rem',
      fontFamily: customFontFamily,
    },
    subtitle2: {
      fontWeight: 600,
      lineHeight: 1.5714285714285714,
      fontSize: '0.875rem',
      fontFamily: customFontFamily,
    },
  },
});

export default function ManageLayout() {
  const layoutId = useParams();
  const theme = useTheme();
  const { account } = useSelector((state) => state.general);
  const { layout, initialized, isLoading } = useSelector((state) => state.layout);
  const [currentEditingSection, setCurrentEditingSection] = useState(null);
  const [isSectionModalOpen, setSectionModalOpen] = useState(false);
  const [isLayoutModalOpen, setLayoutModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ title: '', subtitle: '', editId: null });
  const brandColor = layout?.meta_data?.ui?.brand_color || '#3f51b5';
  const customFontFamily = 'Inter';

  const loadFont = (fontFamily) => {
    WebFont.load({
      google: {
        families: [fontFamily],
      },
      active: () => {
        console.log('Font has been loaded', fontFamily);
      },
      inactive: () => {
        console.log('font failed to load', fontFamily);
      },
    });
  };

  useEffect(() => {
    if (!['Public Sans', 'Lato', 'Barlow'].includes(customFontFamily)) {
      loadFont(customFontFamily);
    }
  }, [customFontFamily]);

  const extendedTheme = deepmerge(theme, createExtendedTheme(customFontFamily));
  useEffect(() => {
    if (!initialized.layout && !isLoading.layout) {
      dispatch(getLayout(layoutId));
    }
  }, [initialized.layout, dispatch]);

  const socials = account?.meta_data?.socials || null;
  let allAccountUsers = [];

  if (account?.type === 'business')
    allAccountUsers = [...account?.organisation?.users, { user: account?.owner, role: 'Owner' }];

  const addSection = () => {
    setSectionModalOpen(true);
  };

  const openSectionSettings = (section) => {
    const configuration = section.configuration || { height: '', alignment: 'left' };
    setModalData({
      title: section.title,
      subtitle: section.subtitle,
      configuration,
      editId: section.id,
    });
    setSectionModalOpen(true);
  };

  const editSection = async (ls) => {
    if (currentEditingSection === ls.id) {
      setCurrentEditingSection(null);

      const updatedSection = ls.section;

      try {
        await dispatch(updateSection(ls.id, updatedSection));
      } catch (error) {
        console.error('Failed to update section', error);
      }
    } else {
      setCurrentEditingSection(ls.id);
    }
  };

  const renderSection = useCallback(
    (layout, ls) => {
      if (!ls?.section) return null;
      const isEdit = currentEditingSection === ls.id;
      const sectionHeight = ls.section?.configuration?.height || 'auto';
      return (
        <div
          style={{ position: 'relative', height: sectionHeight }}
          key={ls.id}
        >
          <ButtonGroup style={{ position: 'absolute', top: '4px', right: '0px', zIndex: 999 }}>
            <IconButton
              color="primary"
              onClick={() => moveSection(layout, ls, 'up')}
            >
              <Iconify
                icon="ph:arrow-up-bold"
                color="inherit"
                width={20}
              />
            </IconButton>
            <IconButton
              color="primary"
              onClick={() => moveSection(layout, ls, 'down')}
            >
              <Iconify
                icon="ph:arrow-up-bold"
                color="inherit"
                width={20}
                rotate={2}
              />
            </IconButton>
            <IconButton
              color="primary"
              onClick={() => openSectionSettings(ls.section)}
            >
              <Iconify
                icon="solar:settings-bold-duotone"
                color="inherit"
                width={20}
                rotate={2}
              />
            </IconButton>
            <IconButton
              color="primary"
              onClick={() => editSection(ls)}
              aria-label="edit"
            >
              <Iconify
                icon={
                  isEdit
                    ? 'line-md:circle-twotone-to-confirm-circle-twotone-transition'
                    : 'line-md:edit-twotone'
                }
                color="inherit"
                width={20}
              />
            </IconButton>
            {!isEdit && (
              <IconButton
                size="small"
                color="error"
                onClick={() => dispatch(deleteLayoutSection(ls.section.id))}
              >
                <DeleteIcon />
              </IconButton>
            )}
          </ButtonGroup>
          <Divider sx={{ borderStyle: 'dashed' }} />
          {(ls.section.title || isEdit) && (
            <SectionTitle
              section={ls.section}
              brandColor={brandColor}
              themeMode={theme.palette.mode}
              isEdit={isEdit}
              sectionId={ls.section.id}
            />
          )}
          {!!ls?.section && (
            <Widgets
              theme={theme}
              widgets={ls.section.widgets}
              parent={ls.section.id}
              mode="section"
              isEditLayout={isEdit}
            />
          )}
        </div>
      );
    },
    [currentEditingSection, theme, brandColor, setModalData],
  );

  const handleSectionDragEnd = () => {};

  const isCentered = true;

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleSectionDragEnd}
    >
      <CompactLayout
        title={`${layout?.name || 'Layout'} · Altan`}
        breadcrumb={{
          title: layout?.name || 'Layout',
          links: [
            {
              name: 'Studio',
              href: PATH_DASHBOARD.studio.root,
            },
            {
              name: 'Layouts',
              href: PATH_DASHBOARD.studio.layouts.root,
            },
            {
              name: layout?.name || 'Layout',
            },
          ],
        }}
      >
        {layout ? (
          <ThemeProvider theme={extendedTheme}>
            <Container sx={{ background: theme.palette.background.default, pb: 50 }}>
              <Stack>
                <Header
                  chatbot={layout}
                  allAccountUsers={allAccountUsers}
                />
                <HomeHero
                  chatbot={layout}
                  brand_color={brandColor}
                  themeMode={theme.palette.mode}
                  isCentered={isCentered}
                />

                <SortableContext
                  items={layout.sections}
                  strategy={rectSortingStrategy}
                >
                  {layout.sections.map((ls, index) => renderSection(layout, ls, index))}
                </SortableContext>

                <Divider sx={{ borderStyle: 'dashed' }} />
                <Button
                  color="primary"
                  onClick={addSection}
                  startIcon={<Iconify icon="tabler:plus" />}
                  sx={{ mt: 2 }}
                >
                  Add Section
                </Button>
                <Footer socials={socials} />
              </Stack>
            </Container>
          </ThemeProvider>
        ) : (
          <Skeleton height="100%" />
        )}

        <SectionDialog
          isOpen={isSectionModalOpen}
          closeModal={() => setSectionModalOpen(false)}
          modalData={modalData}
          setModalData={setModalData}
          position={layout?.sections?.length + 1 || 0}
        />
        {layout && (
          <LayoutDialog
            layout={layout}
            isOpen={isLayoutModalOpen}
            closeModal={() => setLayoutModalOpen(false)}
          />
        )}
        <DynamicIsland>
          <ButtonGroup variant="soft">
            <Button
              color="secondary"
              startIcon={<Iconify icon="carbon:view-filled" />}
            >
              View
            </Button>
            <Button
              startIcon={<Iconify icon="fluent:text-edit-style-16-filled" />}
              onClick={() => setLayoutModalOpen(true)}
            >
              Edit
            </Button>
          </ButtonGroup>
        </DynamicIsland>
      </CompactLayout>
    </DndContext>
  );
}
