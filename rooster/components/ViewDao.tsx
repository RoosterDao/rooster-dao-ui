// view single dao

import { Button } from '../../src/ui/components/common';
import { CopyButton } from '../../src/ui/components/common/CopyButton';
import { Page } from './Page';
import { truncate } from '../../src/ui/util';
import { useDaos, useGlobalAccountId, useProposals } from '../lib/hooks';
import { useNavigate, useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { PlusSmIcon, TrashIcon, UserIcon, InformationCircleIcon } from '@heroicons/react/outline';
import { useHackedIndexer } from './HackedIndexerContext';
import { DelegationModal } from './DelegationModal';
import { useEffect, useReducer, useState } from 'react';
import { useDelegate, useGetNft, useGetVotes, useProposalState } from '../lib/api';
import ReactTooltip from 'react-tooltip';
import {
  firstCellBody,
  firstCellHeader,
  lastCellBody,
  lastCellHeader,
  Table,
  TableRow,
} from './Table';
import { useApi } from '../../src/ui/contexts';
import { BecomeMemberModal } from './BecomeMemberModal';

const SHORT_DESCRIPTION_LENGTH = 200;

export function ViewDao() {
  const { address } = useParams();
  if (!address) throw new Error('No address in url');
  const navigate = useNavigate();
  const { keyring } = useApi();
  const [delegationModalOpen, openDelegationModal] = useState(false);
  const [becomeMemberModalOpen, openBecomeMemberModal] = useState(false);
  const [votes, setVotes] = useState(0);
  const [isMember, setIsMember] = useState(false);
  const [proposalStates, setProposalStates] = useReducer((state, { id, value }) => {
    return { ...state, [id]: value };
  }, {} as Record<string, string | null>);
  const [proposalVotes, setProposalVotes] = useReducer((state, { id, votes }) => {
    return { ...state, [id]: votes };
  }, {} as Record<string, string | null>);

  const { getDao, forgetDao } = useDaos();
  const { getProposalsForDao } = useProposals();
  const dao = getDao(address);
  const proposals = getProposalsForDao(dao?.address);
  const { getTopVoters } = useHackedIndexer();
  const topVotes = getTopVoters(address);

  const { queryGetVotes } = useGetVotes(address);
  const { queryGetNft } = useGetNft(address);

  const { queryState, queryProposalVotes } = useProposalState(address);
  const { value: accountId } = useGlobalAccountId();

  useEffect(() => {
    proposals.map(proposal => {
      queryState(proposal.id).then(value => setProposalStates({ id: proposal.id, value }));
      queryProposalVotes(proposal.id).then(votes => setProposalVotes({ id: proposal.id, votes }));
    });
  }, [JSON.stringify(proposals), address]);

  useEffect(() => {
    queryGetVotes().then(votes => setVotes(votes));
    queryGetNft().then(result => {
      setIsMember(result?.Err !== 'NotOwner');
    });
  }, [accountId, address]);

  const delegateVote = () => {
    queryGetVotes().then(votes => setVotes(votes));
  };

  const getNft = () => {
    queryGetNft().then(result => setIsMember(result?.Err !== 'NotOwner'));
  };

  const forget = () => {
    forgetDao(dao);
    navigate('/explore');
  };

  return (
    <Page>
      <h2 className="inline pr-8 text-xl font-semibold dark:text-white text-gray-700 capitalize">
        {dao?.name}
      </h2>
      <div className="inline mt-4 dark:text-gray-400 text-gray-500 text-sm">
        <div className="inline-flex items-center">
          <span className="inline-block relative bg-blue-500 text-blue-400 bg-opacity-20 text-xs px-1.5 py-1 font-mono rounded">
            {truncate(address, 4)}
          </span>
          <CopyButton className="ml-1" value={address} />
        </div>
      </div>
      <Button
        className="float-right border-2 dark:border-gray-700 border-gray-200"
        onClick={forget}
      >
        <TrashIcon className="w-4 dark:text-gray-500 mr-1 justify-self-end" />
        Forget DAO
      </Button>
      <div>
        {!isMember && (
          <a
            onClick={() => openBecomeMemberModal(true)}
            className="inline-flex mt-12 w-max justify-between items-center px-6 py-4 border text-gray-500 dark:border-gray-700 border-gray-200 rounded-md dark:bg-elevation-1 dark:hover:bg-elevation-2 hover:bg-gray-100 cursor-pointer"
          >
            <div className="flex items-center text-base dark:text-gray-300 text-gray-500 space-x-2">
              <UserIcon className="h-8 w-8 dark:text-gray-500 text-gray-400 group-hover:text-gray-500" />
              <span>Become member</span>
            </div>
          </a>
        )}
        {!isMember && (
          <>
            <InformationCircleIcon
              className="inline cursor-help ml-1.5 pt-4 w-8 h-8 dark:text-gray-500"
              data-tip
              data-for={`formFieldHelp-delegation`}
            />
            <ReactTooltip id={`formFieldHelp-delegation`}>
              Get the NFT to become part of this DAO.
            </ReactTooltip>
          </>
        )}
        {votes !== 0 && isMember && (
          <Link
            to={`/dao/${address}/proposal/new`}
            className="inline-flex mt-12 mr-6 w-max justify-between items-center px-6 py-4 border text-gray-500 dark:border-gray-700 border-gray-200 rounded-md dark:bg-elevation-1 dark:hover:bg-elevation-2 hover:bg-gray-100"
          >
            <div className="flex items-center text-base dark:text-gray-300 text-gray-500 space-x-2">
              <PlusSmIcon className="h-8 w-8 dark:text-gray-500 text-gray-400 group-hover:text-gray-500" />
              <span>Create new proposal</span>
            </div>
          </Link>
        )}
        {isMember && (
          <a
            onClick={() => openDelegationModal(true)}
            className="inline-flex mt-12 w-max justify-between items-center px-6 py-4 border text-gray-500 dark:border-gray-700 border-gray-200 rounded-md dark:bg-elevation-1 dark:hover:bg-elevation-2 hover:bg-gray-100 cursor-pointer"
          >
            <div className="flex items-center text-base dark:text-gray-300 text-gray-500 space-x-2">
              <UserIcon className="h-8 w-8 dark:text-gray-500 text-gray-400 group-hover:text-gray-500" />
              <span>Delegate vote</span>
            </div>
          </a>
        )}
        {votes === 0 && isMember && (
          <>
            <InformationCircleIcon
              className="inline cursor-help ml-1.5 pt-4 w-8 h-8 dark:text-gray-500"
              data-tip
              data-for={`formFieldHelp-delegation`}
            />
            <ReactTooltip id={`formFieldHelp-delegation`}>
              You don't have enough voting power yet to vote on proposals or to create new
              proposals. Start with delegating your vote to yourself.
            </ReactTooltip>
          </>
        )}
      </div>

      <h2 className="mt-12 mb-3 text-xl font-semibold dark:text-white text-gray-700">Proposals</h2>

      {proposals.length > 0 ? (
        <Table
          classes="w-full"
          header={
            <>
              <th className={firstCellHeader}>Description</th>
              <th className="w-40">State</th>
              <th className="w-40">For</th>
              <th className="w-40">Against</th>
              <th className={`${lastCellHeader} w-40`}>Abstain</th>
            </>
          }
          body={proposals.map((proposal, index) => (
            <TableRow
              key={proposal.id}
              index={index}
              onClick={() => navigate(`/dao/${address}/proposal/${proposal.id}`)}
            >
              <td className={firstCellBody}>
                <Link to={`/dao/${address}/proposal/${proposal.id}`}>
                  {proposal.description.length <= SHORT_DESCRIPTION_LENGTH
                    ? proposal.description
                    : proposal.description.substring(0, 140) + '.....'}
                </Link>
              </td>
              <td>{proposalStates[proposal.id] ?? '...'}</td>
              <td className="">{proposalVotes[proposal.id]?.for ?? '...'}</td>
              <td className="">{proposalVotes[proposal.id]?.against ?? '...'}</td>
              <td className={lastCellBody}>{proposalVotes[proposal.id]?.abstain ?? '...'}</td>
            </TableRow>
          ))}
        />
      ) : (
        'No proposals yet'
      )}

      <h2 className="mt-12 mb-3 text-xl font-semibold dark:text-white text-gray-700">Top Voters</h2>
      {topVotes.length > 0 ? (
        <Table
          classes="w-full"
          header={
            <>
              <th className={`${firstCellHeader} w-20`}>#</th>
              <th className="text-left">Voter</th>
              <th>Address</th>
              <th className="w-40">Proposals voted</th>
              <th className="w-40">Total Votes</th>
              <th className={`${lastCellHeader} w-40`}>Voting power</th>
            </>
          }
          body={topVotes.map((voter, index) => (
            <TableRow key={voter.address} index={index}>
              <td className={firstCellBody}>{index + 1}</td>
              <td className="text-left">
                <div className="inline mr-4">
                  <strong>{keyring.getPair(voter.address).meta.name}</strong>
                </div>
              </td>
              <td>
                {' '}
                <div className="inline mt-4 dark:text-gray-400 text-gray-500 text-sm">
                  <div className="inline-flex items-center">
                    <span className="inline-block relative bg-blue-500 text-blue-400 bg-opacity-20 text-xs px-1.5 py-1 font-mono rounded">
                      {truncate(voter.address, 6)}
                    </span>
                    <CopyButton className="ml-1" value={voter.address} />
                  </div>
                </div>
              </td>
              <td className="">{voter.proposalsVoted}</td>
              <td className="">{voter.totalVotes}</td>
              <td className={lastCellBody}>tbd</td>
            </TableRow>
          ))}
        />
      ) : (
        'No voters yet'
      )}

      {delegationModalOpen && (
        <DelegationModal
          setIsOpen={openDelegationModal}
          isOpen={delegationModalOpen}
          onSuccess={delegateVote}
          dao={address}
        />
      )}
      {becomeMemberModalOpen && (
        <BecomeMemberModal
          dao={address}
          setIsOpen={openBecomeMemberModal}
          isOpen={becomeMemberModalOpen}
          onSuccess={getNft}
        />
      )}
    </Page>
  );
}
