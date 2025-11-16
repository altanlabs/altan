import PropTypes from 'prop-types';

// ----------------------------------------------------------------------

export default function CompactLayout({ children }) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center overflow-hidden bg-white dark:bg-neutral-950">
      {children}
    </div>
  );
}

CompactLayout.propTypes = {
  children: PropTypes.node,
};
