// Copyright 2022 @paritytech/contracts-ui authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Link } from 'react-router-dom';
import { ChevronRightIcon, CodeIcon, UploadIcon } from '@heroicons/react/outline';
import { Page } from '../../src/ui/templates';
import { Input, FormField } from '../../src/ui/components/form';
import { useEffect, useState } from 'react';
import { getContractInfo } from '../../src/api';
import { useApi } from '../../src/ui/contexts';

export function Flipper() {
  const [address, setAddress] = useState('');
  const [isOnChain, setIsOnChain] = useState(true);
  const { api } = useApi();

  useEffect(() => {
    getContractInfo(api, address)
      .then(info => setIsOnChain(!!info))
      .catch(() => setIsOnChain(false));
  }, [api, address]);

  return (
    <Page
      header="Flipper"
      help={
        <>
          Test the Flipper smart contract. Contract code is slightly changed to emit a flip event.
        </>
      }
    >
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="mt-4">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div className="mt-4">
                  <FormField
                    help=""
                    id="address"
                    label="Flipper contract address"
                    isError={!isOnChain}
                    message={'Please enter a valid smart contract address to continue.'}
                  >
                    <Input
                      isDisabled={false}
                      placeholder="Enter the address of the flipper smart contract"
                      onChange={value => setAddress(value)}
                      onFocus={e => e.target.select()}
                      type="text"
                      value={address}
                    />
                  </FormField>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}
