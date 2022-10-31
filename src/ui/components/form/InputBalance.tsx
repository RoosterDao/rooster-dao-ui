// Copyright 2022 @paritytech/contracts-ui authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import React, { useState } from 'react';
import BN from 'bn.js';

import { InputNumber } from './InputNumber';
import { BN_ZERO, classes, fromBalance, fromSats, toBalance } from 'helpers';
import { ApiPromise, OrFalsy, SimpleSpread } from 'types';
import { useApi } from 'ui/contexts';

type Props = SimpleSpread<
  React.InputHTMLAttributes<HTMLInputElement>,
  {
    value?: BN;
    onChange: (_: BN) => void;
    withUnits?: boolean;
  }
>;

function getStringValue(api: ApiPromise, value: OrFalsy<BN>) {
  if (!value) {
    return '';
  }

  return fromBalance(fromSats(api, value || BN_ZERO));
}

function InputBalanceBase({
  children,
  className,
  value,
  onChange,
  withUnits = true,
  ...inputProps
}: Props) {
  const { api, tokenSymbol } = useApi();

  const [stringValue, setStringValue] = useState(getStringValue(api, value));

  return (
    <>
      <div className={classes('relative rounded-md shadow-sm', className)}>
        <InputNumber
          value={stringValue ?? 0}
          onChange={e => {
            const bn = toBalance(api, e.target.value);
            onChange(bn);
            setStringValue(e.target.value);
          }}
          className="input-balance"
          min="0"
          {...inputProps}
        />
        {withUnits && (
          <div className="absolute inset-y-0 right-0 flex items-center">
            <span className="text-gray-500 sm:text-sm mr-7">{tokenSymbol}</span>
          </div>
        )}
        {children}
      </div>
    </>
  );
}

export const InputBalance = React.memo(InputBalanceBase);
