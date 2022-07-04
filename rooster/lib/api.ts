// api functions

import { randomAsHex } from '@polkadot/util-crypto';
import { Abi, BN as BNType, ContractPromise as Contract } from '../../src/types';
import { BN } from '@polkadot/util';

import {
  createInstantiateTx,
  maximumBlockWeight,
  prepareContractTx,
  transformUserInput,
} from '../../src/api';
import abi from '../lib/metadata.json';
import { keyring } from '@polkadot/ui-keyring';

const defaultGasLimit = new BN('100000000000'); //TODO: check best way to determine gas limit

interface options {
  gasLimit: BN | null;
  storageDepositLimit: BN | null | undefined;
  value: BN | null | undefined;
}

interface instantiationArgs {
  name: string;
  votingPeriod: BNType;
  votingDelay: BNType;
  executionDelay: BNType;
}

export const instantiateDAO = ({
  api,
  accountOrPair,
  accountId,
  codeHash,
  args,
  options,
}: {
  api;
  accountOrPair;
  accountId;
  codeHash;
  args: instantiationArgs;
  options: options;
}) =>
  new Promise<any>((resolve, reject) => {
    const params = {
      codeHash,
      metadata: new Abi(abi),
      origin: accountId,
      weight: options.gasLimit || defaultGasLimit,
      storageDepositLimit: options.storageDepositLimit,
      argValues: args,
      salt: randomAsHex(),
      constructorIndex: 0,
      value: options.value,
    };

    const tx = createInstantiateTx(api, params);

    tx.signAndSend(accountOrPair, { signer: undefined }, async result => {
      await result;
      if (result.contract?.address) {
        keyring.saveContract(result.contract.address, { name: args.name, abi });
        const address = result.contract.address;
        resolve({
          address: address === 'string' ? address : address.toHuman(),
          name: args.name,
          votingDelay: args.votingDelay.toNumber(),
          votingPeriod: args.votingPeriod.toNumber(),
          executionDelay: args.executionDelay.toNumber(),
          abi,
        });
      }
    });
  });

export const propose = ({
  api,
  address,
  accountOrPair,
  callee,
  description,
  selector = '0x',
  transferredValue = null,
  gasLimit = null,
  options,
}) =>
  new Promise<any>((resolve, reject) => {
    const argValues = {
      transaction: {
        callee,
        selector,
        transferredValue,
        gasLimit,
      },
      description,
    };
    const metadata = new Abi(abi);
    const message = metadata.findMessage('propose');
    const contract = new Contract(api, metadata, address);
    const transformed = transformUserInput(contract.registry, message.args, argValues);
    if (!options.gasLimit) {
      options.gasLimit = defaultGasLimit;
    }
    const tx = prepareContractTx(contract.tx['propose'], options, transformed);
    tx.signAndSend(accountOrPair, { signer: undefined }, async result => {
      await result;
      result.events.forEach(record => {
        const { event } = record;
        if (api.events.contracts.ContractEmitted.is(event)) {
          const [account_id, contract_evt] = event.data;
          const decoded = new Abi(abi).decodeEvent(contract_evt);
          if (decoded.event.identifier === 'ProposalCreated') {
            resolve({
              id: decoded.args[0].toHuman(),
              proposer: decoded.args[1].toHuman(),
              description,
              voteStart: decoded.args[4].toNumber(),
              voteEnd: decoded.args[5].toNumber(),
            });
          }
        }
      });
    });
  });
