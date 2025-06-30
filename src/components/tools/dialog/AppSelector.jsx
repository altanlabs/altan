import { Grid } from '@mui/material';
import { memo } from 'react';

import ConnectionAppCard from '../ConnectionAppCard';

const AppSelector = ({ theme, apps, onSelectApp }) => (
  <Grid container>
    {apps.map((item) => (
      <Grid
        item
        xs={12}
        sm={6}
        md={4}
        key={item.id}
        padding={0.5}
      >
        <ConnectionAppCard
          connOrApp={item}
          theme={theme}
          onClick={() => onSelectApp(item)}
        />
      </Grid>
    ))}
  </Grid>
);

export default memo(AppSelector);
