// view single dao

import { Button } from '../../src/ui/components/common';
import { CopyButton } from '../../src/ui/components/common/CopyButton';
import { Page } from './Page';
import { truncate } from '../../src/ui/util';
import { useDaos, useProposals } from '../lib/hooks';
import { ErrorBoundary } from './ErrorBoundary';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { TrashIcon } from '@heroicons/react/outline';
import { useHackedIndexer } from './HackedIndexerContext';
import {
  firstCellBody,
  firstCellHeader,
  lastCellBody,
  lastCellHeader,
  Table,
  TableRow,
} from './Table';

export function Explore() {
  const { daosList, forgetAllDaos } = useDaos();
  const navigate = useNavigate();
  const { getProposalsForDao } = useProposals();
  const { getProposalVoters } = useHackedIndexer();
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

        <Table
          classes="mt-10 w-full"
          header={
            <>
              <th className={firstCellHeader}>Name</th>
              <th>Address</th>
              <th className="w-40">Proposals</th>
              <th className="w-40">Holders</th>
              <th className={`${lastCellHeader} w-40`}>Voters</th>
            </>
          }
          body={daosList.map((dao, index) => (
            <TableRow
              key={dao.address}
              index={index}
              onClick={() => navigate(`/dao/${dao.address}`)}
            >
              <td className={firstCellBody}>
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
              <td>{getProposalsForDao(dao.address)?.length ?? '?'}</td>
              <td>tbd</td>
              <td className={lastCellBody}>{getProposalVoters(dao.address)}</td>
            </TableRow>
          ))}
        />
      </Page>
    </ErrorBoundary>
  );
}
