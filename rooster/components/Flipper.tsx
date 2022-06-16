// Copyright 2022 @paritytech/contracts-ui authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

// Components
import { PageFull } from '../../src/ui/templates';
import { AccountSelect } from '../../src/ui/components/account';
import { Input, InputGas, Form, FormField } from '../../src/ui/components/form';
import { Button, Buttons } from '../../src/ui/components/common';

// Hooks
import { useEffect, useState } from 'react';
import { useApi } from '../../src/ui/contexts';
import { useLocalStorage, useAccountId, useWeight, useContract } from '../../src/ui/hooks';

// utils
import { getContractInfo, toBalance } from '../../src/api';
import { Abi, ContractPromise as Contract } from '../../src/types';
import abi from '../../contracts/examples/flipper/metadata.json';

export function Flipper() {
  const [savedAddress, saveAddress] = useLocalStorage<string>('flipper_address', '');
  const { value: accountId, onChange: setAccountId, ...accountIdValidation } = useAccountId();

  const [address, setAddress] = useState(savedAddress);
  const [isOnChain, setIsOnChain] = useState(true);
  const [accountBalance, setAccountBalance] = useState(0);
  const [currentState, setFlipState] = useState<boolean>(false);
  const [flipEvents, setFlipEvents] = useState([]);

  const { api, keyring } = useApi();
  const weight = useWeight(toBalance(api, 1));
  const { data: contractData, isLoading, isValid } = useContract(address);

  const flip = async () => {
    let injector = null;
    const accountOrPair = keyring.getPair(accountId);
    new Contract(api, new Abi(abi), address).tx
      .flip({ value: undefined, gasLimit: weight.weight.addn(1), storageDepositLimit: undefined })
      .signAndSend(accountOrPair, { signer: injector?.signer || undefined }, async result => {
        await result;
        result.events.forEach(record => {
          const { event } = record;
          if (api.events.contracts.ContractEmitted.is(event)) {
            const [account_id, contract_evt] = event.data;
            const decoded = new Abi(abi).decodeEvent(contract_evt);
            if (decoded.event.identifier === 'Flipped') {
              setFlipEvents([...flipEvents, 'Flipped by: ' + accountOrPair.meta.name]);
            }
          }
        });
      });
  };

  useEffect(() => {
    getContractInfo(api, address)
      .then(info => setIsOnChain(!!info))
      .catch(() => setIsOnChain(false));
  }, [api, address]);

  useEffect(() => {
    if (isOnChain) {
      saveAddress(address);
      new Contract(api, new Abi(abi), address).query
        .get(address, {})
        .then(result => setFlipState(result.output?.isTrue));
    }
  }, [isOnChain]);

  useEffect(() => {
    new Contract(api, new Abi(abi), address).query
      .get(address, {})
      .then(result => setFlipState(result.output?.isTrue));
  }, [flipEvents]);

  useEffect(() => {
    api.query.system.account(accountId).then(accountInfo => {
      setAccountBalance(accountInfo.data.free.toHuman());
    });
  }, [accountId, api, flipEvents]);

  return (
    <PageFull
      header="Flipper"
      help={
        <>
          Test the Flipper smart contract. Contract code is slightly changed to emit a "flipped"
          event.
        </>
      }
    >
      <div className="grid grid-cols-12 w-full">
        <div className="col-span-8 lg:col-span-8 2xl:col-span-8 rounded-lg w-full">
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
            <FormField
              className="mt-4"
              help=""
              id="currentBalanceLabel"
              label="Current Balance"
              isError={false}
              message={''}
            >
              <div>
                <span className="font-semibold"> {accountBalance}</span> sats
              </div>
            </FormField>

            <FormField
              className="mt-4"
              help="The maximum amount of gas (in millions of units) to use for this contract call. If the call requires more, it will fail."
              id="maxGas"
              label="Max Gas Allowed"
              isError={false}
              message={''}
            >
              <InputGas isCall={true} withEstimate {...weight} />
            </FormField>
            <Buttons>
              <Button variant="primary" isDisabled={!isOnChain} onClick={flip}>
                Flip
              </Button>
            </Buttons>
            <FormField
              className="mt-4"
              help=""
              id="currentStateLabel"
              label="Current State"
              isError={false}
              message={''}
            >
              <div>{currentState ? 'TRUE' : 'FALSE'}</div>
            </FormField>
          </Form>
        </div>
        <div className="col-span-3 lg:col-span-3 2xl:col-span-4 pl-10 lg:pl-20 w-full">
          <h1 className="text-xl font-semibold dark:text-white text-gray-700 capitalize">
            Recent events
          </h1>
          {flipEvents.map(event => (
            <div>{event}</div>
          ))}
        </div>
      </div>
    </PageFull>
  );
}
