import { useParams } from 'react-router';
import { useApi } from '../../src/ui/contexts';
import { useDaos, useProposals } from '../lib/hooks';
import { Page } from './Page';
import { Timeline, Step } from './ProposalTimeLine';

export function ViewProposal() {
  const { address, proposal: proposalId } = useParams();
  const { api, keyring } = useApi();
  if (!address || !proposalId) throw new Error('No address in url');
  const { getDao } = useDaos();
  const dao = getDao(address);
  const { getProposal } = useProposals();
  const proposal = getProposal(address, proposalId);
  const accountOrPair = keyring.getPair(proposal?.proposer);

  // derive dates
  const steps = [] as Step[];
  let index = 1;
  const creationDate = proposal?.voteStart - dao?.votingDelay || 0;
  if (creationDate === proposal?.voteStart) {
    steps.push({
      name: 'Proposal created and voting starts',
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
      name: 'Voting ends and transaction is ready to execute',
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
      <div className="inline-block">
        <div>Id: {proposal.id}</div>
        <div>
          Proposer: {accountOrPair.meta.name} {proposal?.proposer}{' '}
        </div>
        <div>Description: {proposal?.description}</div>
      </div>

      <aside className="float-right w-40">
        <Timeline steps={steps}></Timeline>{' '}
      </aside>
    </Page>
  );
}
