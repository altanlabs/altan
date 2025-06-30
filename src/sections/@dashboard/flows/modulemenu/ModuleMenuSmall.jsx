import { Stack } from '@mui/material';
import { memo } from 'react';
// import { useSelector } from "../../../../redux/store";
// import ModuleCard from "../../../../components/flows/ModuleCard";
// import { capitalize } from "lodash";
// import ModuleInput from "./input/ModuleInput";
// import ModuleOutput from "./ouput/ModuleOutput";

// const SECTIONS = ["input", "module"];//, "output"];

const ModuleMenuSmall = () => {
  // const [selectedSection, setSelectedSection] = useState(SECTIONS[1]);

  // const moduleInMenu = useSelector((state) => state.flows.menuModule);

  return (
    <Stack
      spacing={1}
      width="100%"
      height="100%"
      alignItems="center"
      justifyContent="center"
      maxWidth="750px"
    >
      {/* <ToggleButtonGroup
        size="small"
        value={selectedSection}
        exclusive
        onChange={(e, section) => setSelectedSection(section)}
        aria-label="Option"
      >
        {
          SECTIONS.map((section) => (
            <ToggleButton key={section} value={section} aria-label="Fill">
              { capitalize(section) }
            </ToggleButton>
          ))
        }
      </ToggleButtonGroup> */}
      {/* <Box
        sx={{
          height: '90%',
          width: '100%',
          ...selectedSection !== "input" && {
            display: 'none'
          }
        }}
      >
        {/* <ModuleInput /> */}
      {/* </Box> */}
      {/* <Box
        sx={{
          height: '100%',
          // ...selectedSection !== "module" && {
          //   display: 'none'
          // }
          width: '100%',
          maxWidth: '800px'
        }}
      > */}
      {/* <ModuleCard { ...moduleInMenu } /> */}
      {/* </Box> */}
      {/* <Box
        sx={{
          ...selectedSection !== "output" && {
            display: 'none'
          }
        }}
      >
        <ModuleOutput />
      </Box> */}
    </Stack>
  );
};

export default memo(ModuleMenuSmall);
