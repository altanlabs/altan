/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  MenuTextMatch,
  useBasicTypeaheadTriggerMatch,
} from '@lexical/react/LexicalTypeaheadMenuPlugin';
import {mergeRegister} from '@lexical/utils';
import { Avatar, Box, Divider, Stack, Typography, useTheme } from '@mui/material';
import {COMMAND_PRIORITY_LOW, KEY_ENTER_COMMAND, TextNode} from 'lexical';
import { capitalize } from 'lodash';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import * as ReactDOM from 'react-dom';

import { useSelector } from '../../../../redux/store';
import DynamicAgentAvatar from '../../../agents/DynamicAgentAvatar';
import { getMemberDetails, getMemberName } from '../../../new-room/utils.js';
import { selectMe, selectMembers } from '../../../../redux/slices/room/selectors/memberSelectors';
import {$createMentionNode} from '../../nodes/MentionNode';

const PUNCTUATION =
  '\\.,\\+\\*\\?\\$\\@\\|#{}\\(\\)\\^\\-\\[\\]\\\\/!%\'"~=<>_:;';
const NAME = '\\b[A-Z][^\\s' + PUNCTUATION + ']';

const DocumentMentionsRegex = {
  NAME,
  PUNCTUATION,
};

const PUNC = DocumentMentionsRegex.PUNCTUATION;

const TRIGGERS = ['@'].join('');

// Chars we expect to see in a mention (non-space, non-punctuation).
const VALID_CHARS = '[^' + TRIGGERS + PUNC + '\\s]';

// Non-standard series of chars. Each series must be preceded and followed by
// a valid char.
const VALID_JOINS =
  '(?:' +
  '\\.[ |$]|' + // E.g. "r. " in "Mr. Smith"
  ' |' + // E.g. " " in "Josh Duck"
  '[' +
  PUNC +
  ']|' + // E.g. "-' in "Salier-Hellendag"
  ')';

const LENGTH_LIMIT = 75;

const AtSignMentionsRegex = new RegExp(
  '(^|\\s|\\()(' +
    '[' +
    TRIGGERS +
    ']' +
    '((?:' +
    VALID_CHARS +
    VALID_JOINS +
    '){0,' +
    LENGTH_LIMIT +
    '})' +
    ')' +
    // The lookahead ensures that there's no additional text required after '@'
    '(?=' + VALID_CHARS + '*$)',
  'g'
);

// 50 is the longest alias length limit.
const ALIAS_LENGTH_LIMIT = 50;

// Regex used to match alias.
const AtSignMentionsRegexAliasRegex = new RegExp(
  '(^|\\s|\\()(' +
    '[' +
    TRIGGERS +
    ']' +
    '((?:' +
    VALID_CHARS +
    '){0,' +
    ALIAS_LENGTH_LIMIT +
    '})' +
    ')$',
);

const SUGGESTION_LIST_LENGTH_LIMIT = 6;

const lookupService = {
  search(string: string, members: { [id: string] : any; }, callback: (results: Array<any>) => void): void {
      const results = Object.values(members.byId).filter((mention) =>
        getMemberName(mention).toLowerCase().includes(string.toLowerCase()),
      ).map((member) => getMemberDetails(member)).sort((a: any, b: any) => {
        if (a.type === "user" && b.type === "agent") return -1;
        return 1;
      });
      callback(results);
  },
};

function useMentionLookupService(mentionsCache: Map<string, Array<any>>, mentionString: string, members: Array<any>, searchOutsiders: boolean = false) {
  const [results, setResults] = useState<Array<any>>([]);

  useEffect(() => {
    const cachedResults = mentionsCache.get(mentionString);

    if (mentionString == null) {
      setResults([]);
      return;
    }

    if (cachedResults === null) {
      return;
    } else if (cachedResults !== undefined) {
      setResults(cachedResults);
      return;
    }

    mentionsCache.set(mentionString, null);
    lookupService.search(mentionString, members, (newResults) => {
      mentionsCache.set(mentionString, newResults);
      setResults(newResults);
    });
  }, [mentionString]);

  return results;
}

