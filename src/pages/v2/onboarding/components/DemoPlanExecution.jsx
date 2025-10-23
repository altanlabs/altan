import { m } from 'framer-motion';
import React, { useState, useEffect, memo } from 'react';

import DemoPlanExecutionTask from './DemoPlanExecutionTask';
import Iconify from '../../../../components/iconify/Iconify';

const DemoPlanExecution = ({ plan, onBuildComplete, isBuildComplete }) => {
  const [animatedTasks, setAnimatedTasks] = useState(
    plan.tasks.map((t) => ({ ...t, status: 'to-do' })),
  );
  const [expandedTasks, setExpandedTasks] = useState(new Set());

  const agentAvatars = {
    Genesis:
      'https://api.altan.ai/platform/media/a4ac5478-b3ae-477d-b1eb-ef47e710de7c?account_id=9d8b4e5a-0db9-497a-90d0-660c0a893285',
    Interface:
      'https://api.altan.ai/platform/media/2262e664-dc6a-4a78-bad5-266d6b836136?account_id=8cd115a4-5f19-42ef-bc62-172f6bff28e7',
    Cloud:
      'https://api.altan.ai/platform/media/56a7aab7-7200-4367-856b-df82b6fa3eee?account_id=9d8b4e5a-0db9-497a-90d0-660c0a893285',
    Services:
      'https://api.altan.ai/platform/media/22ed3f84-a15c-4050-88f0-d33cc891dc50?account_id=9d8b4e5a-0db9-497a-90d0-660c0a893285',
  };

  // Subtasks for each main task (matching the AI Customer Support Hub use case)
  const taskSubtasks = {
    '1': [
      {
        id: 'sub1-1',
        name: 'create_agent',
        status: 'pending',
        tool: 'genesis',
        icon: 'mdi:robot',
        args: 'Creating Support Agent with empathetic personality...',
        result: '✓ AI Support Agent created with voice capabilities',
        code: `agent = Agent(
  name="Support Agent",
  model="claude-sonnet-4",
  voice_enabled=true,
  personality="empathetic"
)`,
      },
      {
        id: 'sub1-2',
        name: 'create_agent',
        status: 'pending',
        tool: 'genesis',
        icon: 'mdi:robot',
        args: 'Creating Sales Qualification Agent...',
        result: '✓ Sales Agent created with lead scoring',
        code: `agent = Agent(
  name="Sales Agent",
  model="claude-sonnet-4",
  capabilities=["qualification"]
)`,
      },
      {
        id: 'sub1-3',
        name: 'create_agent',
        status: 'pending',
        tool: 'genesis',
        icon: 'mdi:robot',
        args: 'Creating Technical Agent...',
        result: '✓ Technical Agent created with knowledge base',
        code: `agent = Agent(
  name="Technical Agent",
  knowledge_base="technical_docs"
)`,
      },
      {
        id: 'sub1-4',
        name: 'create_agent',
        status: 'pending',
        tool: 'genesis',
        icon: 'mdi:robot',
        args: 'Creating Escalation Agent...',
        result: '✓ Escalation Agent created with routing logic',
        code: `agent = Agent(
  name="Escalation Agent",
  capabilities=["routing"]
)`,
      },
    ],
    '2': [
      {
        id: 'sub2-0',
        name: 'activate_cloud',
        status: 'pending',
        tool: 'cloud',
        icon: 'material-symbols:cloud',
        args: 'Activating Altan Cloud infrastructure...',
        result: '✓ Cloud activated with Postgres, Auth, and Storage',
        code: null,
      },
      {
        id: 'sub2-1',
        name: 'execute_sql',
        status: 'pending',
        tool: 'cloud',
        icon: 'mdi:database',
        args: 'Creating tickets, customers, conversations tables...',
        result: '✓ 5 tables created: tickets, customers, agents, conversations, analytics',
        code: `CREATE TABLE tickets (
  id UUID PRIMARY KEY,
  customer_id UUID REFERENCES customers,
  status TEXT,
  priority TEXT,
  assigned_agent TEXT,
  created_at TIMESTAMP
);`,
      },
      {
        id: 'sub2-2',
        name: 'execute_sql',
        status: 'pending',
        tool: 'cloud',
        icon: 'mdi:shield-lock',
        args: 'Setting up Row Level Security for multi-tenant access...',
        result: '✓ RLS policies enabled for secure data isolation',
        code: `CREATE POLICY tenant_isolation ON tickets
  USING (auth.uid() = customer_id);`,
      },
      {
        id: 'sub2-3',
        name: 'execute_sql',
        status: 'pending',
        tool: 'cloud',
        icon: 'mdi:chart-line',
        args: 'Creating analytics views for metrics dashboard...',
        result: '✓ Views created: ticket_stats, response_times, satisfaction_scores',
        code: `CREATE VIEW ticket_stats AS
  SELECT status, COUNT(*) as count,
         AVG(resolution_time) as avg_time
  FROM tickets GROUP BY status;`,
      },
    ],
    '3': [
      {
        id: 'sub3-1',
        name: 'write_file',
        status: 'pending',
        tool: 'interface',
        icon: 'mdi:code-braces',
        args: 'Creating TicketBoard.jsx component...',
        result: '✓ Live ticket board with drag & drop',
        code: `export default function TicketBoard() {
  const { tickets } = useRealtime('tickets');
  return <KanbanBoard data={tickets} />;
}`,
      },
      {
        id: 'sub3-2',
        name: 'write_file',
        status: 'pending',
        tool: 'interface',
        icon: 'mdi:chat',
        args: 'Creating AI ChatWidget.jsx with voice...',
        result: '✓ AI chat widget with voice interface integrated',
        code: `<AIChatWidget 
  agentId="support-agent"
  voiceEnabled={true}
  theme="dark"
/>`,
      },
      {
        id: 'sub3-3',
        name: 'write_file',
        status: 'pending',
        tool: 'interface',
        icon: 'mdi:chart-box',
        args: 'Building Analytics.jsx dashboard...',
        result: '✓ Real-time analytics with charts and metrics',
        code: `<Dashboard>
  <MetricCard title="Avg Response" />
  <SatisfactionChart />
  <AgentPerformance />
</Dashboard>`,
      },
    ],
    '4': [
      {
        id: 'sub4-1',
        name: 'create_service',
        status: 'pending',
        tool: 'services',
        icon: 'mdi:slack',
        args: 'Deploying Slack webhook service...',
        result: '✓ Slack notifications active for urgent tickets',
        code: `@router.post("/notify")
async def send_slack(ticket: Ticket):
  if ticket.priority == "urgent":
    await slack.send(ticket)`,
      },
      {
        id: 'sub4-2',
        name: 'create_service',
        status: 'pending',
        tool: 'services',
        icon: 'mdi:brain',
        args: 'Creating AI auto-categorization endpoint...',
        result: '✓ Smart ticket categorization running',
        code: `@router.post("/categorize")
async def categorize(text: str):
  category = await ai.classify(text)
  return {"category": category}`,
      },
      {
        id: 'sub4-3',
        name: 'create_cron',
        status: 'pending',
        tool: 'services',
        icon: 'mdi:clock-outline',
        args: 'Setting up stale ticket escalation job...',
        result: '✓ Hourly cron job monitoring ticket age',
        code: `@router.cron("0 * * * *")
async def escalate_stale():
  old_tickets = await find_stale()
  await auto_escalate(old_tickets)`,
      },
    ],
  };

  const [subtasks, setSubtasks] = useState(taskSubtasks);
  const [executionPhase, setExecutionPhase] = useState('idle'); // idle, phase1, phase2, phase3, phase4

  // Phase 1: Start Genesis & Cloud in parallel
  useEffect(() => {
    if (executionPhase === 'idle') {
      setTimeout(() => {
        setAnimatedTasks((prev) =>
          prev.map((t, i) => (i === 0 || i === 1 ? { ...t, status: 'running' } : t)),
        );
        setExpandedTasks(new Set(['1', '2']));
        setExecutionPhase('phase1');
      }, 500);
    }
  }, [executionPhase]);

  // Execute subtasks for all running tasks
  useEffect(() => {
    const runningTasks = animatedTasks.filter((t) => t.status === 'running');
    if (runningTasks.length === 0) return;

    const timers = [];

    runningTasks.forEach((task) => {
      const currentTaskSubtasks = subtasks[task.id] || [];
      const nextSubtaskIndex = currentTaskSubtasks.findIndex(
        (st) => st.status === 'pending',
      );

      if (nextSubtaskIndex !== -1) {
        const timer = setTimeout(
          () => {
            // Start subtask
            setSubtasks((prev) => ({
              ...prev,
              [task.id]: prev[task.id].map((st, idx) =>
                idx === nextSubtaskIndex ? { ...st, status: 'running' } : st,
              ),
            }));

            // Complete subtask
            setTimeout(() => {
              setSubtasks((prev) => ({
                ...prev,
                [task.id]: prev[task.id].map((st, idx) =>
                  idx === nextSubtaskIndex ? { ...st, status: 'completed' } : st,
                ),
              }));
            }, 1200);
          },
          nextSubtaskIndex === 0 ? 500 : 800,
        );
        timers.push(timer);
      }
    });

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [animatedTasks, subtasks]);

  // Check for task completion and transition to next phase
  useEffect(() => {
    const task1 = animatedTasks[0];
    const task2 = animatedTasks[1];
    const task3 = animatedTasks[2];
    const task4 = animatedTasks[3];

    const task1Subtasks = subtasks['1'] || [];
    const task2Subtasks = subtasks['2'] || [];
    const task3Subtasks = subtasks['3'] || [];
    const task4Subtasks = subtasks['4'] || [];

    const task1Complete = task1Subtasks.every((st) => st.status === 'completed');
    const task2Complete = task2Subtasks.every((st) => st.status === 'completed');
    const task3Complete = task3Subtasks.every((st) => st.status === 'completed');
    const task4Complete = task4Subtasks.every((st) => st.status === 'completed');

    // Phase 1 → Phase 2: Both Genesis and Cloud complete
    if (
      executionPhase === 'phase1' &&
      task1.status === 'running' &&
      task2.status === 'running' &&
      task1Complete &&
      task2Complete
    ) {
      setTimeout(() => {
        setAnimatedTasks((prev) =>
          prev.map((t, i) => (i === 0 || i === 1 ? { ...t, status: 'completed' } : t)),
        );
        setExpandedTasks((prev) => {
          const newSet = new Set(prev);
          newSet.delete('1');
          newSet.delete('2');
          return newSet;
        });

        // Start Interface
        setTimeout(() => {
          setAnimatedTasks((prev) => prev.map((t, i) => (i === 2 ? { ...t, status: 'running' } : t)));
          setExpandedTasks((prev) => new Set([...prev, '3']));
          setExecutionPhase('phase2');
        }, 500);
      }, 800);
    }

    // Phase 2 → Phase 3: Interface complete
    if (executionPhase === 'phase2' && task3.status === 'running' && task3Complete) {
      setTimeout(() => {
        setAnimatedTasks((prev) => prev.map((t, i) => (i === 2 ? { ...t, status: 'completed' } : t)));
        setExpandedTasks((prev) => {
          const newSet = new Set(prev);
          newSet.delete('3');
          return newSet;
        });

        // Start Services
        setTimeout(() => {
          setAnimatedTasks((prev) => prev.map((t, i) => (i === 3 ? { ...t, status: 'running' } : t)));
          setExpandedTasks((prev) => new Set([...prev, '4']));
          setExecutionPhase('phase3');
        }, 500);
      }, 800);
    }

    // Phase 3 → Done: Services complete
    if (executionPhase === 'phase3' && task4.status === 'running' && task4Complete) {
      setTimeout(() => {
        setAnimatedTasks((prev) => prev.map((t, i) => (i === 3 ? { ...t, status: 'completed' } : t)));
        setExpandedTasks((prev) => {
          const newSet = new Set(prev);
          newSet.delete('4');
          return newSet;
        });
        setExecutionPhase('done');

        // Notify parent that build is complete
        setTimeout(() => {
          if (onBuildComplete) {
            onBuildComplete();
          }
        }, 1000);
      }, 800);
    }
  }, [executionPhase, animatedTasks, subtasks, onBuildComplete]);

  const completedCount = animatedTasks.filter((t) => t.status === 'completed').length;
  const progress = (completedCount / animatedTasks.length) * 100;
  const allTasksCompleted = completedCount === animatedTasks.length || isBuildComplete;

  // When build complete, show only iframe (styled exactly like Preview.jsx)
  if (allTasksCompleted || isBuildComplete) {
    return (
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full h-full relative flex items-center justify-center"
      >
        <div className="w-full h-full flex justify-center items-stretch">
          <div className="w-full h-full relative overflow-hidden">
            <iframe
              id="demo-preview-iframe"
              src="https://f2beac-new-app.altanlabs.com/"
              allow="clipboard-read; clipboard-write; fullscreen; camera; microphone; geolocation; payment; accelerometer; gyroscope; usb; midi; cross-origin-isolated; gamepad; xr-spatial-tracking; magnetometer; screen-wake-lock; autoplay"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                display: 'block',
              }}
              title="AI Customer Support Hub"
            />
          </div>
        </div>
      </m.div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-700/50">
        <div className="flex items-center gap-3">
          <Iconify
            icon="mdi:road-variant"
            className="w-7 h-7 text-blue-400"
          />
          <h1 className="text-2xl font-bold text-white">{plan.title}</h1>
        </div>
        {plan.description && <p className="mt-2 text-sm text-gray-400">{plan.description}</p>}
      </div>

      {/* Progress */}
      <div className="px-6 py-4 border-b border-gray-700/50 bg-gray-900/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-300">Progress</span>
          <span className="text-sm font-bold text-blue-400">
            {completedCount} of {animatedTasks.length} completed
          </span>
        </div>
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
          <m.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Tasks */}
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-gray-700/50">
          {animatedTasks.map((task) => {
            const isExpanded = expandedTasks.has(task.id);
            const taskSubtasks = subtasks[task.id] || [];

            return (
              <DemoPlanExecutionTask
                key={task.id}
                task={task}
                subtasks={taskSubtasks}
                isExpanded={isExpanded}
                agentAvatars={agentAvatars}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default memo(DemoPlanExecution);
