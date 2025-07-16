// Altan's official agent template IDs that should be hidden when cloned
export const ALTAN_AGENT_TEMPLATE_IDS = [
  '7940a92d-408b-436f-b20f-f6d32157b85c',
  'eb56b4e6-43c5-44a1-8069-3128d73cf316',
  'e82825bb-6bae-44a8-9a9a-69b764e911e2',
  'dd98ccf1-6f19-443d-8280-25c4a02ff6af',
  'ab256fa1-a208-4fe3-952a-763f5192abff',
  '6294a285-5ddc-4fa9-b56d-4131150d6d51',
  'db4ad3c2-cec6-4488-a690-3b28f36156f0',
  '8bd78a71-23a8-4704-b21b-a10de4e37e05',
  'b61e1737-a5fe-4128-b28a-832a781aa2a7',
  'f1dfb827-ce32-49ab-86fa-fae485958096',
];

// Helper function to check if an agent should be hidden
export const shouldHideClonedAgent = (agent) => {
  return (
    agent?.cloned_from?.version?.template_id &&
    ALTAN_AGENT_TEMPLATE_IDS.includes(agent.cloned_from.version.template_id)
  );
}; 