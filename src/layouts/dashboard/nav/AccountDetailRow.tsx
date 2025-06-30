import { Avatar, Tooltip } from '@mui/material';
import { useMemo, memo, type JSX } from 'react';

import { cn } from '@lib/utils';
import addAccountIdToUrl from '@utils/addAccountIdToUrl';

/**
 * Highlights the search term within a text string.
 */
const HighlightText = ({ text, searchTerm }: { text: string; searchTerm: string }): JSX.Element => {
  if (!searchTerm) return <span>{text}</span>;
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span
            key={i}
            className="bg-yellow-200 dark:bg-yellow-600"
          >
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
};

/**
 * Renders one detail row with a label and a value (with search highlighting).
 */
const DetailRow = ({
  label,
  value,
  searchTerm,
}: {
  label: string;
  value: string;
  searchTerm: string;
}): JSX.Element => (
  <div className="flex justify-between w-full">
    <span className="font-medium text-gray-600 dark:text-gray-400 text-sm">{label}:</span>
    <span className="text-gray-800 dark:text-gray-200 text-xs">
      <HighlightText
        text={value}
        searchTerm={searchTerm}
      />
    </span>
  </div>
);

interface AccountDetailRowProps {
  account: {
    id: string;
    date_creation: string;
    name: string;
    logo_url?: string;
    organisation: { id: string; date_creation: string; name: string };
    user: {
      id: string;
      email: string;
      user_name: string;
      person: { first_name: string; last_name: string; nickname: string };
    };
  };
  /** Handler for when the account row is clicked */
   
  handleChangeAccount: (_accountId: string) => void;
  /**
   * The current search term.
   * If provided, matching details are shown in a dedicated inline row.
   */
  searchTerm?: string;
}

/**
 * The AccountDetailRow component renders an account row.
 *
 * - **Inline Details:** When a search term is provided and matches some details, they are rendered
 *   in an additional row below the main row.
 * - **Tooltip on Hover:** On hover, a full tooltip is displayed (with highlighted search term).
 */
const AccountDetailRow = ({
  account,
  handleChangeAccount,
  searchTerm = '',
}: AccountDetailRowProps): JSX.Element => {
  // All available details.
  const details = useMemo(
    () =>
      [
        { label: 'Account ID', value: account.id },
        {
          label: 'Created At',
          value: new Date(account.date_creation).toLocaleString(),
        },
        { label: 'Organization', value: account.organisation?.name ?? '' },
        { label: 'Email', value: account.user?.email ?? '' },
        {
          label: 'Nickname',
          value: account.user?.user_name ?? account.user?.person?.nickname ?? '',
        },
        {
          label: 'Name',
          value: `${account.user?.person?.first_name ?? ''} ${
            account.user?.person?.last_name ?? ''
          }`.trim(),
        },
      ].filter((detail) => detail.value?.length),
    [account],
  );

  // Filter details only when not hovering. On hover, show full details.
  const filteredDetails = useMemo(() => {
    if (!searchTerm.trim()) return details;
    const lowerSearch = searchTerm.toLowerCase();
    return details.filter(
      (detail) =>
        detail.value.toLowerCase().includes(lowerSearch) ||
        detail.label.toLowerCase().includes(lowerSearch),
    );
  }, [searchTerm, details]);

  // Tooltip is only shown on hover.
  const tooltipContent = (
    <div
      onClick={(e) => e.stopPropagation()}
      className="shadow-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4"
    >
      <div className="flex items-center space-x-3 mb-3">
        <Avatar
          src={addAccountIdToUrl(account?.logo_url || '/fallback-logo.png', account.id)}
          alt={account.name}
        />
        <div>
          <h3 className="text-lg font-semibold dark:text-white">
            <HighlightText
              text={account.name ?? ''}
              searchTerm={searchTerm}
            />
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <HighlightText
              text={account?.name ?? ''}
              searchTerm={searchTerm}
            />
          </p>
        </div>
      </div>
      <div className="border-t dark:border-gray-700 pt-3 space-y-2">
        {details.map((detail) => (
          <DetailRow
            key={detail.label}
            label={detail.label}
            value={detail.value}
            searchTerm={searchTerm}
          />
        ))}
        {filteredDetails.length === 0 && (
          <p className="text-xs text-gray-500 dark:text-gray-400">No matching details.</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full">
      <button
        onClick={() => handleChangeAccount(account.id)}
        className={cn(
          'flex w-full items-center justify-between px-4 py-2 transition rounded-lg focus:outline-none',
          'hover:bg-gray-100 dark:hover:bg-gray-800',
        )}
      >
        <div className="flex items-center space-x-3">
          <Tooltip
            title={tooltipContent}
            placement="right"
            arrow
            slotProps={{
              tooltip: {
                sx: {
                  backgroundColor: 'transparent',
                  padding: 0,
                },
              },
              popper: {
                modifiers: [
                  {
                    name: 'offset',
                    options: { offset: [0, 10] },
                  },
                ],
              },
            }}
          >
            <Avatar
              src={addAccountIdToUrl(account?.logo_url || '/fallback-logo.png', account.id)}
              alt={account.name}
            />
          </Tooltip>
          <span className="text-sm font-medium dark:text-white">
            {account.name} <span className="text-xs text-gray-500">({account?.name})</span>
          </span>
        </div>
      </button>

      {/* Inline details row when not hovered and a search term is active */}
      {!!searchTerm.trim() && (
        <div className="px-4 pb-2">
          {filteredDetails.length > 0 ? (
            <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1">
              {filteredDetails.map((detail) => (
                <DetailRow
                  key={detail.label}
                  label={detail.label}
                  value={detail.value}
                  searchTerm={searchTerm}
                />
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">No matching details.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default memo(AccountDetailRow);
