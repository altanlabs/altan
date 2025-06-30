// routes
// components
import { Button } from '@mui/material';

import Iconify from '../../../components/iconify';
import Label from '../../../components/label';
import SvgColor from '../../../components/svg-color';
import { openPermissionDialog } from '../../../redux/slices/general';
import { dispatch } from '../../../redux/store';
import { PATH_DASHBOARD } from '../../../routes/paths';

// ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor
    src={`/assets/icons/navbar/${name}.svg`}
    sx={{ width: 1, height: 1 }}
  />
);

const ICONS = {
  blog: icon('ic_blog'),
  cart: icon('ic_cart'),
  chat: icon('ic_chat'),
  mail: icon('ic_mail'),
  user: icon('ic_user'),
  file: icon('ic_file'),
  lock: icon('ic_lock'),
  label: icon('ic_label'),
  blank: icon('ic_blank'),
  kanban: icon('ic_kanban'),
  folder: icon('ic_folder'),
  banking: icon('ic_banking'),
  booking: icon('ic_booking'),
  invoice: icon('ic_invoice'),
  calendar: icon('ic_calendar'),
  disabled: icon('ic_disabled'),
  external: icon('ic_external'),
  menuItem: icon('ic_menu_item'),
  dashboard: icon('ic_dashboard'),
};

