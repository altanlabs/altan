import { Modal } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import { Command } from 'cmdk';
import { useState, memo, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
// @mui

// components
import { IconButtonAnimate } from '../../../components/animate';
import Iconify from '../../../components/iconify';
import SearchNotFound from '../../../components/search-not-found';
import { selectAccount } from '../../../redux/slices/general';
import { bgBlur } from '../../../utils/cssStyles';

// config
import NavConfig from '../nav/config-navigation';

const StyledSearchbar = styled(Command)(({ theme }) => ({
  ...bgBlur({ color: theme.palette.background.default }),
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '640px',
  maxWidth: '90vw',
  borderRadius: '12px',
  backgroundColor: theme.palette.background.default,
  boxShadow: '0 16px 70px rgb(0 0 0 / 20%)',

  '[cmdk-input]': {
    padding: '12px 16px',
    fontSize: '16px',
    width: '100%',
    border: 'none',
    borderBottom: `1px solid ${theme.palette.divider}`,
    outline: 'none',
    backgroundColor: 'transparent',
    color: theme.palette.text.primary,
  },

  '[cmdk-list]': {
    maxHeight: '400px',
    overflow: 'auto',
    overscrollBehavior: 'contain',
    padding: '8px',
  },

  '[cmdk-item]': {
    padding: '8px 16px',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    color: theme.palette.text.primary,
    background: 'transparent',
    transition: 'all 150ms ease',
    borderRadius: theme.shape.borderRadius,
    '&[data-selected="true"]': {
      background: alpha(theme.palette.primary.main, 0.08),
    },
  },

  '[cmdk-group-heading]': {
    padding: '8px 16px',
    fontSize: '12px',
    color: theme.palette.text.secondary,
    textTransform: 'uppercase',
  },
}));

function Searchbar() {
  const history = useHistory();;
  const account = useSelector(selectAccount);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Add keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        handleOpen();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpen = () => {
    setOpen(true);
    setSearch(''); // Reset search when opening
  };

  const handleClose = () => {
    setOpen(false);
    setSearch(''); // Reset search when closing
  };

  const handleClick = useCallback(
    (path) => {
      if (path.includes('http')) {
        window.open(path);
      } else {
        history.push(path);
      }
      handleClose();
    },
    [history],
  );

  const getNavigationItems = useCallback((searchQuery) => {
    if (!searchQuery) return [];

    // Get main navigation items
    const mainNavItems = NavConfig.map((section) => ({
      title: section.subheader,
      path: section.items[0]?.path || `/${section.subheader.toLowerCase()}`,
      icon: section.items[0]?.icon || 'eva:folder-outline', // Default icon if none provided
      group: 'Navigation',
    })).filter((item) => item.title.toLowerCase().includes(searchQuery.toLowerCase()));

    // Get sub-items when searching
    const subNavItems = NavConfig.flatMap((section) =>
      section.items
        .filter((item) => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
        .map((item) => ({
          title: item.title,
          path: item.path,
          icon: item.icon, // Preserve the original icon
          group: section.subheader,
        })),
    );

    return [...mainNavItems, ...subNavItems];
  }, []);

  return (
    <>
      <IconButtonAnimate
        onClick={handleOpen}
        sx={{ mx: 1, mt: 0.2 }}
      >
        <Iconify
          icon="eva:search-fill"
          width={18}
        />
      </IconButtonAnimate>

      <Modal
        open={open}
        onClose={handleClose}
        slotProps={{ backdrop: { style: { backgroundColor: 'rgba(0, 0, 0, 0.8)' } } }}
      >
        <StyledSearchbar>
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder="Search across your workspace..."
            autoFocus
          />

          <Command.List>
            {!search && (
              <Command.Group heading="Quick Actions">
                <Command.Item onSelect={() => handleClick('/integration')}>
                  <Iconify
                    icon="mdi:chart-line"
                    width={16}
                  />
                  Usage
                </Command.Item>
                <Command.Item onSelect={() => handleClick('/agents')}>
                  <Iconify
                    icon="mdi:user-add"
                    width={16}
                  />
                  Agents
                </Command.Item>
                <Command.Item onSelect={() => handleClick('/flows')}>
                  <Iconify
                    icon="fluent:flow-16-filled"
                    width={16}
                  />
                  Flows
                </Command.Item>
                <Command.Item onSelect={() => handleClick('/integration')}>
                  <Iconify
                    icon="mdi:form"
                    width={16}
                  />
                  Integration
                </Command.Item>
              </Command.Group>
            )}

            {search && (
              <>
                {/* Main Navigation Results */}
                {getNavigationItems(search).length > 0 && (
                  <Command.Group heading="Navigation">
                    {getNavigationItems(search).map((item) => (
                      <Command.Item
                        key={`nav-${item.path}`}
                        onSelect={() => handleClick(item.path)}
                      >
                        {/* Handle both string icons and React elements */}
                        {typeof item.icon === 'string' ? (
                          <Iconify
                            icon={item.icon}
                            width={16}
                          />
                        ) : (
                          item.icon
                        )}
                        {item.title}
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}

                {/* Dynamic Content Results */}
                {account.workflows?.length > 0 && (
                  <Command.Group heading="Workflows">
                    {account.workflows
                      .filter((w) => w.name.toLowerCase().includes(search.toLowerCase()))
                      .map((workflow) => (
                        <Command.Item
                          key={workflow.id}
                          onSelect={() => handleClick(`/flows/${workflow.id}`)}
                        >
                          <Iconify
                            icon="fluent:flow-16-filled"
                            width={16}
                          />
                          {workflow.name}
                        </Command.Item>
                      ))}
                  </Command.Group>
                )}

                {account.agents?.length > 0 && (
                  <Command.Group heading="Agents">
                    {account.agents
                      .filter((a) => a.name.toLowerCase().includes(search.toLowerCase()))
                      .map((agent) => (
                        <Command.Item
                          key={agent.id}
                          onSelect={() => handleClick(`/agent/${agent.id}`)}
                        >
                          <Iconify
                            icon="mdi:robot"
                            width={16}
                          />
                          {agent.name}
                        </Command.Item>
                      ))}
                  </Command.Group>
                )}
              </>
            )}

            {search &&
              !getNavigationItems(search).length &&
              !account.workflows?.length &&
              !account.agents?.length && <SearchNotFound query={search} />}
          </Command.List>
        </StyledSearchbar>
      </Modal>
    </>
  );
}

export default memo(Searchbar);
