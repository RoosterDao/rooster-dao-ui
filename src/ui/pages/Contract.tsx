// Copyright 2022 @paritytech/contracts-ui authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BookOpenIcon, PlayIcon } from '@heroicons/react/outline';
import { InteractTab } from '../components/contract/Interact';
import { MetadataTab } from '../components/contract/Metadata';
import { CopyButton } from '../components/common/CopyButton';
import { Loader } from '../components/common/Loader';
import { Tabs } from '../components/common/Tabs';
import { HeaderButtons } from '../components/common/HeaderButtons';
import { PageFull } from 'ui/templates';
import { checkOnChainCode, displayDate, truncate } from 'helpers';
import { useApi, useDatabase } from 'ui/contexts';
import { ContractDocument, ContractPromise } from 'types';

const TABS = [
  {
    id: 'metadata',
    label: (
      <>
        <BookOpenIcon />
        Metadata
      </>
    ),
  },
  {
    id: 'interact',
    label: (
      <>
        <PlayIcon />
        Interact
      </>
    ),
  },
];

export function Contract() {
  const navigate = useNavigate();
  const { api } = useApi();
  const { db } = useDatabase();

  const { address, activeTab = 'interact' } = useParams();

  const [contract, setContract] = useState<ContractPromise>();
  const [document, setDocument] = useState<ContractDocument>();

  if (!address) throw new Error('No address in url');

  const [tabIndex, setTabIndex] = useState(TABS.findIndex(({ id }) => id === activeTab) || 1);

  const [isOnChain, setIsOnChain] = useState<boolean>();

  useEffect(() => {
    document &&
      checkOnChainCode(api, document.codeHash || '')
        .then(isOnChain => setIsOnChain(isOnChain))
        .catch(console.error);
  }, [api, document]);

  useEffect((): void => {
    async function getContract() {
      const d = await db.contracts.get({ address });
      d ? setDocument(d) : navigate('/');
    }
    getContract().catch(e => {
      console.error(e);
    });
  }, [address, api, db.contracts, navigate]);

  useEffect(() => {
    if (!document || !address) return;
    const c = new ContractPromise(api, document.abi, address);
    setContract(c);
  }, [address, api, document]);

  if (!document || !contract) {
    return null;
  }

  const projectName = contract?.abi.info.contract.name;

  return (
    <Loader isLoading={isOnChain === undefined} message="Loading contract...">
      <PageFull
        accessory={<HeaderButtons contract={document} />}
        header={document.name || projectName}
        help={
          isOnChain && (
            <div>
              You instantiated this contract{' '}
              <div className="inline-flex items-center">
                <span className="inline-block relative bg-blue-500 text-blue-400 bg-opacity-20 text-xs px-1.5 py-1 font-mono rounded">
                  {truncate(address, 4)}
                </span>
                <CopyButton className="ml-1" value={address} />
              </div>{' '}
              from{' '}
              <Link
                to={`/instantiate/${document.codeHash}`}
                className="inline-block relative bg-blue-500 text-blue-400 bg-opacity-20 text-xs px-1.5 py-1 font-mono rounded"
              >
                {projectName}
              </Link>{' '}
              on {displayDate(document.date)}
            </div>
          )
        }
      >
        <Tabs index={tabIndex} setIndex={setTabIndex} tabs={TABS}>
          <MetadataTab abi={contract.abi} />
          <InteractTab contract={contract} />
        </Tabs>
      </PageFull>
    </Loader>
  );
}
