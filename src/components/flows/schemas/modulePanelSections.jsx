/* eslint-disable react/display-name */
import { Stack, Tooltip, Typography, Chip } from '@mui/material';
import { capitalize } from 'lodash';
import { memo, useCallback, useMemo } from 'react';

import ExternalConnectionTypes from '../../../sections/@dashboard/flows/modulespanel/ExternalConnectionTypes.jsx';
import IconRenderer from '../../icons/IconRenderer.jsx';
import { useSettingsContext } from '../../settings/SettingsContext.jsx';

export const moduleTypes = {
  router: {
    icon: 'carbon:flow',
    name: 'Router',
    description:
      'Directs the flow of operations based on conditional logic, allowing for branching paths within the workflow. Ideal for scenarios requiring dynamic decision-making.',
    color: '#f07cd3',
  },
  action: {
    icon: 'carbon:api-1',
    name: 'Action',
    description:
      'Executes predefined actions within third-party applications. This module is crucial for workflows intended to automate tasks or processes in external systems.',
    color: '#5bb0e9',
  },
  iterator: {
    icon: '@lottie:iterator:autoplay,loop',
    name: 'Iterator',
    description:
      'For each. Repeats a set of actions for each item in a list. Use this to automate tasks on arrays or lists.',
    color: '#f07cd3',
  },
  aggregator: {
    icon: 'oui:aggregate',
    name: 'Aggregator',
    description:
      'Aggregates data fields after waiting for the completion of subexecutions from an iterator.',
    color: '#f07cd3',
  },
  search: {
    icon: 'icon-park-solid:search',
    name: 'Search',
    description:
      'Queries data from third-party applications, enabling the retrieval of specific information needed for workflow execution. Essential for workflows that depend on external data.',
    color: '#8cf07c',
  },
  internal: {
    icon: 'akar-icons:circle',
    name: 'Internal',
    description:
      'Performs operations internal to the workflow, such as variable manipulation, logging, or custom script execution. A versatile tool for enhancing workflow capabilities.',
    color: '#c09dfe',
  },
  trigger: {
    icon: 'fluent-mdl2:trigger-approval',
    name: 'Trigger',
    description:
      'Initiates a workflow based on specific events or conditions. This module acts as an entry point, responding to internal, external or scheduled triggers.',
    color: '#f9ec7d',
  },
  // octopus: {
  //   icon: "streamline:octopus",
  //   name: "Octopus",
  //   description: "Enables multiple path convergence into one path.",
  //   module: "octopus",
  //   color: "#aaaaaa"
  // },
  // response: {
  //   icon: "ic:outline-reply",
  //   name: "Reponse",
  //   description: "Enables the workflow to return a response payload.",
  //   module: "response",
  //   color: "#aaaaaa"
  // },
};

