// import Button from '@mui/material/Button';
// import TextField from '@mui/material/TextField';
// import throttle from 'lodash/throttle';
// import PropTypes from 'prop-types';
// import React, { useState, useCallback, useEffect, memo, useMemo } from 'react';
// import { encoding_for_model } from 'tiktoken';

// import DeleteDialog from '../../../components/dialogs/DeleteDialog';
// import Iconify from '../../../components/iconify/Iconify';

// const PersonalityCard = ({ agent_command, onChange, onDelete }) => {
//   const [openDialog, setOpenDialog] = useState(false);
//   const [tokens, setTokens] = useState(agent_command.command?.tokens || 0);
//   const [editedContent, setEditedContent] = useState(agent_command.command?.content || '');
//   const [expanded, setExpanded] = useState(false);

//   useEffect(() => {
//     setEditedContent(agent_command.command?.content || '');
//     setTokens(agent_command.command?.tokens || 0);
//   }, [agent_command]);

//   const recalculateTokens = useCallback((content) => {
//     if (content) {
//       const encoder = encoding_for_model('gpt-4-1106-preview');
//       const tokens = encoder.encode(content);
//       setTokens(tokens.length);
//       encoder.free();
//     } else {
//       setTokens(0);
//     }
//   }, []);

//   const throttledRecalculateTokens = useMemo(
//     () => throttle(recalculateTokens, 7000),
//     [recalculateTokens],
//   );

//   useEffect(() => {
//     throttledRecalculateTokens(editedContent);
//   }, [editedContent, throttledRecalculateTokens]);

//   const handleContentChange = useCallback(
//     (e) => {
//       const newContent = e.target.value;
//       setEditedContent(newContent);
//       onChange({
//         ...agent_command,
//         command: { ...agent_command.command, content: newContent },
//       });
//     },
//     [agent_command, onChange],
//   );

//   const handleDelete = useCallback(() => {
//     onDelete(agent_command);
//     setOpenDialog(false);
//   }, [agent_command, onDelete]);

//   return (
//     <div className="flex flex-col space-y-2">
//       <TextField
//         multiline
//         fullWidth
//         rows={expanded ? undefined : 8}
//         maxRows={expanded ? undefined : 8}
//         value={editedContent}
//         onChange={handleContentChange}
//         label={`Content (${tokens} tokens)`}
//         placeholder="You are an AI designed to do X, Y, Z..."
//         variant="filled"
//         className="border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
//       />

//       {editedContent?.split('\n').length > 8 && (
//         <Button
//           size="small"
//           onClick={() => setExpanded(!expanded)}
//           endIcon={<Iconify icon={expanded ? 'eva:chevron-up-fill' : 'eva:chevron-down-fill'} />}
//           className="text-blue-500"
//         >
//           {expanded ? 'Show Less' : 'Show More'}
//         </Button>
//       )}

//       <DeleteDialog
//         openDeleteDialog={openDialog}
//         handleCloseDeleteDialog={() => setOpenDialog(false)}
//         confirmDelete={handleDelete}
//         message={"Are you sure you want to delete this command? This action can't be undone"}
//       />
//     </div>
//   );
// };

// PersonalityCard.propTypes = {
//   agent_command: PropTypes.shape({
//     agent_id: PropTypes.string.isRequired,
//     id: PropTypes.string.isRequired,
//     command: PropTypes.shape({
//       content: PropTypes.string,
//       tokens: PropTypes.number,
//     }),
//   }).isRequired,
//   onChange: PropTypes.func.isRequired,
//   onDelete: PropTypes.func.isRequired,
// };

// export default memo(PersonalityCard);

// // <DeleteDialog
// //   openDeleteDialog={openDialog}
// //   handleCloseDeleteDialog={() => setOpenDialog(false)}
// //   confirmDelete={handleDelete}
// //   message={`Are you sure you want to delete this command? This action can't be undone`}
// // />
