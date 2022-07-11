import { PlusCircleIcon } from '@heroicons/react/outline';
import { Link } from 'react-router-dom';
import { Page } from './Page';

export function Home() {
  const text = 'Start your own DAO with an evolving NFT based on governance participation.';
  return (
    <Page>
      <h1 className="text-2xl mt-16 font-semibold dark:text-white text-gray-700">{text}</h1>
      <Link
        to={`/add`}
        className="inline-flex mt-18 mr-6 w-max justify-between items-center px-6 py-4 border text-gray-500 dark:border-gray-700 border-gray-200 rounded-md dark:bg-elevation-1 dark:hover:bg-elevation-2 hover:bg-gray-100"
      >
        <div className="flex items-center text-base dark:text-gray-300 text-gray-500 space-x-2">
          <PlusCircleIcon className="h-8 w-8 dark:text-gray-500 text-gray-400 group-hover:text-gray-500" />
          <span>Add a DAO</span>
        </div>
      </Link>
    </Page>
  );
}
