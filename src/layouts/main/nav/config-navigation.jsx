// routes
import HomeTwoToneIcon from '@mui/icons-material/HomeTwoTone';

import Iconify from '../../../components/iconify';
import { PATH_PAGE } from '../../../routes/paths';
// config
// components

// ----------------------------------------------------------------------

const navConfig = [
  {
    title: 'Home',
    icon: <HomeTwoToneIcon />,
    path: '/',
  },
  // {
  //   title: 'Pricing',
  //   icon: <Iconify icon="solar:tag-price-bold-duotone" />,
  //   path: PATH_PAGE.pricing,
  // },
  {
    title: 'Company',
    icon: <Iconify icon="mdi:company" />,
    path: PATH_PAGE.about,
  },
  {
    title: 'Blog',
    icon: <Iconify icon="material-symbols:article-outline" />,
    path: 'https://www.altan.ai/blog',
  },

  // {
  //   title: 'Apps',
  //   path: '/pages',
  //   icon: <Iconify icon="eva:file-fill" />,
  //   children: [
  //     {
  //       subheader: 'Industry',
  //       items: [
  //         { title: 'eCommerce', path: PATH_PAGE.comingSoon },
  //         { title: 'Healthcare', path: PATH_PAGE.comingSoon },
  //         { title: 'Retail', path: PATH_PAGE.comingSoon },
  //         { title: 'Gaming', path: PATH_PAGE.comingSoon },
  //         { title: 'Technology', path: PATH_PAGE.comingSoon },
  //         { title: 'SaaS', path: PATH_PAGE.comingSoon },
  //         { title: 'Education', path: PATH_PAGE.comingSoon },
  //       ],
  //     },
  //     {
  //       subheader: 'Use case',
  //       items: [
  //         { title: 'Onboarding', path: PATH_AUTH.comingSoon },
  //         { title: 'Support', path: PATH_AUTH.comingSoon },
  //         { title: 'Engage', path: PATH_AUTH.comingSoon },
  //         { title: 'Convert', path: PATH_AUTH.comingSoon },
  //       ],
  //     },
  //     {
  //       subheader: 'Special',
  //       items: [
  //         { title: 'Second Brain', path: PATH_PAGE.comingSoon },
  //         { title: 'Research', path: PATH_PAGE.comingSoon },
  //       ],
  //     },
  //     {
  //       subheader: 'Dashboard',
  //       items: [{ title: 'Dashboard', path: PATH_AFTER_LOGIN }],
  //     },
  //   ],
  // },
];

export default navConfig;