const navConfig = [
  {
    subheader: 'Dashboard',
    items: [
      {
        title: 'Dashboard',
        path: '/dashboard',
        icon: ICONS.dashboard,
        permission: 'view_dashboard',
      },
      {
        title: 'Usage',
        path: '/usage',
        icon: <Iconify icon="mdi:chart-line" />,
        permission: 'view_dashboard',
      },
      // {
      //   title: 'Marketplace',
      //   path: '/marketplace',
      //   icon: (
      //     <Iconify
      //       icon="mdi:marketplace"
      //       width={22}
      //     />
      //   ),
      //   permission: 'view_dashboard',
      // },
    ],
  },
  // {
  //   subheader: "Altaners",
  //   action:
  //     <Button
  //       startIcon={<Iconify icon="oui:ml-create-single-metric-job" width={16} />}
  //       onClick={(e) => {
  //         e.stopPropagation();
  //         dispatch(openCreateAltaner());
  //       }}
  //       size="small"
  //       variant="soft"
  //       color="info"
  //     >
  //       New altaner
  //     </Button>,
  //   items: [
  //   ],
  // },
  {
    subheader: 'Products',
    action: (
      <Button
        startIcon={
          <Iconify
            icon="material-symbols:edit"
            width={16}
          />
        }
        onClick={(e) => {
          e.stopPropagation();
          dispatch(openPermissionDialog());
        }}
        size="small"
        variant="soft"
        color="info"
        sx={{ width: 100 }}
      >
        Edit
      </Button>
    ),
    items: [
      {
        title: 'Interfaces',
        path: '/interfaces',
        info: <Label color="warning">Alpha</Label>,
        icon: <Iconify icon="mdi:monitor-dashboard" />,
        permission: 'view_interfaces',
      },
      {
        title: 'Flows',
        path: PATH_DASHBOARD.flows,
        icon: <Iconify icon="fluent:flash-flow-24-filled"></Iconify>,
        permission: 'view_flows',
      },
      {
        title: 'Databases',
        path: '/bases',
        info: <Label color="info">Beta</Label>,
        icon: <Iconify icon="material-symbols:database"></Iconify>,
        permission: 'view_bases',
      },
      {
        title: 'AI Agents',
        path: '/agents',
        icon: <Iconify icon="fluent:bot-sparkle-20-filled"></Iconify>,
        permission: 'view_agents',
      },
      {
        title: 'Forms',
        path: PATH_DASHBOARD.forms,
        icon: <Iconify icon="mdi:form"></Iconify>,
        permission: 'view_forms',
      },
      {
        title: 'Gates',
        path: '/conversations/gates',
        icon: <Iconify icon="icon-park-solid:data-user" />,
        permission: 'view_gates',
      },
      // {
      //   title: 'Conversations',
      //   path: '/conversations',
      //   icon: <Iconify icon="fluent:chat-multiple-16-filled"></Iconify>,
      //   permission: 'view_conversations',
      //   children: [
      //     {
      //       title: 'Me',
      //       path: 'https://app.altan.ai',
      //       icon: <Iconify icon="ic:round-near-me" />,
      //       permission: 'view_room',
      //       info: <Iconify icon="iconamoon:link-external-duotone" />,
      //     },
      //   ],
      // },
      // {
      //   title: 'CRM',
      //   path: PATH_DASHBOARD.crm,
      //   icon: <Iconify icon="simple-icons:civicrm"></Iconify>,
      //   info: <Label color="secondary">Alpha</Label>,
      //   permission: 'view_crm',
      //   children: [
      //     {
      //       title: 'Opportunities',
      //       path: "/crm/pipelines",
      //       icon: <Iconify icon="solar:money-bag-bold" />,
      //       permission: 'view_pipelines',
      //     },
      //     {
      //       title: 'Custom Attributes',
      //       path: "/crm/attributes",
      //       icon: <Iconify icon="icon-park-solid:data-user" />,
      //       permission: 'view_attributes',
      //     },
      //   ],
      // },

      // {
      //   title: 'Shop',
      //   path: '/shop',
      //   icon: <Iconify icon="solar:shop-bold-duotone" />,
      //   permission: 'view_shop',
      //   // children: [
      //   //   {
      //   //     title: 'Products',
      //   //     path: '/products',
      //   //     icon: <Iconify icon="heroicons:shopping-bag-20-solid" />,
      //   //     permission: 'view_products',
      //   //   },
      //   //   {
      //   //     title: 'Orders',
      //   //     path: '/orders',
      //   //     icon: <Iconify icon="material-symbols-light:order-approve-sharp"></Iconify>,
      //   //     permission: 'view_orders'
      //   //   },
      //   //   {
      //   //     title: 'Order Items',
      //   //     path: '/orders-items',
      //   //     icon: <Iconify icon="mdi:order-bool-descending-variant"></Iconify>,
      //   //     permission: 'view_orders'
      //   //   },
      //   //   {
      //   //     title: 'Payments',
      //   //     path: "/shop",
      //   //     icon: <Iconify icon="material-symbols:payments"></Iconify>,
      //   //     permission: 'view_shop'
      //   //   },
      //   // ],
      // },
      // {
      //   title: 'Assets',
      //   path: '/assets',
      //   icon: <Iconify icon="mdi:git-repository" />,
      //   permission: 'view_assets',
      //   children: [
      //     // {
      //     //   title: 'Connections',
      //     //   path: PATH_DASHBOARD.assets.connections,
      //     //   icon: <Iconify icon="mdi:plug" />,
      //     //   permission: 'view_connections',
      //     // },
      //     {
      //       title: 'Webhooks',
      //       path: PATH_DASHBOARD.assets.hooks,
      //       icon: <Iconify icon="material-symbols:webhook" />,
      //       permission: 'view_hooks',
      //     },
      //     // {
      //     //   title: 'Knowledge',
      //     //   path: PATH_DASHBOARD.assets.knowledge,
      //     //   icon: <Iconify icon="tabler:file-filled"></Iconify>,
      //     //   permission: 'view_knowledge'
      //     // },
      //     {
      //       title: 'Media',
      //       path: PATH_DASHBOARD.assets.media,
      //       icon: <Iconify icon="fluent-mdl2:photo-video-media"></Iconify>,
      //       permission: 'view_media',
      //     },
      //   ],
      // },
    ],
  },
  {
    subheader: 'workspace',
    items: [
      {
        title: 'Integration',
        path: '/integration',
        icon: <Iconify icon="fluent:window-dev-tools-16-filled"></Iconify>,
        permission: 'view_team',
      },
      // {
      //   title: 'Admin',
      //   path: '/admin',
      //   icon: <Iconify icon="eos-icons:master"></Iconify>,
      //   permission: 'view_team',
      // },
      {
        title: 'Team',
        path: PATH_DASHBOARD.members.root,
        icon: <Iconify icon="fluent-mdl2:team-favorite"></Iconify>,
        permission: 'view_team',
      },
      {
        title: 'Settings',
        path: PATH_DASHBOARD.account.settings,
        icon: <Iconify icon="solar:settings-bold-duotone"></Iconify>,
        permission: 'view_settings',
      },
    ],
  },
];

export default navConfig;
