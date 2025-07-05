import PublicApps from '../../sections/@dashboard/PublicApps';

export default function OverallActivityPage() {
  return (
    <div
      style={{
        height: 'calc(100vh - 46px)', // Full viewport height minus header
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <PublicApps />
    </div>
  );
}
