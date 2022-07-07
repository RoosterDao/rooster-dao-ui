import { Disclosure } from '@headlessui/react';
import { useParams } from 'react-router';
import { CopyButton } from '../../src/ui/components/common/CopyButton';
import { useApi } from '../../src/ui/contexts';
import { truncate } from '../../src/ui/util';
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
        <div className="col-span-4">
          {' '}
          <div className="inline-block">
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
                <strong>{accountOrPair.meta.name}</strong>
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
            <div className="mt-6">
              <div>Description:</div>
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
          <div className="w-40 float-right">
            <Timeline steps={steps}></Timeline>{' '}
          </div>
        </div>
      </div>
    </Page>
  );
}
