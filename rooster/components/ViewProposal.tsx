import {
  PencilAltIcon,
  ExclamationCircleIcon,
  StarIcon,
  ArrowCircleLeftIcon,
  ClockIcon,
} from '@heroicons/react/outline';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { CopyButton } from '../../src/ui/components/common/CopyButton';
import { useApi } from '../../src/ui/contexts';
import { truncate } from '../../src/helpers';
import { useCastVote, useGetVotes, useHasVoted, useProposalState } from '../lib/api';
import { useDaos, useGlobalAccountId, useProposals } from '../lib/hooks';
import { lastCellHeader, Table, TableRow } from './Table';
import { Page } from './Page';
import { Timeline, Step } from './ProposalTimeLine';
import { VoteType, VotingModal } from './VotingModal';
import { keyring } from '@polkadot/ui-keyring';

export function ViewProposal() {
  const { address, proposal: proposalId } = useParams();
  if (!address || !proposalId) throw new Error('No address in url');

  const [hasVoted, setHasVoted] = useState(false as Boolean | null);
  const [justVoted, setJustVoted] = useState(false);
  const [waitForVote, setWaitForVote] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [proposalVotes, setProposalVotes] = useState({} as Record<string, {}>);
  const [votes, setVotes] = useState(0);
 // const { keyring } = useApi();
  const { value: accountId } = useGlobalAccountId();
  const { getDao } = useDaos();
  const dao = getDao(address);
  const { getProposal } = useProposals();
  const proposal = getProposal(address, proposalId);

  const { txCastVote } = useCastVote(address);

  const { queryHasVoted } = useHasVoted(address);
  queryHasVoted(proposalId).then(setHasVoted);

  const { queryProposalVotes } = useProposalState(address);
  const { queryGetVotes } = useGetVotes(address);

  useEffect(() => {
    queryProposalVotes(proposalId).then(setProposalVotes);
  }, [proposal]);

  useEffect(() => {
    queryGetVotes(accountId).then(setVotes);
  }, [accountId]);

  const castVote = async (vote: VoteType) => {
    setWaitForVote(true);
    await txCastVote(proposalId, vote);
    queryHasVoted(proposalId).then(setHasVoted);
    queryProposalVotes(proposalId).then(setProposalVotes);
    queryGetVotes(accountId).then(setVotes);
    setWaitForVote(false);
    setJustVoted(true);
  };

  let votingState;
  let Icon;
  const currentDate = Date.now();
  const canVote = votes > 0 && currentDate > proposal?.voteStart && currentDate < proposal?.voteEnd;
  if (justVoted) {
    votingState = 'Your vote has been submitted successfully!';
    Icon = StarIcon;
  } else if (waitForVote) {
    votingState = 'Please wait, your vote is being submitted.';
    Icon = ClockIcon;
  } else if (currentDate < proposal?.voteStart) {
    votingState = 'Voting period has not yet started.';
    Icon = ExclamationCircleIcon;
  } else if (currentDate > proposal?.voteEnd) {
    votingState = 'Voting period has already ended.';
    Icon = ExclamationCircleIcon;
  } else if (hasVoted) {
    votingState = 'You have already voted on this proposal!';
    Icon = ExclamationCircleIcon;
  } else {
    votingState = "You don't have enough voting power to vote on this proposal.";
    Icon = ExclamationCircleIcon;
  }

  // derive dates
  const steps = [] as Step[];
  let index = 1;
  const creationDate = proposal?.voteStart - dao?.votingDelay || 0;
  if (creationDate === proposal?.voteStart) {
    steps.push({
      name: 'Proposal created Voting starts', //NOTE: only works because of fixed width of Timeline component
      date: creationDate,
      index,
    });
    index++;
  } else {
    steps.push({
      name: 'Proposal created',
      date: creationDate,
      index,
    });
    index++;
    steps.push({
      name: 'Voting starts',
      date: proposal.voteStart,
      index,
    });
    index++;
  }
  const executionStart = proposal.voteEnd + dao?.executionDelay || 0;
  if (executionStart === proposal?.voteEnd) {
    steps.push({
      name: 'Voting ends Transaction is ready to execute', //NOTE: only works because of fixed width of Timeline component
      date: proposal.voteEnd,
      index,
    });
  } else {
    steps.push({
      name: 'Voting ends',
      date: proposal.voteEnd,
      index,
    });
    index++;
    steps.push({
      name: 'Transaction is ready to execute',
      date: executionStart,
      index,
    });
  }

  return (
    <Page>
      <div className="grid grid-cols-6 w-full">
        <div className="col-span-3">
          <div className="inline-block">
            <div className="h-8 mb-4 text-sm">
              <Link to={`/dao/${address}`}>
                <button className="flex font-semibold items-center dark:text-gray-300 dark:bg-elevation-1 dark:hover:bg-elevation-2 dark:border-gray-700 text-gray-400 hover:text-gray-300 h-full  rounded">
                  <ArrowCircleLeftIcon
                    className="w-4 dark:text-gray-500 mr-1 justify-self-end"
                    aria-hidden="true"
                    fontSize="1.5rem"
                  />
                  {dao.name}
                </button>
              </Link>
            </div>
            <div>
              <div className="inline mr-4">Proposal ID:</div>
              <div className="inline mt-4 dark:text-gray-400 text-gray-500 text-sm">
                <div className="inline-flex items-center">
                  <span className="inline-block relative bg-blue-500 text-blue-400 bg-opacity-20 text-xs px-1.5 py-1 font-mono rounded">
                    {truncate(proposal.id, 15)}
                  </span>
                  <CopyButton className="ml-1" value={proposal.id} />
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="inline mr-3">Proposed by:</div>
              <div className="inline mr-4">
                <strong>{keyring.getPair(accountId).meta.name}</strong>
              </div>
              <div className="inline mt-4 dark:text-gray-400 text-gray-500 text-sm">
                <div className="inline-flex items-center">
                  <span className="inline-block relative bg-blue-500 text-blue-400 bg-opacity-20 text-xs px-1.5 py-1 font-mono rounded">
                    {truncate(proposal?.proposer, 6)}
                  </span>
                  <CopyButton className="ml-1" value={proposal?.proposer} />
                </div>
              </div>
            </div>
            {!hasVoted && canVote && !waitForVote ? (
              <a
                onClick={() => setIsOpen(true)}
                className="inline-flex mt-8 w-max justify-between items-center px-6 py-4 border text-gray-500 dark:border-gray-700 border-gray-200 rounded-md dark:bg-elevation-1 dark:hover:bg-elevation-2 hover:bg-gray-100 cursor-pointer"
              >
                <div className="flex items-center text-base dark:text-gray-300 text-gray-500 space-x-2">
                  <PencilAltIcon className="h-8 w-8 dark:text-gray-500 text-gray-400 group-hover:text-gray-500" />
                  <span>Vote</span>
                </div>
              </a>
            ) : (
              <div className="mt-8 flex items-center text-base dark:text-gray-300 text-gray-500 space-x-2">
                <Icon className="h-8 w-8 dark:text-gray-500 text-gray-400 group-hover:text-gray-500" />
                <span>{votingState}</span>
              </div>
            )}
            <div className="mt-8">
              <div className="mt-4 collapsible-panel">
                <div className="panel-body p-4 markdown border-t dark:border-gray-700 border-gray-200">
                  {/* eslint-disable-next-line react/no-children-prop */}
                  {proposal?.description}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-2">
          <Table
            classes="mt-8"
            header={
              <>
                <th className="w-36">For</th>
                <th className="w-36">Against</th>
                <th className={`${lastCellHeader} w-36`}>Abstain</th>
              </>
            }
            body={
              <TableRow key={index} index={index}>
                <td className="">{proposalVotes?.for ?? '...'}</td>
                <td className="">{proposalVotes?.against ?? '...'}</td>
                <td className="">{proposalVotes?.abstain ?? '...'}</td>
              </TableRow>
            }
          />
        </div>
        <div className="col-span-1">
          <div className="w-40 float-right">
            <Timeline steps={steps}></Timeline>{' '}
          </div>
        </div>
      </div>
      {isOpen && <VotingModal setIsOpen={setIsOpen} isOpen={isOpen} castVote={castVote} />}
    </Page>
  );
}
