// Copyright 2022 @paritytech/contracts-ui authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useMemo } from 'react';
import { GroupBase } from 'react-select';
import { Dropdown } from '../common/Dropdown';
import { Account } from './Account';
import { createAccountOptions } from 'ui/util/dropdown';
import type { DropdownOption, DropdownProps, ValidFormField } from 'types';
import { useApi, useDatabase } from 'ui/contexts';
import { classes } from 'helpers';
import { useDbQuery } from 'ui/hooks';

type Props = ValidFormField<string> & Omit<DropdownProps<string>, 'options'>;

export function Option({ label, value }: DropdownOption<string>) {
  return <Account className="p-1.5" name={label} value={value} />;
}

function Select({
  isDisabled,
  onChange,
  options,
  placeholder = 'Select account',
  className,
  value,
}: DropdownProps<string>) {
  return (
    <Dropdown
      className={classes('account-select', className)}
      isDisabled={isDisabled}
      formatOptionLabel={Option}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      isSearchable
      value={value}
    />
  );
}

export function AccountSelect({ placeholder = 'Select account', ...props }: Props) {
  const { accounts } = useApi();

  return (
    <Select options={createAccountOptions(accounts || [])} placeholder={placeholder} {...props} />
  );
}

export function AddressSelect({ placeholder = 'Select account', ...props }: Props) {
  const { accounts } = useApi();
  const { db } = useDatabase();
  const [contracts] = useDbQuery(() => db.contracts.toArray(), [db]);

  const options = useMemo((): GroupBase<DropdownOption<string>>[] => {
    return [
      {
        label: 'My Accounts',
        options: createAccountOptions(accounts || []),
      },
      ...(contracts && contracts.length > 0
        ? [
            {
              label: 'Uploaded Contracts',
              options: (contracts || []).map(({ name, address }) => ({
                label: name,
                value: address,
              })),
            },
          ]
        : []),
    ];
  }, [accounts, contracts]);

  return <Select options={options} placeholder={placeholder} {...props} />;
}
