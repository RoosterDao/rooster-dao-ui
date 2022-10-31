// rooster dao

import { useEffect, useLayoutEffect, useState } from 'react';
import { useLocalStorage } from '../../src/ui/hooks';
import { useApi } from '../../src/ui/contexts';
import { BehaviorSubject } from 'rxjs';

const DAO_LOCAL_STORAGE = 'rooster_dao_daos';
const PROPOSAL_LOCAL_STORAGE = 'rooster_dao_proposals';

interface dao {
  address: string;
  name: string;
  votingDelay: number;
  votingPeriod: number;
  executionDelay: number;
  abi: Record<string, unknown>;
  collectionId: string;
}

interface proposal {
  id: string;
  proposer: string;
  //transaction
  description: string;
  voteStart: Number;
  voteEnd: Number;
}

// Workaround to not introduce another context provider
const daosSubject = new BehaviorSubject(
  JSON.parse(window.localStorage.getItem(DAO_LOCAL_STORAGE) || '[]') as dao[]
);

const proposalsSubject = new BehaviorSubject(
  JSON.parse(window.localStorage.getItem(PROPOSAL_LOCAL_STORAGE) || '{}') as Record<
    string,
    proposal[]
  >
);

const accountSubject = new BehaviorSubject('5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY');

export function useProposals() {
  const [proposals, setProposals] = useLocalStorage<Record<string, proposal[]>>(
    PROPOSAL_LOCAL_STORAGE,
    {} as Record<string, proposal[]>
  );

  const addProposal = (dao, proposal) => {
    proposalsSubject.next({ ...proposals, [dao]: [...(proposals?.[dao] ?? []), proposal] });
  };

  const getProposalsForDao = dao => {
    return proposals[dao] ? Object.values(proposals[dao]) : [];
  };

  const getProposal = (dao, proposalId) => {
    return getProposalsForDao(dao).find(x => x.id === proposalId) ?? null;
  };

  const forgetProposalsForDao = dao => {
    delete proposals[dao];
    proposalsSubject.next({ ...proposals });
  };

  const forgetAllProposals = () => {
    proposalsSubject.next({});
  };

  useEffect(() => {
    const sub = proposalsSubject.subscribe(p => setProposals(p));

    return () => {
      sub?.unsubscribe();
    };
  }, []);

  return {
    proposals,
    addProposal,
    getProposal,
    getProposalsForDao,
    forgetProposalsForDao,
    forgetAllProposals,
  };
}

export function useDaos() {
  const [daosList, setDaosList] = useLocalStorage<dao[]>(DAO_LOCAL_STORAGE, [] as dao[]);
  const { forgetProposalsForDao, forgetAllProposals } = useProposals();

  const addDao = (dao: dao, collectionId) => {
    daosSubject.next([...daosList, Object.assign({}, dao, { collectionId })]);
  };

  const getDao = address => {
    return daosList.find(dao => dao.address === address) || null;
  };

  const forgetDao = (dao: dao | null) => {
    dao && daosSubject.next(daosList.filter(x => x.address !== dao.address));
    dao && forgetProposalsForDao(dao.address);
  };

  const forgetAllDaos = () => {
    daosSubject.next([]);
    forgetAllProposals();
  };

  useEffect(() => {
    const sub = daosSubject.subscribe(daos => setDaosList(daos));

    return () => {
      sub?.unsubscribe();
    };
  }, []);

  return { daosList, addDao, getDao, forgetDao, forgetAllDaos };
}

export const useGlobalAccountId = () => {
  const { accounts } = useApi();
  const [value, setAccountId] = useState(accounts?.[0]?.address ?? "");

  const onChange = acc => {
    accountSubject.next(acc);
  };

  useLayoutEffect(() => {
    const sub = accountSubject.subscribe(account => setAccountId(account));

    return () => {
      sub?.unsubscribe();
    };
  }, []);

  return { value, onChange, accountIdValidation: {} };
};
