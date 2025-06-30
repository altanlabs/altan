// /**
//  * Copyright (c) Altan, Inc.
//  */

// import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
// // import {mergeRegister} from '@lexical/utils';
// // import { findDOMNode } from 'react-dom';
// import {
//   LexicalTypeaheadMenuPlugin,
//   // MenuOption,
//   MenuTextMatch,
//   // useBasicTypeaheadTriggerMatch,
// } from '@lexical/react/LexicalTypeaheadMenuPlugin';
// import {
//   $createTextNode, 
//   // $getNodeByKey, $getSelection, $isRangeSelection, 
//   $isTextNode, 
//   // BLUR_COMMAND, COMMAND_PRIORITY_LOW, FOCUS_COMMAND, KEY_ENTER_COMMAND, LexicalEditor, 
//   TextNode
// } from 'lexical';
// import React, {memo, useCallback} from 'react';
// // import {
// //   $convertToMarkdownString,
// //   $convertFromMarkdownString,
// //   TRANSFORMERS
// // } from '@lexical/markdown';
// // import {$createMentionNode} from '../../nodes/MentionNode';
// import { $createVarNode, VarOption } from '../../nodes/VarNode';
// import { $createHelperNode, HelperOption, Method } from '../../nodes/HelperNode';
// import VarsTypeaheadMenu from './VarsTypeaheadMenu';
// // import { EmptyArgNode } from '../../nodes/EmptyArgNode';

// const PUNCTUATION =
//   '\\.,\\+\\*\\?\\$\\@\\|#{}\\(\\)\\^\\-\\[\\]\\\\/!%\'"~=<>_:;';
// const NAME = '\\b[A-Z][^\\s' + PUNCTUATION + ']';

// const DocumentMentionsRegex = {
//   NAME,
//   PUNCTUATION,
// };

// const PUNC = DocumentMentionsRegex.PUNCTUATION;

// const TRIGGERS = ['$'].join('');

// // Chars we expect to see in a mention (non-space, non-punctuation).
// const VALID_CHARS = '[^' + TRIGGERS + PUNC + '\\s]';

// // Non-standard series of chars. Each series must be preceded and followed by
// // a valid char.
// const VALID_JOINS =
//   '(?:' +
//   '\\.[ |$]|' + // E.g. "r. " in "Mr. Smith"
//   ' |' + // E.g. " " in "Josh Duck"
//   '[' +
//   PUNC +
//   ']|' + // E.g. "-' in "Salier-Hellendag"
//   ')';

// const LENGTH_LIMIT = 75;

// const AtSignMentionsRegex = new RegExp(
//   '(^|\\s|\\()(' +
//     '[' +
//     TRIGGERS +
//     ']' +
//     '((?:' +
//     VALID_CHARS +
//     VALID_JOINS +
//     '){0,' +
//     LENGTH_LIMIT +
//     '})' +
//     ')' +
//     // The lookahead ensures that there's no additional text required after '@'
//     '(?=' + VALID_CHARS + '*$)',
//   'g'
// );

// // 50 is the longest alias length limit.
// const ALIAS_LENGTH_LIMIT = 50;

// // Regex used to match alias.
// const AtSignMentionsRegexAliasRegex = new RegExp(
//   '(^|\\s|\\()(' +
//     '[' +
//     TRIGGERS +
//     ']' +
//     '((?:' +
//     VALID_CHARS +
//     '){0,' +
//     ALIAS_LENGTH_LIMIT +
//     '})' +
//     ')$',
// );

// function checkForAtSignMentions(
//   text: string,
//   minMatchLength: number,
// ): MenuTextMatch | null {
//   let match = AtSignMentionsRegex.exec(text);

//   if (match === null) {
//     match = AtSignMentionsRegexAliasRegex.exec(text);
//   }
//   if (match !== null) {
//     // The strategy ignores leading whitespace but we need to know it's
//     // length to add it to the leadOffset
//     const maybeLeadingWhitespace = match[1];

