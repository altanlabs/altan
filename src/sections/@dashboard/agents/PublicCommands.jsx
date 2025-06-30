// import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; // Import the expand icon
// import {
//   Dialog,
//   Box,
//   Typography,
//   IconButton,
//   TextField,
//   Card,
//   CardContent,
//   Collapse,
// } from '@mui/material';
// import { styled } from '@mui/material/styles';
// import { useState, useEffect, memo } from 'react';

// import Iconify from '../../../components/iconify/Iconify';
// import useFeedbackDispatch from '../../../hooks/useFeedbackDispatch';
// import { addAgentCommand } from '../../../redux/slices/general';
// import { optimai } from '../../../utils/axios';

// const fetchCommandTemplates = async () => {
//   try {
//     const response = await optimai.get('/command/');
//     console.log('response', response.data);
//     return response.data.commands; // Directly return the fetched data
//   } catch (e) {
//     throw e;
//   }
// };

// const ExpandMore = styled((props) => {
//   const { expand, ...other } = props;
//   return <IconButton {...other} />;
// })(({ theme, expand }) => ({
//   transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
//   marginLeft: 'auto',
//   transition: theme.transitions.create('transform', {
//     duration: theme.transitions.duration.shortest,
//   }),
// }));

// const PublicCommands = ({ open = false, onClose, agentId = null }) => {
//   const [templates, setTemplates] = useState([]);
//   const [filteredTemplates, setFilteredTemplates] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [expandedId, setExpandedId] = useState(-1);
//   const [dispatchWithFeedback] = useFeedbackDispatch();

//   useEffect(() => {
//     // Assuming fetchCommandTemplates is corrected based on previous discussions
//     const getCommandTemplates = async () => {
//       try {
//         const fetchedTemplates = await fetchCommandTemplates();
//         setTemplates(fetchedTemplates);
//         setFilteredTemplates(fetchedTemplates);
//       } catch (error) {
//         console.error('Failed to fetch command templates:', error);
//       }
//     };

//     if (open) {
//       getCommandTemplates();
//     }
//   }, [open]);

//   useEffect(() => {
//     const lowercasedSearchTerm = searchTerm.toLowerCase();
//     const filtered = templates.filter(
//       (template) =>
//         template.name.toLowerCase().includes(lowercasedSearchTerm) ||
//         template.description.toLowerCase().includes(lowercasedSearchTerm) ||
//         template.content.toLowerCase().includes(lowercasedSearchTerm),
//     );
//     setFilteredTemplates(filtered);
//   }, [searchTerm, templates]);

//   const handleExpandClick = (id) => {
//     setExpandedId(expandedId !== id ? id : -1);
//   };

//   const handleCreateAgentCommand = (commandId) => {
//     dispatchWithFeedback(addAgentCommand(agentId, commandId), {
//       successMessage: 'Command added successfully!',
//       errorMessage: 'Error adding Command ',
//       useSnackbar: true,
//     });
//     onClose();
//   };

//   return (
//     <Dialog
//       fullWidth
//       open={open}
//       onClose={onClose}
//       sx={{ alignItems: 'center', justifyContent: 'center' }}
//     >
//       <Box
//         display="flex"
//         flexDirection="column"
//         p={2}
//       >
//         <Box
//           display="flex"
//           justifyContent="space-between"
//           alignItems="center"
//         >
//           <Typography variant="h6">Templates</Typography>
//           <IconButton
//             onClick={onClose}
//             color="inherit"
//             children={<Iconify icon="zondicons:close-solid" />}
//           />
//         </Box>
//         <TextField
//           margin="normal"
//           variant="outlined"
//           placeholder="Search templates..."
//           onChange={(e) => setSearchTerm(e.target.value)}
//         />
//         {filteredTemplates.map((template, index) => (
//           <Card
//             key={template.id}
//             sx={{ margin: '10px 0' }}
//           >
//             <CardContent
//               sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
//             >
//               <Box>
//                 <Typography
//                   variant="h5"
//                   component="div"
//                 >
//                   {template.name}
//                 </Typography>
//                 <Typography
//                   sx={{ mb: 1.5 }}
//                   color="text.secondary"
//                 >
//                   {template.description}
//                 </Typography>
//               </Box>
//               <Box>
//                 <IconButton onClick={() => handleCreateAgentCommand(template.id)}>
//                   <Iconify icon="lets-icons:add-duotone" />
//                 </IconButton>
//                 <ExpandMore
//                   expand={expandedId === template.id}
//                   onClick={() => handleExpandClick(template.id)}
//                   aria-expanded={expandedId === template.id}
//                   aria-label="show more"
//                 >
//                   <ExpandMoreIcon />
//                 </ExpandMore>
//               </Box>
//             </CardContent>

//             <Collapse
//               in={expandedId === template.id}
//               timeout="auto"
//               unmountOnExit
//             >
//               <CardContent>
//                 <Typography paragraph>{template.content}</Typography>
//               </CardContent>
//             </Collapse>
//           </Card>
//         ))}
//       </Box>
//     </Dialog>
//   );
// };

// export default memo(PublicCommands);
