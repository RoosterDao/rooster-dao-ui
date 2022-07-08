// view single dao

import { Button, Buttons } from '../../src/ui/components/common';
import { CopyButton } from '../../src/ui/components/common/CopyButton';
import { Page } from './Page';
import { truncate } from '../../src/ui/util';
import { useDaos } from '../lib/hooks';
import { ErrorBoundary } from './ErrorBoundary';
import { Link } from 'react-router-dom';
import { TrashIcon } from '@heroicons/react/outline';
import { useLayoutEffect, useEffect } from 'react';

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
          <TrashIcon className="w-4 dark:text-gray-500 mr-1 " />
          Forget all DAO's
        </Button>
        <table className="table-auto mt-12 font-semibold w-full mr-12 text-center">
          <thead>
            <tr className="bg-neutral-50 pt-1.5 pb-1.5">
              <th className="text-left pl-4 rounded-tl-2xl">Name</th>
              <th className="">Address</th>
              <th className="">Proposals</th>
              <th className="">Holders</th>
              <th className="rounded-tr-2xl">Voters</th>
            </tr>
          </thead>
          <tbody>
            {daosList.map((dao, index) => (
              <tr
                className={`${
                  index % 2 ? 'bg-neutral-50' : 'bg-white'
                } hover:text-gray-400 dark:hover:text-gray-300 mt-1.5 mb-1.5`}
              >
                <td className="text-left rounded-l-md pl-4">
                  <Link to={`/dao/${dao.address}`}> {dao.name}</Link>
                </td>
                <td className="pb-4">
                  <div className="mt-4 dark:text-gray-400 text-gray-500 text-sm">
                    <div className="inline-flex items-center">
                      <span className="inline-block relative bg-blue-500 text-blue-400 bg-opacity-20 text-xs px-1.5 py-1 font-mono rounded">
                        {truncate(dao.address, 10)}
                      </span>
                      <CopyButton className="ml-1" value={dao.address} />
                    </div>
                  </div>
                </td>
                <td className=""></td>
                <td className="">tbd</td>
                <td className="rounded-r-xl">tbd</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Page>
    </ErrorBoundary>
  );
}
