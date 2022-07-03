import { useParams } from 'react-router';
import { useApi } from '../../src/ui/contexts';
import { useProposals } from '../lib/hooks';
import { Page } from './Page';

export function ViewProposal() {
  const { address, proposal: proposalId } = useParams();
  const { api, keyring } = useApi();
  if (!address || !proposalId) throw new Error('No address in url');
  const { getProposal } = useProposals();
  const proposal = getProposal(address, proposalId);
  const accountOrPair = keyring.getPair(proposal?.proposer);

  return (
    <Page>
      <div>Id: {proposal.id}</div>
      <div>Proposer: {accountOrPair.meta.name} {proposal?.proposer} </div>
      <div>Description: {proposal?.description}</div>
      <div>Voting Start: {new Date(proposal?.voteStart).toLocaleString()}</div>
      <div>Voting End: {new Date(proposal?.voteEnd).toLocaleString()}</div>
    </Page>
  );
}
