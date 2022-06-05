// Copyright 2022 @paritytech/contracts-ui authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

// Components
import { Page } from '../../src/ui/templates';
import { AccountSelect } from '../../src/ui/components/account';
import { Input, Form, FormField } from '../../src/ui/components/form';

// Hooks
import { useEffect, useState } from 'react';
import { useApi } from '../../src/ui/contexts';
import { useLocalStorage, useAccountId, useBalance } from '../../src/ui/hooks';

// utils
import { getContractInfo } from '../../src/api';

export function Flipper() {
  const [savedAddress, saveAddress] = useLocalStorage<string>('flipper_address', '');
  const { value: accountId, onChange: setAccountId, ...accountIdValidation } = useAccountId();
  const { value: balance, onChange: setValue, ...valueValidation } = useBalance(100);

  const [address, setAddress] = useState(savedAddress);
  const [isOnChain, setIsOnChain] = useState(true);
  const [accountBalance, setAccountBalance] = useState(0);

  const { api } = useApi();

  useEffect(() => {
    getContractInfo(api, address)
      .then(info => setIsOnChain(!!info))
      .catch(() => setIsOnChain(false));
  }, [api, address]);

  useEffect(() => {
    if (isOnChain) {
      saveAddress(address);
    }
  }, [isOnChain]);

  useEffect(() => {
    console.log("account address", accountId);
  }, [accountId]);

  return (
    <Page
      header="Flipper"
      help={
        <>
          Test the Flipper smart contract. Contract code is slightly changed to emit a "flipped"
          event.
        </>
      }
    >
      <div className="-my-2 sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="mt-4">
            <div className="-my-2 sm:-mx-6 lg:-mx-8">
              <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div className="mt-4">
                  <Form>
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
                    <FormField
                      className="mb-8"
                      help="The sending account for this interaction. Any transaction fees will be deducted from this account."
                      id="accountId"
                      label="Account"
                      {...accountIdValidation}
                    >
                      <AccountSelect
                        isDisabled={!isOnChain}
                        id="accountId"
                        className="mb-2"
                        value={accountId}
                        onChange={setAccountId}
                      />
                    </FormField>
                  
                  </Form>
                
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}