//     const matchingString = match[3];
//     if (matchingString.length >= minMatchLength) {
//       return {
//         leadOffset: match.index + maybeLeadingWhitespace.length,
//         matchingString,
//         replaceableString: match[2],
//       };
//     }
//   }
//   return null;
// }

// function getPossibleQueryMatch(text: string): MenuTextMatch | null {
//   return checkForAtSignMentions(text, 0);
// }

// // function MentionsTypeaheadMenuItem({
// //   index,
// //   isSelected,
// //   onClick,
// //   onMouseEnter,
// //   option,
// // }: {
// //   index: number;
// //   isSelected: boolean;
// //   onClick: () => void;
// //   onMouseEnter: () => void;
// //   option: MentionTypeaheadOption;
// // }) {
// //   let className = 'item';
// //   if (isSelected) {
// //     className += ' selected';
// //   }
// //   return (
// //     <li
// //       key={option.id}
// //       tabIndex={0}
// //       className={className}
// //       ref={option.setRefElement}
// //       role="option"
// //       aria-selected={isSelected}
// //       id={'typeahead-item-' + index}
// //       onMouseEnter={onMouseEnter}
// //       onClick={onClick}
// //     >
// //       <Stack
// //         direction="row"
// //         spacing={1}
// //       >
// //         <Avatar
// //           src={option.picture} 
// //           sx={{
// //             width: 20,
// //             height: 20
// //           }}
// //           // imgProps={{
// //           //   sx: {
// //           //     width: 15,
// //           //     height: 15
// //           //   }
// //           // }}
// //         />
// //         <span className="text">{option.name}</span>
// //       </Stack>
// //     </li>
// //   );
// // }

// // const options = useMemo(
// //   () =>
// //     results
// //       .map(
// //         (member) => {
// //           const { name, type, src } = member;
// //           return new MentionTypeaheadOption(member.id, name, type, src);
// //         }
// //       ),
// //       // .slice(0, SUGGESTION_LIST_LENGTH_LIMIT),
// //   [results],
// // );


// function VarsHelpersPlugin(): JSX.Element | null {
//   const [editor] = useLexicalComposerContext()
//   // const [hasFocus, setFocus] = useState(false)
  
//   // const theme = useTheme();
//   // const { members, me } = useSelector((state: RootState) => state.room);

//   // const [queryString, setQueryString] = useState<string>('');
//   // const [searchOutsiders, setSearchOutsiders] = useState<boolean>(false);
//   // const [triggeredTarget, setTriggeredTarget] = useState<boolean>(false);
//   // const mentionsCache = new Map();
//   // const results = useMentionLookupService(mentionsCache, queryString, members, searchOutsiders);

//   // const checkForSlashTriggerMatch = useBasicTypeaheadTriggerMatch('/', {
//   //   minLength: 0,
//   // });

//   const onSelectOption = useCallback(
//     (
//       option: VarOption | HelperOption, 
//       textNodeContainingQuery: TextNode | null, 
//       closeMenu: () => void, 
//       matchingString: string
//     ) => {
//       // const selection = $getSelection();

//       // console.log("onSelectOption.selection", selection);
//       // if (selection !== null && $isRangeSelection(selection)) {
//       //   const anchor = selection.anchor;
//       //   const focus = selection.focus;
//       //   const anchorNode = anchor.getNode();
//       //   const focusNode = focus.getNode();
  
//       //   if (anchorNode !== null) {
//       //     const anchorOffset = anchorNode.offset;
//       //     const focusOffset = focusNode.offset;
//       //     const textContent = anchorNode.getTextContent();

//       //   }
//       // }
//       editor.update(() => {
//         // `**[@${this.__mention}](/member/${this.__mentionId})**`,

//         // const mentionNode = $createMentionNode(selectedOption.name, selectedOption.id);
//         // if (nodeToReplace) {
//         //   nodeToReplace.replace(mentionNode);
//         // }
        
