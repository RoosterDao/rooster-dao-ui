// Copyright 2022 @paritytech/contracts-ui authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createContext, useContext, useEffect, useReducer } from 'react';
import { ApiPromise, Abi } from '../../src/types';
import { useApi } from '../../src/ui/contexts';
import abi from '../lib/metadata.json';

interface StateInterface {
  getVotes: Function;
  getProposalVoters: Function;
  getTopVoters: Function;
}

export const IndexerContext = createContext({} as StateInterface);
let latestBlock = 0;

const metadata = new Abi(abi);

export const IndexerContextProvider = ({ children }: React.PropsWithChildren<Partial<any>>) => {
  const { api }: { api: ApiPromise } = useApi();
  const [delegateVotes, setDelegateVotes] = useReducer((state, { dao, account, votes }) => {
    return { ...state, [dao]: { ...(state[dao] ?? {}), [account]: votes.toString() } };
  }, {});
  const [proposalVotes, addToProposalVotes] = useReducer((state, { dao, voter }) => {
    const newValue = state?.[dao]?.[voter] ? state[dao]?.[voter] + 1 : 1;
    return { ...state, [dao]: { ...(state[dao] ?? {}), [voter]: newValue } };
  }, {});

  const getVotes = (dao, accountId) => {
    return delegateVotes?.[dao]?.[accountId] ?? '0';
  };

  const getProposalVoters = dao => {
    return Object.values(proposalVotes?.[dao] ?? [])?.length ?? 0;
  };

  const getTopVoters = dao => {
    const votes = proposalVotes?.[dao] ?? {};
    return Object.keys(votes)
      .map(x => ({
        address: x,
        proposalsVoted: votes[x],
        totalVotes: getVotes(dao, x),
      }))
      .sort((a, b) => b.proposalsVoted - a.proposalsVoted);
  };

  const resolveEvents = events => {
    events.forEach(event => {
      if (!event) return;
      const { eventName, dao, args } = event;
      switch (eventName) {
        case 'ProposalCreated':
          break;
        case 'VoteCast':
          addToProposalVotes({ dao, voter: args[0].toHuman() });
          break;
        case 'DelegateChanged':
          break;
        case 'DelegateVotesChanged':
          setDelegateVotes({
            dao,
            account: args[0].toJSON(),
            votes: args[1].toJSON(),
          });
          break;
      }
    });
  };

  const traverseEvents = async block => {
    const events = (await block?.query?.system?.events()) ?? [];
    const mappedEvents = events.map(record => {
      const { event } = record;
      if (api.events.contracts.ContractEmitted.is(event)) {
        const [account_id, contract_evt] = event.data;
        // is there a better way to check if event is from specific contract?
        try {
          const decoded = metadata.decodeEvent(contract_evt);
          if (decoded) {
            return {
              dao: account_id.toJSON(),
              eventName: decoded.event.identifier,
              args: decoded.args,
            };
          }
        } catch {}
      }
    });
    return mappedEvents.filter(x => x).reverse();
  };

  const traverseBlocks = async childHeader => {
    const header = await api.rpc.chain.getHeader(childHeader.parentHash.toString());
    const block = await api.at(header.hash.toString());
    const events = await traverseEvents(block);
    if (header.number.toNumber() > 1) {
      const olderEvents = await traverseBlocks(header);
      return [...olderEvents, ...events];
    }
    return events;
  };

  const getChainData = async () => {
    await api.isReady;
    const header = await api.rpc.chain.getHeader();
    latestBlock = header.number.toNumber();
    // const events = await traverseBlocks(header);
    // resolveEvents(events);
    const currentBlock = await api.at(header.hash.toString());
    const eventsCurrentBlock = await traverseEvents(currentBlock);
    resolveEvents(eventsCurrentBlock);

    api.rpc.chain.subscribeNewHeads(async header => {
      // should work anyway, just a safety measure to not count any block twice
      if (latestBlock === header.number.toNumber()) {
        return;
      }
      latestBlock = header.number.toNumber();
      const block = await api.at(header.hash.toString());
      const events = await traverseEvents(block);
      resolveEvents(events);
    });
  };

  useEffect(() => {
    if (api) {
      getChainData();
    }
  }, [api]);

  const state = { getVotes, getProposalVoters, getTopVoters };

  return <IndexerContext.Provider value={state}>{children}</IndexerContext.Provider>;
};

export const useHackedIndexer = () => useContext(IndexerContext);
