import React, { memo } from 'react';

import CoolCard from './CoolCard';

// Define individual components for each asset type:

function FormCard({ form }) {
  return (
    <CoolCard
      // icon="mdi:form"
      name={form.name}
      description={form.description}
      // actions={[
      //   {
      //     icon: "ic:twotone-tune",
      //     onClick: null,
      //     tooltip: "Preview"
      //   }
      // ]}
    />
  );
}

function FlowCard({ flow }) {
  return (
    <CoolCard
      // icon="hugeicons:workflow-square-10"
      name={flow.name}
      description={flow.description}
      // actions={[
      //   {
      //     icon: "ic:twotone-tune",
      //     onClick: null,
      //     tooltip: "Preview"
      //   }
      // ]}
    />
  );
}

function AgentCard({ agent }) {
  // const theme = useTheme();
  return (
    <CoolCard
      // icon={agent.avatar_url ?? "icon-park-twotone:user"}
      name={agent.name}
      description={`${agent.commands?.length ?? 0} commands. (${agent.commands?.reduce((acc, command) => acc + command.tokens, 0)} tokens)`}
      subDescription={agent.description}
      // actions={[
      //   {
      //     icon: "ic:twotone-tune",
      //     onClick: null,
      //     tooltip: JSON.stringify(agent.llm_config, null, 2)
      //   }
      // ]}
    />
  );
}

const AssetCard = ({ type, asset }) => {
  switch (type) {
    case 'agents':
      return <AgentCard agent={asset} />;
    case 'flows':
      return <FlowCard flow={asset} />;
    // case 'connections':
    //   return <ConnectionCard connection={asset} />;
    // Add cases for other asset types if needed
    default:
      return null;
  }
};

export default memo(AssetCard);
