import React, { useEffect, memo } from 'react';
import { useFormContext } from 'react-hook-form';

import FlowToolCard from '../../../tools/FlowToolCard.jsx';

const ToolModule = ({ module, schema }) => {
  const { setValue } = useFormContext();

  useEffect(() => {
    if (!!module?.tool?.parameters && Object.keys(module.tool.parameters).length) {
      setValue('tool.parameters', module.tool.parameters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [module?.tool?.parameters]);

  return <FlowToolCard moduleSchema={schema} />;
};

export default memo(ToolModule);

// const getData = async () => {
//   const { logic, ...restModuleState } = moduleState;
//   const toolParameters = watch();
//   const formattedToolParameters = {}
//   try {
//     Object.entries(toolParameters).forEach(([key, value]) => {
//       if (!!value && typeof value === "string" && !!["object", "array"].includes(allProperties[key].type)) {
//         formattedToolParameters[key] = JSON.parse(value);
//       } else {
//         formattedToolParameters[key] = value;
//       }
//     });
//     const data = {
//       // TODO: handle select exisiting tool. maybe
//       module: {
//         ...restModuleState,
//         tool: {
//           name: tool.name,
//           description: tool.description,
//           parameters: formattedToolParameters,
//           action_type_id: tool.action_type.id,
//           connection_id: tool.connection_id,
//         },
//         type: mode
//       }
//     };

//     if (logic && mode === "search") {
//       data.module.logic = (logic instanceof Object) ? logic : JSON.parse(logic);
//     }
//     return Promise.resolve(data);
//   } catch (e) {
//     enqueueSnackbar(`Error updating tool: ${e.toString()}`, {variant: 'error' });
//     return Promise.reject(e.toString());
//   }
// };