//         if (textNodeContainingQuery && $isTextNode(textNodeContainingQuery)) {
//           textNodeContainingQuery.replace(!option ? $createTextNode('') : ((option instanceof VarOption) ? $createVarNode(option) : $createHelperNode(option.name, option.prefix, new Method(option.method))))
//         }
//         // mentionNode.select();
//         // mentionNode.setStyle('background-color: #CCCCFF; color: #333')
//         closeMenu();
//       });
//     },
//     [editor],
//   );

//   const checkForMentionMatch = useCallback(
//     (text: string) => {
//       // const slashMatch = checkForSlashTriggerMatch(text, editor);
//       // if (slashMatch !== null) {
//       //   return null;
//       // }
//       return getPossibleQueryMatch(text);
//     },
//     [editor],
//   );

//   // const checkForAnyMatch = useCallback((text: string, editor: LexicalEditor) => {
//   //   // Get the current selection from the editor
//   //   const selection = $getSelection();
//   //   let matchingString = '';
//   //   let replaceableString = '';
//   //   let leadOffset = 0;

//   //   console.log("selection", selection, hasFocus);
//   //   if (selection !== null && $isRangeSelection(selection)) {
//   //     const anchor = selection.anchor;
//   //     const focus = selection.focus;
//   //     const anchorNode = anchor.getNode();
//   //     const focusNode = focus.getNode();

//   //     if (anchorNode !== null) {
//   //       const anchorOffset = anchorNode.offset;
//   //       const focusOffset = focusNode.offset;
//   //       const textContent = anchorNode.getTextContent();

//   //       // Determine the leadOffset
//   //       leadOffset = anchorOffset;

//   //       // Determine matchingString and replaceableString
//   //       matchingString = textContent.substring(anchorOffset, focusOffset) ?? '';
//   //       replaceableString = matchingString;
//   //     }
//   //   }

//   //   if (!hasFocus || !selection) {
//   //     return null;
//   //   }

//   //   return {
//   //     leadOffset,
//   //     matchingString,
//   //     replaceableString,
//   //   };
//   // }, [hasFocus]);

  
//   // editor.registerMutationListener(EmptyArgNode, (mutations) => {
    
//   //   editor.getEditorState().read(() => {
//   //     for (const [key, mutation] of mutations) {
//   //       const node: null | EmptyArgNode = $getNodeByKey(key);
//   //       if (!!node) {
//   //         if (mutation === "created") {
//   //           const handleClick = () => {
//   //             editor.update(() => {
//   //               console.log("clicked empty arg");
//   //               node.remove();
//   //             });
//   //           };
//   //           node.setHandleClick(handleClick);
//   //         }
//   //       }
//   //     }
//   //   })
//   // });

//   // useEffect(() => {
//   //   return mergeRegister(
//   //     // editor.registerCommand(
//   //     //   KEY_ENTER_COMMAND,
//   //     //   $handleKeypressCommand,
//   //     //   COMMAND_PRIORITY_LOW,
//   //     // ),
//   //     editor.registerCommand(
//   //       BLUR_COMMAND,
//   //       () => {
//   //         setFocus(false);
//   //         return false
//   //       },
//   //       COMMAND_PRIORITY_LOW
//   //     ),
//   //     editor.registerCommand(
//   //       FOCUS_COMMAND,
//   //       () => {
//   //         setFocus(true);
//   //         return false
//   //       },
//   //       COMMAND_PRIORITY_LOW
//   //     )
//   //   );
//   // }, [editor]);

//   return (
//     <LexicalTypeaheadMenuPlugin<VarOption | HelperOption>
//       triggerFn={checkForMentionMatch}
//       menuRenderFn={(
//         anchorElementRef,
//         {selectOptionAndCleanUp}
//       ) => {
//         return (
//           <VarsTypeaheadMenu
//             anchorElementRef={anchorElementRef}
//             selectOptionAndCleanUp={selectOptionAndCleanUp}
//           />
//         )
//       }}
//       onQueryChange={function (matchingString: string | null): void {

//       }} 
//       onSelectOption={onSelectOption} 
//       options={[]}  
//     />
//   );
// }

// export default memo(VarsHelpersPlugin);
