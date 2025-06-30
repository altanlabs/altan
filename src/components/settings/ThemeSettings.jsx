import PropTypes from 'prop-types';

import ThemeColorPresets from './ThemeColorPresets.jsx';
import ThemeContrast from './ThemeContrast.jsx';
import ThemeRtlLayout from './ThemeRtlLayout.jsx';
// import SettingsDrawer from './drawer';

// ----------------------------------------------------------------------

ThemeSettings.propTypes = {
  children: PropTypes.node,
};

export default function ThemeSettings({ children }) {
  return (
    <ThemeColorPresets>
      <ThemeContrast>
        <ThemeRtlLayout>
          {children}
          {/* <SettingsDrawer /> */}
        </ThemeRtlLayout>
      </ThemeContrast>
    </ThemeColorPresets>
  );
}
