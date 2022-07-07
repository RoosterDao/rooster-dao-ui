// Add Proposal Form

import { Button, Buttons } from '../../src/ui/components/common';
import { ErrorBoundary } from './ErrorBoundary';
import { Form, FormField } from '../../src/ui/components/form';
import { propose } from '../lib/api';
import { Page } from './Page';
import { useApi } from '../../src/ui/contexts';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useDaos, useGlobalAccountId, useProposals } from '../lib/hooks';
import { TransactionOptions } from './TransactionOptions';
import { Link } from 'react-router-dom';

export function AddProposal() {
  const { address } = useParams();
  if (!address) throw new Error('No address in url');

  const [description, setDescription] = useState('');
  const [options, setOptions] = useState({
    gasLimit: null,
    storageDepositLimit: null,
    value: null,
  });

  const { api, keyring } = useApi();
  const navigate = useNavigate();
  const { value: accountId } = useGlobalAccountId();
  const { getDao } = useDaos();
  const dao = getDao(address);
  const { addProposal } = useProposals();

  const createProposal = async () => {
    const proposal = await propose({
      api,
      callee: accountId,
      address,
      accountOrPair: keyring.getPair(accountId),
      description,
      options,
    });
    addProposal(address, proposal);
    navigate(`/dao/${address}/proposal/${proposal.id}`);
  };

  return (
    <ErrorBoundary>
      <Page>
        <h2 className="inline pr-8 text-xl font-semibold dark:text-white text-gray-700">
          Create a new proposal for{' '}
          <Link className="dark:hover:text-gray-300 hover:text-gray-400" to={`/dao/${address}`}>
            {' '}
            {dao.name}
          </Link>
        </h2>
        <div className="mt-4 grid grid-cols-12 w-full">
          <div className="col-span-8 lg:col-span-8 2xl:col-span-8 rounded-lg w-full">
            <Form>
              <FormField
                className="mt-4"
                help=""
                id="labelProposalDescription"
                label="Describe your proposal:"
                isError={false}
                message={''}
              >
                <textarea
                  cols={40}
                  rows={5}
                  onChange={e => setDescription(e.target.value)}
                  onFocus={e => e.target.select()}
                  value={description || ''}
                  className="w-full dark:bg-gray-900 dark:text-gray-300 bg-white dark:border-gray-700 border-gray-200 rounded text-sm"
                  placeholder={'My proposal'}
                />
              </FormField>

              <FormField
                help=""
                id="labelTransaction"
                label="What transaction should be executed if the proposal is accepted?"
                isError={false}
              >
                <div>TBD</div>
              </FormField>

              <TransactionOptions setOptions={setOptions} mutating={true}></TransactionOptions>

              <Buttons>
                <Button variant="primary" isDisabled={false} onClick={createProposal}>
                  Create Proposal
                </Button>
              </Buttons>
            </Form>
          </div>
        </div>
      </Page>
    </ErrorBoundary>
  );
}
