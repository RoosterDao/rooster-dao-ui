// api functions

import { randomAsHex } from '@polkadot/util-crypto';
import {
  Abi,
  BN as BNType,
  ContractPromise as Contract,
  ContractOptions,
  UseBalance,
} from '../../src/types';
import { BN } from '@polkadot/util';

import { createInstantiateTx, prepareContractTx, transformUserInput } from '../../src/api';
import abiJSON from '../lib/metadata.json';
import { useApi } from '../../src/ui/contexts';
import { useGlobalAccountId } from './hooks';
import { Balance } from '@polkadot/types/interfaces';

const abi = new Abi(abiJSON);
const defaultGasLimit = new BN('100000000000'); //TODO: check best way to determine gas limit

type options = ContractOptions;

interface instantiationArgs {
  name: string;
  votingPeriod: BNType;
  votingDelay: BNType;
  executionDelay: BNType;
  nftPrice: Balance;
}

export const useInstantiateDao = () => {
  const { api, keyring } = useApi();
  const { value: accountId } = useGlobalAccountId();
  const accountOrPair = keyring.getPair(accountId);

  const instantiateDAO = ({
    codeHash,
    args,
    options,
  }: {
    codeHash: string;
    args: instantiationArgs;
    options: options;
  }) =>
    new Promise<any>((resolve, reject) => {
      const params = {
        codeHash,
        metadata: abi,
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
        if (result.isCompleted) {
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
          } else {
            reject();
          }
        }
      });
    });

  const createCollection = (dao: string, options: options) =>
    new Promise<any>((resolve, reject) => {
      const contract = new Contract(api, abi, dao);
      contract.tx
        .createCollection(options)
        .signAndSend(accountOrPair, { signer: undefined }, async result => {
          await result;
          if (result.isCompleted) {
            (result?.events ?? []).forEach(record => {
              const { event } = record;
              if (api.events.contracts.ContractEmitted.is(event)) {
                const [account_id, contract_evt] = event.data;
                const decoded = abi.decodeEvent(contract_evt);
                if (decoded.event.identifier === 'CollectionCreated') {
                  resolve(decoded.args[0].toHuman());
                }
              }
            });
          } else if (result.isError) {
            reject();
          }
        });
    });

  return { instantiateDAO, createCollection };
};

export const useBecomeMember = () => {
  const { api, keyring } = useApi();
  const { value: accountId } = useGlobalAccountId();
  const accountOrPair = keyring.getPair(accountId);

  const becomeMember = (dao: string, options: options, nftValue: UseBalance) =>
    new Promise<any>((resolve, reject) => {
      const contract = new Contract(api, abi, dao);
      contract.tx
        .becomeMember(Object.assign({}, options, { value: nftValue }))
        .signAndSend(accountOrPair, { signer: undefined }, async result => {
          await result;
          if (result.isCompleted) {
            resolve(true);
          } else if (result.isError) {
            reject();
          }
        });
    });

  return { becomeMember };
};

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
    const message = abi.findMessage('propose');
    const contract = new Contract(api, abi, address);
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
          const decoded = abi.decodeEvent(contract_evt);
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

export function useDelegate(dao) {
  const { api, keyring } = useApi();
  const { value: caller } = useGlobalAccountId();

  const delegate = (accountId, options) =>
    new Promise<any>((resolve, reject) => {
      const message = abi.findMessage('delegate');
      const contract = new Contract(api, abi, dao);
      const transformed = transformUserInput(contract.registry, message.args, {
        delegate: accountId,
      });
      if (!options.gasLimit) {
        options.gasLimit = defaultGasLimit;
      }
      const tx = prepareContractTx(contract.tx['delegate'], options, transformed);
      tx.signAndSend(keyring.getPair(caller), { signer: undefined }, async result => {
        await result;
        if (result.events.length > 0) {
          resolve(true);
        }
      });
    });

  return { delegate };
}

export function useGetNftPrice(dao: string) {
  const { api } = useApi();
  const { value: caller } = useGlobalAccountId();

  const queryGetNftPrice = async (): Promise<any | null> => {
    const contract = new Contract(api, abi, dao);
    const result = await contract.query.getNftPrice(caller, {});
    if (result.result.isOk) {
      return result?.output || null;
    } else {
      return null;
    }
  };

  return { queryGetNftPrice };
}

export function useGetNft(dao: string) {
  const { api } = useApi();
  const { value: caller } = useGlobalAccountId();

  const queryGetNft = async (accountId = caller): Promise<String | null> => {
    const contract = new Contract(api, abi, dao);
    const result = await contract.query.getNft(accountId, {}, accountId);
    if (result.result.isOk) {
      return result.output?.toHuman() as String | null;
    } else {
      return null;
    }
  };

  return { queryGetNft };
}

export function useCastVote(dao) {
  const { api, keyring } = useApi();
  const { value: caller } = useGlobalAccountId();

  const txCastVote = (proposalId, vote, options = {}) =>
    new Promise<any>((resolve, reject) => {
      const message = abi.findMessage('castVote');
      const contract = new Contract(api, abi, dao);
      const transformed = transformUserInput(contract.registry, message.args, {
        proposalId,
        vote,
      });
      if (!options.gasLimit) {
        options.gasLimit = defaultGasLimit;
      }
      const tx = prepareContractTx(contract.tx['castVote'], options, transformed);
      tx.signAndSend(keyring.getPair(caller), { signer: undefined }, async result => {
        await result;
        if (result.events.length > 0) {
          resolve(true);
        }
      });
    });

  return { txCastVote };
}

export function useHasVoted(dao) {
  const { api } = useApi();
  const { value: caller } = useGlobalAccountId();

  const queryHasVoted = async (proposalId, accountId = caller): Promise<Boolean | null> => {
    const contract = new Contract(api, abi, dao);
    const result = await contract.query.hasVoted(caller, {}, proposalId, accountId);
    if (result.result.isOk) {
      return result.output?.toHuman() as Boolean | null;
    } else {
      return null;
    }
  };

  return { queryHasVoted };
}

export function useGetVotes(dao) {
  const { api } = useApi();
  const { value: caller } = useGlobalAccountId();

  const queryGetVotes = async (accountId = caller): Promise<number | null> => {
    const contract = new Contract(api, abi, dao);
    const result = await contract.query.getVotes(caller, {}, accountId);
    if (result.result.isOk) {
      return result.output?.toNumber() as number | null;
    } else {
      return null;
    }
  };

  return { queryGetVotes };
}

export function useProposalState(dao) {
  const { api } = useApi();
  const { value: caller } = useGlobalAccountId();

  const queryState = async (proposalId): Promise<string | null> => {
    const contract = new Contract(api, abi, dao);
    const result = await contract.query.state(caller, {}, proposalId);
    if (result.result.isOk) {
      return result.output?.toHuman() as string;
    } else {
      return null;
    }
  };

  const queryProposalVotes = async (proposalId): Promise<{ for; against; abstain }> => {
    const contract = new Contract(api, abi, dao);
    const result = await contract.query.proposalVotes(caller, {}, proposalId);
    if (result.result.isOk) {
      const array = result.output?.toArray?.().map(x => x.toNumber()) ?? [0, 0, 0];
      return { for: array[1], against: array[0], abstain: array[2] };
    } else {
      return { for: 0, against: 0, abstain: 0 };
    }
  };

  return { queryState, queryProposalVotes, useGetVotes };
}
