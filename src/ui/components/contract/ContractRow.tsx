// Copyright 2022 @paritytech/contracts-ui authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useEffect, useState } from 'react';
import 'styled-components';
import { Link } from 'react-router-dom';
import { Identicon } from '../account/Identicon';
import { ContractDocument } from 'types';
import { useApi } from 'ui/contexts';
import { getContractInfo, displayDate } from 'helpers';

interface Props {
  contract: ContractDocument;
}

export function ContractRow({ contract: { address, name, date } }: Props) {
  const { api } = useApi();
  const [isOnChain, setIsOnChain] = useState(true);

  useEffect(() => {
    getContractInfo(api, address)
      .then(info => {
        setIsOnChain(info ? true : false);
      })
      .catch(console.error);
  }, [address, api]);

  return (
    <Link
      to={`/contract/${address}`}
      className={`text-sm inline-flex items-center cursor-pointer w-full hover:bg-gray-50 dark:hover:bg-elevation-1 border p-3 border-t-0 border-r-0 border-l-0 last:border-b-0 dark:text-white dark:border-gray-700 border-gray-200`}
    >
      <Identicon size={18} value={address} className="pr-2" />
      <div className="w-36">{name}</div>

      {isOnChain ? (
        <div className="flex-grow text-gray-500 dark:text-gray-400">
          {address.slice(0, 4)}...{address.slice(-4)}
        </div>
      ) : (
        <div className="text-gray-500 dark:text-gray-400 text-xs flex-grow mr-3">not on-chain</div>
      )}
      <div className="w-14 text-gray-500 dark:text-gray-400">{displayDate(date)}</div>
    </Link>
  );
}
