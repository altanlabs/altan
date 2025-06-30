// import { LoadingButton } from '@mui/lab';
// import {
//   Dialog,
//   Box,
//   Typography,
//   Autocomplete,
//   TextField,
//   FormControl,
//   Stack,
//   Chip,
//   IconButton,
//   Paper,
//   ButtonGroup,
//   Slider,
// } from '@mui/material';
// import { throttle } from 'lodash';
// import { useState, useEffect, memo, useCallback } from 'react';
// import { encoding_for_model } from 'tiktoken';

// import { PERSONALITY, oceanTraits } from './personality';
// import InfoModal from '../../../components/helpers/InfoModal';
// import Iconify from '../../../components/iconify/Iconify';
// import useFeedbackDispatch from '../../../hooks/useFeedbackDispatch';
// import { createCommand, addAgentCommand } from '../../../redux/slices/general';
// import { optimai_root } from '../../../utils/axios';
// import Each from '../../../utils/each';

// function convertCamelCase(str) {
//   let result = str.replace(/([A-Z])/g, ' $1');
//   result = result.charAt(0).toUpperCase() + result.slice(1);
//   return result;
// }

// const SliderWithLabels = ({ variable, left, right, color, value, onChange }) => {
//   const handleSliderChange = useCallback(
//     (event, newValue) => {
//       onChange(variable.replace(/\s+/g, '').toLowerCase(), newValue);
//     },
//     [variable, onChange],
//   );

//   return (
//     <Box>
//       <Box
//         display="flex"
//         justifyContent="space-between"
//         mb={1}
//       >
//         <Typography
//           variant="caption"
//           style={{ minWidth: 'max-content' }}
//         >
//           {left}
//         </Typography>
//         <Typography
//           variant="subtitle2"
//           style={{ margin: '0 auto' }}
//         >
//           {variable}
//         </Typography>
//         <Typography
//           variant="caption"
//           style={{ minWidth: 'max-content' }}
//         >
//           {right}
//         </Typography>
//       </Box>
//       <Slider
//         value={value}
//         onChange={handleSliderChange}
//         min={-1}
//         max={1}
//         step={0.01}
//         valueLabelDisplay="auto"
//         sx={{
//           color: color || 'inherit',
//         }}
//       />
//     </Box>
//   );
// };

// const PersonalityEditor = ({ open, onClose, onSave, mode = 'create', agentId = null }) => {
//   const [formState, setFormState] = useState({});
//   const [personalityPrompt, setPersonalityPrompt] = useState('');
//   const [tokens, setTokens] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [dispatchWithFeedback] = useFeedbackDispatch();
//   const [command, setCommand] = useState({
//     name: '',
//     content: '',
//     tokens: 0,
//     configuration: {},
//     is_public: false,
//   });

//   useEffect(() => {
//     if (open) {
//       setCommand({
//         name: '',
//         content: '',
//         tokens: 0,
//         configuration: {},
//         is_public: false,
//       });
//     }
//   }, [open]);

//   const recalculateTokens = throttle(() => {
//     if (personalityPrompt) {
//       const encoder = encoding_for_model('gpt-4-1106-preview');
//       const tokens = encoder.encode(personalityPrompt);
//       setTokens(tokens.length);
//       encoder.free();
//     } else {
//       setTokens(0);
//     }
//   }, 7000);

//   useEffect(() => {
//     recalculateTokens();
//   }, [personalityPrompt, setTokens]);

//   const handleChange = useCallback((name, value) => {
//     setFormState((prevState) => ({ ...prevState, [name]: value }));
//   }, []);

//   const handlePersonalityChange = useCallback((value) => {
//     setPersonalityPrompt(value);
//   }, []);

//   const handleSubmit = useCallback(
//     async (e) => {
//       e.preventDefault();
//       setLoading(true);
//       try {
//         const response = await optimai_root.post('/harari/text/craft/personality', {
//           configuration: formState,
//         });
//         if (response.data.personality_prompt) {
//           setPersonalityPrompt(response.data.personality_prompt);
//         }
//       } catch (e) {
//         console.error(e);
//       }
//       setLoading(false);
//     },
//     [formState],
//   );

//   const handleSaveCommand = useCallback(async () => {
//     if (mode === 'update') {
//       const command = await dispatchWithFeedback(
//         createCommand({
//           name: formState.nickname,
//           description: null,
//           configuration: null,
//           tokens: tokens,
//           content: personalityPrompt,
//         }),
//         {
//           successMessage: 'Command created successfully',
//           errorMessage: 'There was an error creating the command',
//           useSnackbar: true,
//           useConsole: true,
//         },
//       );
//       await dispatchWithFeedback(addAgentCommand(agentId, [command.id]), {
//         successMessage: 'Command added to agent',
//         errorMessage: 'There was an error adding the command',
//         useSnackbar: true,
//         useConsole: true,
//       });
//     } else {
//       setCommand({
//         name: formState.nickname,
//         description: null,
//         configuration: formState,
//         tokens: tokens,
//         content: personalityPrompt,
//       });
//     }

//     onClose();
//   }, [
//     formState,
//     tokens,
//     personalityPrompt,
//     setCommand,
//     onClose,
//     mode,
//     dispatchWithFeedback,
//     addAgentCommand,
//     agentId,
//   ]);

