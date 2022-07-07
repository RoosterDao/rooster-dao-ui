// view single dao

import { Button, Buttons } from '../../src/ui/components/common';
import { CopyButton } from '../../src/ui/components/common/CopyButton';
import { Page } from './Page';
import { truncate } from '../../src/ui/util';
import { useDaos } from '../lib/hooks';
import { ErrorBoundary } from './ErrorBoundary';
import { Link } from 'react-router-dom';
import { TrashIcon } from '@heroicons/react/outline';

export function Explore() {
  const { daosList, forgetAllDaos } = useDaos();
  return (
    <ErrorBoundary>
      <Page>
        <h2 className="inline text-xl font-semibold dark:text-white text-gray-700">
          Explore DAO's
        </h2>
        <Button
          className="float-right border-2 dark:border-gray-700 border-gray-200"
          onClick={forgetAllDaos}
        >
          <TrashIcon className="w-4 dark:text-gray-500 mr-1 justify-self-end" />
          Forget all DAO's
        </Button>
        <div className="mt-12 font-semibold grid grid-cols-8 w-full justify-items-center">
          <div className="col-span-2 justify-self-start">Name</div>
          <div className="col-span-2">Address</div>
          <div className="col-span-1">Proposals</div>
          <div className="col-span-1">Holders</div>
          <div className="col-span-1">Voters</div>
        </div>
        {daosList.map(dao => (
          <div className="grid grid-cols-8 w-full justify-items-center">
            <div className="col-span-2 pt-3 justify-self-start dark:hover:text-gray-300 hover:text-gray-400">
              <Link to={`/dao/${dao.address}`}> {dao.name}</Link>
            </div>
            <div className="col-span-2">
              <div className="mt-4 dark:text-gray-400 text-gray-500 text-sm">
                <div className="inline-flex items-center">
                  <span className="inline-block relative bg-blue-500 text-blue-400 bg-opacity-20 text-xs px-1.5 py-1 font-mono rounded">
                    {truncate(dao.address, 10)}
                  </span>
                  <CopyButton className="ml-1" value={dao.address} />
                </div>
              </div>
            </div>
            <div className="col-span-1 pt-3"></div>
            <div className="col-span-1 pt-3"></div>
            <div className="col-span-1 pt-3"></div>
          </div>
        ))}
      </Page>
    </ErrorBoundary>
  );
}