export const modulesPanelSchema = {
  title: 'What happens next?',
  icon: 'line-md:compass-twotone-loop',
  sections: {
    FlowControl: {
      icon: 'fluent:flow-16-regular',
      title: 'Flow Builders',
      description:
        'Enables the construction and management of complex workflow logic, facilitating conditional operations, loops, and event-driven triggers.',
      sections: {
        'AI Agent': {
          icon: 'hugeicons:ai-brain-04',
          description: "Enables AI Agents' help with complex problems.",
          module: 'internal',
          args: {
            internal_type: 'aigent',
          },
        },
        Router: {
          icon: 'tabler:git-branch',
          description:
            'Directs workflow paths conditionally, allowing for dynamic decision-making. Executes only the path of the first condition that is met, ignoring subsequent conditions.',
          module: 'router',
          args: {
            router_mode: 'exclusive',
          },
        },
        Brancher: {
          icon: 'uil:code-branch',
          description:
            'Branches the workflow path. Every condition is checked and, if successful, the path is executed.',
          module: 'router',
          args: {
            router_mode: 'standard',
          },
        },
        Iterator: {
          icon: 'mdi:reiterate',
          description:
            'Iterates over collections to apply actions on each element, automating repetitive tasks within the workflow.',
          module: 'iterator',
        },
        Aggregator: {
          icon: 'oui:aggregate',
          description:
            'Merges iteration outputs into a single collection. Accumulates outputs from previous iterations and exposes an array of those outputs.',
          module: 'aggregator',
        },
        Trigger: {
          icon: 'fluent-mdl2:trigger-approval',
          description:
            "Activates workflows in response to specific events or conditions, serving as the workflow's entry point.",
          module: 'trigger',
        },
        Code: {
          icon: 'mdi:code',
          description: 'Enables executing code in a sandboxed environment.',
          module: 'internal',
          args: {
            internal_type: 'code',
          },
        },
        'Set Variables': {
          icon: 'mdi:variable',
          description:
            'Enables reusing variables across different modules, without needing to compute their value again. Acts as a cache for your workflow. It also enables the workflow to be dynamic when being cloned.',
          module: 'internal',
          args: {
            internal_type: 'vars',
          },
        },
        'Invoke Flow': {
          icon: 'fluent:target-24-filled', // "solar:black-hole-2-line-duotone",// "hugeicons:workflow-square-07"
          description: 'Calls another workflow with a desired payload',
          module: 'internal',
          args: {
            internal_type: 'invoke',
          },
        },
        Response: {
          icon: 'ic:outline-reply',
          description: 'Enables the workflow to return a response payload.',
          module: 'internal',
          args: {
            internal_type: 'response',
          },
        },
        Octopus: {
          icon: 'streamline:octopus',
          description: 'Enables multiple path convergence into one path.',
          module: 'internal',
          args: {
            internal_type: 'octopus',
          },
        },
        'Altaner Settings': {
          icon: 'optimai',
          description:
            'Use only in the installation workflow of an Altaner. Enables overriding default settings based on installation wizard.',
          module: 'internal',
          args: {
            internal_type: 'altaner',
          },
        },
      },
    },
    Search: {
      title: 'Search in...',
      icon: 'icon-park-solid:search',
      description:
        'Queries third-party applications for specific data, essential for workflows that depend on external information.',
      module: 'search',
      sections: (props) => (
        <ExternalConnectionTypes
          mode="search"
          {...props}
        />
      ),
    },
    MyApps: {
      title: 'Projects',
      icon: 'mdi:package-variant-closed',
      description: 'Execute actions in my custom integrations',
      module: 'action',
      sections: (props) => (
        <ExternalConnectionTypes
          mode="custom_apps"
          {...props}
        />
      ),
    },
  },
};

const iconMappings = {
  _discriminator: 'type',
  default: { icon: '@lottie:plus_circle', fallback: '@lottie-still:plus_circle' },
  trigger: {
    _discriminator: 'trigger_type',
    scheduled: { icon: '@lottie:clock_scheduled', fallback: '@lottie-still:clock_scheduled' },
    instant: { icon: '@lottie:lightning', fallback: '@lottie-still:lightning' },
    internal: {
      icon: '@lottie:trigger_source',
      fallback: '@lottie-still:trigger_source',
      darkFallback: '@lottie-still:trigger_source__dark',
    },
    default: { icon: '@lottie:plus_circle', fallback: '@lottie-still:plus_circle' },
  },
  internal: {
    _discriminator: 'internal_type',
    octopus: { icon: '@lottie:octopus', fallback: '@lottie-still:octopus' },
    aigent: { icon: '@lottie:activate_ai_aigent', fallback: '@lottie-still:activate_ai_aigent' },
    response: { icon: '@lottie:webhook_response', fallback: '@lottie-still:webhook_response' },
    vars: { icon: '@lottie:internal_vars', fallback: '@lottie-still:internal_vars' },
    invoke: { icon: '@lottie:flow', fallback: '@lottie-still:flow' },
    altaner: { icon: 'optimai', fallback: 'optimai' },
    code: {
      _discriminator: 'logic.language',
      python: { icon: '@lottie-still:code_python', fallback: '@lottie-still:code_python' },
      java: { icon: '@lottie:custom_code', fallback: '@lottie-still:code_java' },
      c: { icon: '@lottie:custom_code', fallback: '@lottie-still:code_c' },
      default: { icon: '@lottie:custom_code', fallback: '@lottie-still:custom_code' },
    },
  },
  router: {
    _discriminator: 'meta_data.router_mode',
    exclusive: {
      icon: '@lottie-still:router_exclusive',
      fallback: '@lottie-still:router_exclusive',
    },
    default: { icon: '@lottie:router_inclusive', fallback: '@lottie-still:router_inclusive' },
  },
  action: {
    _dynamic: (module) =>
      module.tool?.action_type?.meta_data?.icon ||
      module.tool?.action_type?.connection_type?.icon ||
      '@lottie-still:rest_api',
  },
  search: {
    _dynamic: (module) => module.tool?.action_type?.connection_type?.icon || '@lottie:magnifier',
  },
  iterator: {
    icon: '@lottie:iterator',
    fallback: '@lottie-still:iterator',
  },
  aggregator: {
    icon: '@lottie:aggregator:rotate(270)',
  },
};