//   return (
//     <Dialog
//       fullWidth
//       open={open}
//       onClose={onClose}
//       sx={{
//         alignItems: 'center',
//         justifyContent: 'center',
//       }}
//     >
//       <Box
//         display="flex"
//         justifyContent="space-between"
//         alignItems="center"
//         p={2}
//       >
//         <Typography variant="h6">Command Creator</Typography>
//         <IconButton
//           onClick={onClose}
//           color="inherit"
//           children={<Iconify icon="zondicons:close-solid" />}
//         />
//       </Box>
//       <Box
//         p={2}
//         flex="1"
//         overflow="auto"
//         pb={10}
//       >
//         <Paper
//           sx={{
//             background: 'none',
//             p: 1,
//             border: (theme) => `dashed 1px ${theme.palette.divider}`,
//           }}
//         >
//           <TextField
//             multiline
//             fullWidth
//             variant="filled"
//             label="Final personality will appear here"
//             name="personality"
//             value={personalityPrompt}
//             onChange={(e) => handlePersonalityChange(e.target.value)}
//           />
//           <Chip
//             label={`${tokens} tokens`}
//             variant="soft"
//             sx={{ position: 'absolute', top: 18, right: 50 }}
//           />
//         </Paper>
//         <FormControl
//           fullWidth
//           margin="normal"
//         >
//           <Paper
//             sx={{
//               background: 'none',
//               py: 1,
//               mt: 2,
//               px: 2,
//               pb: 5,
//               border: (theme) => `dashed 1px ${theme.palette.divider}`,
//             }}
//           >
//             <InfoModal
//               title="Instructions"
//               description="Providing instructions for the AIgent is key for its success."
//             />

//             <Stack
//               spacing={2}
//               paddingTop={2.5}
//             >
//               {Object.entries(PERSONALITY.properties).map(([key, schema]) => {
//                 const { type, description, enum: options } = schema;
//                 return (
//                   <Stack key={key}>
//                     {!options ? (
//                       <TextField
//                         multiline
//                         size="small"
//                         name={key}
//                         label={description}
//                         value={formState[key] || ''}
//                         onChange={(e) => handleChange(key, e.target.value)}
//                       />
//                     ) : (
//                       <>
//                         <Autocomplete
//                           sx={{ zIndex: 9999 }}
//                           size="small"
//                           multiple={type === 'array'}
//                           options={options}
//                           getOptionLabel={(option) => option}
//                           value={formState[key] || (type === 'array' ? [] : '')}
//                           onChange={(event, newValue) =>
//                             handleChange(key, newValue, type === 'array')
//                           }
//                           renderInput={(params) => (
//                             <TextField
//                               {...params}
//                               label={convertCamelCase(key)}
//                               variant="outlined"
//                             />
//                           )}
//                           renderTags={(value, getTagProps) =>
//                             value.map((option, index) => (
//                               <Chip
//                                 color="primary"
//                                 label={option}
//                                 size="small"
//                                 {...getTagProps({ index })}
//                               />
//                             ))
//                           }
//                         />
//                       </>
//                     )}
//                   </Stack>
//                 );
//               })}
//             </Stack>
//           </Paper>
//           <Paper
//             sx={{
//               background: 'none',
//               py: 1,
//               mt: 2,
//               px: 2,
//               border: (theme) => `dashed 1px ${theme.palette.divider}`,
//             }}
//           >
//             <InfoModal
//               title="O.C.E.A.N. Personality"
//               description="Useful to create commands with life and human-like personality."
//             />
//             <Each
//               of={oceanTraits}
//               render={(trait, index) => (
//                 <SliderWithLabels
//                   key={trait.variable}
//                   variable={trait.variable}
//                   left={trait.left}
//                   right={trait.right}
//                   color={trait.color}
//                   value={formState[trait.variable.toLowerCase().replace(/\s+/g, '')] || 0}
//                   onChange={handleChange}
//                 />
//               )}
//             />
//           </Paper>
//         </FormControl>

//         <Box
//           sx={{
//             position: 'absolute',
//             bottom: 10,
//             left: 0,
//             right: 0,
//             zIndex: 9999,
//             display: 'flex',
//             justifyContent: 'center',
//             alignItems: 'center',
//           }}
//         >
//           <ButtonGroup
//             sx={{ display: 'flex', justifyContent: 'center' }}
//             size="large"
//           >
//             <LoadingButton
//               startIcon={<Iconify icon="mdi:magic" />}
//               variant="contained"
//               color="secondary"
//               sx={{ mt: 2 }}
//               onClick={handleSubmit}
//               loading={loading}
//             >
//               Craft Personality
//             </LoadingButton>
//             {personalityPrompt && (
//               <LoadingButton
//                 startIcon={<Iconify icon="fluent:save-20-filled" />}
//                 variant="contained"
//                 color="primary"
//                 sx={{ mt: 2 }}
//                 onClick={handleSaveCommand}
//               >
//                 Save personality
//               </LoadingButton>
//             )}
//           </ButtonGroup>
//         </Box>
//       </Box>
//     </Dialog>
//   );
// };

// export default memo(PersonalityEditor);
