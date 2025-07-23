import { Container, Typography, Box, Paper } from '@mui/material';
import React from 'react';

import MermaidDiagram from '../components/MermaidDiagram.jsx';

const MermaidDemo = () => {
  const flowchartExample = `
flowchart LR
    %% Main Start → End
    Start([Start]) --> Decision1{Is data available?}

    %% Data Acquisition Subflow
    subgraph Data_Acquisition["Data Acquisition"]
      direction TB
      Fetch[/Fetch from API/]
      Clean[/Clean & Transform/]
      Store[(Store in DB)]
      Fetch --> Clean --> Store
    end
    Decision1 -- No --> Data_Acquisition

    %% Data Processing Path
    Decision1 -- Yes --> Process1[/Load Data/]
    Process1 --> Decision2{Validate Data?}
    Decision2 -- Valid --> Analyze[/Analyze Data/]
    Decision2 -- Invalid --> Error([Error Handling])
    Error --> Retry{Retry Validation?}
    Retry -- Yes --> Process1
    Retry -- No --> End([End])

    %% Analysis Subgraph + Parallel Tasks
    Analyze --> Parallel{Parallel Tasks?}
    subgraph Tasks_Group["Parallel Tasks"]
      direction TB
      TaskA["Task A<br/>(e.g. feature extraction)"]
      TaskB["Task B<br/>(e.g. model training)"]
      TaskC["Task C<br/>(e.g. visualization)"]
    end
    Parallel --> TaskA
    Parallel --> TaskB
    Parallel --> TaskC

    %% Merge and Finish
    TaskA --> Merge{All tasks done?}
    TaskB --> Merge
    TaskC --> Merge
    Merge -- Yes --> Report[/Generate Report/]
    Report --> End

    %% Styling
    classDef startend fill:#9f6,stroke:#333,stroke-width:2px;
    class Start,End startend;
    class Decision1,Decision2,Merge,Retry green;
    class Error fill:#f96,stroke:#900,stroke-width:2px;
    linkStyle 0 stroke-dasharray: 5 5;
    linkStyle 4 stroke-width:2px,stroke:orange;
`;

  const sequenceExample = `
sequenceDiagram
    participant Alice
    participant Bob
    participant John

    Alice->>John: Hello John, how are you?
    loop Healthcheck
        John->>John: Fight against hypochondria
    end
    Note right of John: Rational thoughts prevail!
    John-->>Alice: Great!
    John->>Bob: How about you?
    Bob-->>John: Jolly good!
`;

  const ganttExample = `
gantt
    title A Gantt Diagram
    dateFormat  YYYY-MM-DD
    section Section
    A task           :a1, 2014-01-01, 30d
    Another task     :after a1  , 20d
    section Another
    Task in sec      :2014-01-12  , 12d
    another task      : 24d
`;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Mermaid Diagram Demo
      </Typography>
      
      <Typography variant="body1" paragraph>
        This page demonstrates the MermaidDiagram component with fullscreen capabilities, 
        download options, and theme integration.
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Flowchart Example
        </Typography>
        <Paper elevation={1} sx={{ p: 2 }}>
          <MermaidDiagram chart={flowchartExample} />
        </Paper>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Sequence Diagram Example
        </Typography>
        <Paper elevation={1} sx={{ p: 2 }}>
          <MermaidDiagram chart={sequenceExample} />
        </Paper>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Gantt Chart Example
        </Typography>
        <Paper elevation={1} sx={{ p: 2 }}>
          <MermaidDiagram chart={ganttExample} />
        </Paper>
      </Box>
    </Container>
  );
};

export default MermaidDemo; 