const resolveIcon = (mappings, module) => {
  let currentLevel = mappings;
  while (currentLevel) {
    if (currentLevel._dynamic) {
      return { icon: currentLevel._dynamic(module) };
    }
    if (currentLevel._discriminator) {
      const path = currentLevel._discriminator.split('.');
      const key = path.reduce((obj, segment) => obj?.[segment], module);
      // console.log("key", module, key);
      currentLevel = currentLevel[key] || currentLevel.default;
    } else {
      break;
    }
  }
  return currentLevel || mappings.default;
};

export const ModuleIcon = memo(({ module, size = 50, animationMode = 'autoplay,loop' }) => {
  // console.log('module', module);
  const { animations } = useSettingsContext();
  const { themeMode } = useSettingsContext();

  const animationEnabled = animations.all && animations.flows;

  const appendAnimation = useCallback(
    (baseIcon) => {
      if (!baseIcon) {
        return '';
      }
      const icon = themeMode === 'dark' && baseIcon.darkIcon ? baseIcon.darkIcon : baseIcon.icon;
      if (!icon.startsWith('@lottie:') || icon.endsWith(':hover')) {
        return icon;
      }
      const fallback =
        themeMode === 'dark' && baseIcon.darkFallback ? baseIcon.darkFallback : baseIcon.fallback;
      return animationEnabled || !fallback ? `${icon}:${animationMode}` : fallback;
    },
    [animationEnabled, animationMode, themeMode],
  );

  const icon = useMemo(() => {
    const resolved = resolveIcon(iconMappings, module);
    return appendAnimation(resolved);
  }, [module, appendAnimation]);
  // console.log('icon', icon);
  return (
    <IconRenderer
      icon={icon}
      size={size}
    />
  );
});

// export const ModuleIcon = memo(({
//   module,
//   size = 50,
//   animationMode = 'autoplay,loop',
//   animationEnabled = true
// }) => {
//   const icon = useMemo(() => {
//     if (!module.type) {
//       return "@lottie:plus_circle:hover";
//     }
//     if (module.type === "trigger") {
//       if (!module.trigger_type) {
//         return "@lottie:plus_circle:hover";
//       }
//       return module.trigger_type === 'scheduled'
//         ? "@lottie:clock_scheduled:autoplay,loop"
//         : (
//           module.trigger_type === 'instant'
//           ? "@lottie:lightning:autoplay,loop"
//           : "pajamas:trigger-source"
//         );
//     }
//     if (module.type === "internal") {
//       if (module.internal_type === "octopus") {
//         return "@lottie:octopus:autoplay,loop";
//       }
//       if (module.internal_type === "aigent") {
//         return "@lottie:activate_ai_aigent:autoplay,loop";
//       }
//       if (module.internal_type === "response") {
//         return "@lottie:webhook_response:autoplay,loop";
//       }
//       if (module.internal_type === "vars") {
//         return "@lottie:internal_vars:autoplay,loop";
//       }
//       if (module.internal_type === "invoke") {
//         return "@lottie:flow:autoplay,loop";
//       }
//       if (module.internal_type === "altaner") {
//         return "optimai";
//       }
//       if (module.internal_type === "code") {
//         if (module.logic?.language === "python") {
//           return "@lottie:code_python:autoplay,loop";
//         }
//         if (module.logic?.language === "java") {
//           return "@lottie:custom_code:autoplay,loop";
//         }
//         if (module.logic?.language === "c") {
//           return "@lottie:custom_code:autoplay,loop";
//         }
//         // if (module.logic?.language === "c++") {
//         //   return "@lottie:custom_code:autoplay,loop";
//         // }
//         // if (module.logic?.language === "javascript") {
//         //   return "@lottie:custom_code:autoplay,loop";
//         // }
//         return "@lottie:custom_code:autoplay,loop";
//       }
//     }
//     if (["action", "search"].includes(module.type)) {
//       return module.tool?.action_type?.connection_type?.icon;
//     }
//     if (module.type === "router") {
//       return module.meta_data?.router_mode !== "standard" ? "@lottie:router_exclusive:autoplay,loop" : "@lottie:router_inclusive:autoplay,loop"
//     }
//     return moduleTypes[module.type]?.icon ?? "@lottie:plus_circle:hover";
//   }, [module]);

