// Copyright 2022 @paritytech/contracts-ui authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useEffect, useRef, useState } from 'react';
import { useApi } from 'ui/contexts/ApiContext';
import { AbiParam, ApiPromise, Keyring, SetState } from 'types';
import { getInitValue } from 'ui/util';

type ArgValues = Record<string, unknown>;

function fromArgs(api: ApiPromise, keyring: Keyring, args: AbiParam[] | null): ArgValues {
  const result: ArgValues = {};

  (args || []).forEach(({ name, type }) => {
    result[name] = getInitValue(api.registry, keyring, type);
  });

  return result;
}

export function useArgValues(args: AbiParam[] | null): [ArgValues, SetState<ArgValues>] {
  const { api, keyring } = useApi();
  const [value, setValue] = useState<ArgValues>(fromArgs(api, keyring, args));
  const argsRef = useRef(args);

  useEffect((): void => {
    if (argsRef.current !== args) {
      setValue(fromArgs(api, keyring, args));
      argsRef.current = args;
    }
  }, [api, keyring, args]);

  return [value, setValue];
}