function checkForAtSignMentions(
  text: string,
  minMatchLength: number,
): MenuTextMatch | null {
  let match = AtSignMentionsRegex.exec(text);

  if (match === null) {
    match = AtSignMentionsRegexAliasRegex.exec(text);
  }
  if (match !== null) {
    // The strategy ignores leading whitespace but we need to know it's
    // length to add it to the leadOffset
    const maybeLeadingWhitespace = match[1];

    const matchingString = match[3];
    if (matchingString.length >= minMatchLength) {
      return {
        leadOffset: match.index + maybeLeadingWhitespace.length,
        matchingString,
        replaceableString: match[2],
      };
    }
  }
  return null;
}

function getPossibleQueryMatch(text: string): MenuTextMatch | null {
  return checkForAtSignMentions(text, 0);
}

class MentionTypeaheadOption extends MenuOption {
  id: string;
  name: string;
  type: string;
  picture: string;
  member: any;

  constructor(id: string, name: string, type: string, picture: string, member: any) {
    super(name);
    this.id = id;
    this.name = name;
    this.picture = picture;
    this.type = type;
    this.member = member;
  }
}

function MentionsTypeaheadMenuItem({
  index,
  isSelected,
  onClick,
  onMouseEnter,
  option,
}: {
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  option: MentionTypeaheadOption;
}) {
  let className = 'item';
  if (isSelected) {
    className += ' selected';
  }
  
  const isAgent = option.type === 'agent';
  
  return (
    <li
      key={option.id}
      tabIndex={0}
      className={className}
      ref={option.setRefElement}
      role="option"
      aria-selected={isSelected}
      id={'typeahead-item-' + index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
    >
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
      >
        {isAgent ? (
          <DynamicAgentAvatar
            agent={option.member?.member?.agent}
            size={20}
            isStatic
          />
        ) : (
          <Avatar
            src={option.picture} 
            sx={{
              width: 20,
              height: 20
            }}
          />
        )}
        <span className="text">{option.name}</span>
      </Stack>
    </li>
  );
}

// const options = useMemo(
//   () =>
//     results
//       .map(
//         (member) => {
//           const { name, type, src } = member;
//           return new MentionTypeaheadOption(member.id, name, type, src);
//         }
//       ),
//       // .slice(0, SUGGESTION_LIST_LENGTH_LIMIT),
//   [results],
// );


export default function NewMentionsPlugin(): JSX.Element | null {
  const theme = useTheme();
  const members = useSelector(selectMembers); 
  const me = useSelector(selectMe);
  const [editor] = useLexicalComposerContext();

  const potentialTarget = useRef<number | null>(null);
  const [queryString, setQueryString] = useState<string>('');
  const [searchOutsiders, setSearchOutsiders] = useState<boolean>(false);
  const [triggeredTarget, setTriggeredTarget] = useState<boolean>(false);
  const mentionsCache = new Map();
  const results = useMentionLookupService(mentionsCache, queryString, members, searchOutsiders);

  const checkForSlashTriggerMatch = useBasicTypeaheadTriggerMatch('/', {
    minLength: 0,
  });

  const options = useMemo(
    () => results
      .sort((a, b) => {
        // Assuming 'agent' type should come first
        if (a.type === 'agent' && b.type !== 'agent') return -1;
        if (a.type !== 'agent' && b.type === 'agent') return 1;
        return 0; // Keep original order if the same type or none is agent
      })
      .map((memberDetails) => {
        const { name, type, src, id } = memberDetails;
        const fullMember = members.byId[id];
        return new MentionTypeaheadOption(id, name, type, src, fullMember);
      }),
    [results, members],
  );

  const onSelectOption = useCallback(
    (
      selectedOption: MentionTypeaheadOption,
      nodeToReplace: TextNode | null,
      closeMenu: () => void,
    ) => {
      editor.update(() => {
        // `**[@${this.__mention}](/member/${this.__mentionId})**`,

        const mentionNode = $createMentionNode(selectedOption.name, selectedOption.id);
        if (nodeToReplace) {
          nodeToReplace.replace(mentionNode);
        }
        // mentionNode.select();
        // mentionNode.setStyle('background-color: #CCCCFF; color: #333')
        setTriggeredTarget(false);
        setSearchOutsiders(false);
        potentialTarget.current = null;
        closeMenu();
      });
    },
    [editor, setTriggeredTarget, setSearchOutsiders],
  );

  const checkForMentionMatch = useCallback(
    (text: string) => {
      const slashMatch = checkForSlashTriggerMatch(text, editor);
      if (slashMatch !== null) {
        return null;
      }
      return getPossibleQueryMatch(text);
    },
    [checkForSlashTriggerMatch, editor],
  );


  useEffect(() => {
    const $handleKeypressCommand = (e: KeyboardEvent) => {
      if (potentialTarget.current !== null) {
        e.preventDefault();
        // Directly handle the target selection logic here or call a function
        setTriggeredTarget(true);
        return true;
      }
      return false;
    };  
    return mergeRegister(
      editor.registerCommand(
        KEY_ENTER_COMMAND,
        $handleKeypressCommand,
        COMMAND_PRIORITY_LOW,
      )
    );
  }, [editor]);

  useEffect(() => {
    if (queryString === null || queryString.length === 0) {
      potentialTarget.current = null;
    }
  }, [queryString]);

  return (
    <LexicalTypeaheadMenuPlugin<MentionTypeaheadOption>
      onQueryChange={(matchingString) => setQueryString(matchingString || '')}
      onSelectOption={onSelectOption}
      triggerFn={checkForMentionMatch}
      options={options}
      menuRenderFn={(
        anchorElementRef,
        {selectedIndex, selectOptionAndCleanUp, setHighlightedIndex},
      ) => {

        useEffect(() => {
          potentialTarget.current = selectedIndex;
        }, [selectedIndex]);

        useEffect(() => {
          if (triggeredTarget !== false && selectedIndex !== null) {
            selectOptionAndCleanUp(options[selectedIndex]);
          }
        }, [triggeredTarget, selectOptionAndCleanUp]);

        return anchorElementRef.current && results.length
        ? ReactDOM.createPortal(
            <Box
              className="typeahead-popover mentions-menu"
              sx={{
                position: 'absolute',
                bottom: '100%',
                marginBottom: '12px',
                minWidth: 300,
                maxHeight: 280,
                overflow: 'auto',
                backgroundColor: theme.palette.background.default,
                color: theme.palette.text.primary,
                borderRadius: 1,
                boxShadow: 3,
                border: `1px solid ${theme.palette.divider}`,
                '& ul': {
                  margin: 0,
                  padding: 0,
                  listStyle: 'none'
                },
                '& ul li.selected': {
                  backgroundColor: theme.palette.action.focus
                },
                '& li:hover': {
                  backgroundColor: theme.palette.action.hover
                },
                '& li': {
                  padding: '8px 12px',
                  cursor: 'pointer'
                }
              }}
              zIndex={999}
            >
              {/* <Box sx={{ p: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <TextField 
                  variant="outlined" 
                  placeholder="Search outsiders..." 
                  size="small" 
                  fullWidth
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      fontSize: '0.875rem',
                      height: '32px'
                    }
                  }}
                />
              </Box> */}
              <ul>
                  {
                    options.map((option, i: number) => {
                    const onClick = () => {
                      setHighlightedIndex(i);
                      selectOptionAndCleanUp(option);
                    }
                    return (
                      <span key={option.id}>
                        {
                          (!!i && options[i - 1].type !== option.type) && (
                            <Divider>
                              <Typography variant='caption'>
                              { capitalize(option.type) }s
                              </Typography>
                            </Divider>
                          )
                        }
                        <MentionsTypeaheadMenuItem
                          index={i}
                          isSelected={selectedIndex === i}
                          onClick={onClick}
                          onMouseEnter={() => {
                            setHighlightedIndex(i);
                          }}
                          option={option}
                        />
                      </span>
                    );
                  })
                }
              </ul>
            </Box>,
            anchorElementRef.current,
          )
        : null;
      }}
    />
  );
}