//   return (
//     <IconRenderer icon={icon} size={size} />
//   );
// });

export const ModuleName = memo(({ module, sx, onDoubleClick }) => {
  const name = useMemo(() => {
    if (
      module.type === 'internal' &&
      module.internal_type === 'code' &&
      ['java', 'c', 'python'].includes(module.logic?.language)
    ) {
      return module.logic.language;
    }
    if (module.type === 'trigger') {
      return capitalize(module.trigger_type);
    }
    if (['action', 'search'].includes(module.type)) {
      const rawName = module.tool?.name ?? module.tool?.action_type?.name ?? module.type;
      return rawName
        .split('.')
        .map((p) => capitalize(p.replace('_', ' ')))
        .join(' ');
    }
    return null;
  }, [module]);

  const tooltipTitle = useMemo(() => {
    let tempName = name;
    if (['action', 'search'].includes(module.type) && module.tool?.action_type) {
      tempName = `(${module.tool.action_type.method}) ${module.tool.action_type.description}`;
    }
    return !!onDoubleClick ? `${tempName} (Double click to copy module ID)` : tempName;
  }, [module.tool?.action_type, module.type, name, onDoubleClick]);

  if (!name) {
    return null;
  }
  return (
    <>
      <Tooltip
        title={tooltipTitle}
        arrow
      >
        <Typography
          noWrap
          sx={{ maxWidth: 150, ...(sx || {}) }}
          onDoubleClick={onDoubleClick}
        >
          {module?.tool?.action_type?.name || name || ' '}
        </Typography>
      </Tooltip>
    </>
  );
});

function formatName(name) {
  if (typeof name === 'string') {
    return name.replace(/^\[\w+\]\s*/, ''); // Regular expression to remove any prefix like '[xxx] '
  }
  return null; // Return an empty string if name is undefined or not a string
}

export const ModuleType = memo(
  ({ module, variant = 'h6', spacing = 1, typographySx = null, ...other }) => {
    const type = useMemo(() => {
      if (module.type === 'internal') {
        return capitalize(module.internal_type);
      }
      if (['action', 'search'].includes(module.type)) {
        const connName = module?.tool?.action_type?.connection_type?.name;
        if (!!connName) {
          return formatName(connName);
        }
      }
      if (module.type === 'router') {
        return module.meta_data?.router_mode !== 'standard' ? 'Router' : 'Brancher';
      }
      return capitalize(module.type);
    }, [
      module.internal_type,
      module.meta_data?.router_mode,
      module?.tool?.action_type?.connection_type?.name,
      module.type,
    ]);

    return (
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="left"
        spacing={spacing}
        {...other}
      >
        <Typography
          variant={variant}
          noWrap
          sx={typographySx}
        >
          {module?.meta_data?.name || type}
        </Typography>
        <Chip
          label={module.position}
          size="small"
        />
      </Stack>
    );
  },
);
