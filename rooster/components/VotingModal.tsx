/** @format */

import { ChevronRightIcon } from '@heroicons/react/outline';
import {
  BookOpenIcon,
  CheckCircleIcon,
  HandIcon,
  XCircleIcon,
  XIcon,
} from '@heroicons/react/outline';
import { ModalBase as Modal, ModalProps } from '../../src/ui/components/modal/ModalBase';

export type VoteType = 'Against' | 'For' | 'Abstain';

interface Props extends ModalProps {
  castVote: (vote: VoteType) => any;
}

export const VotingModal = ({ isOpen, setIsOpen, castVote }: Omit<Props, 'title'>) => {
  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen} title="Submit your vote">
      <ul className="dark:text-gray-200 text-gray-600 text-m mb-5">
        <li>
          <a
            onClick={() => {
              castVote('For');
              setIsOpen(false);
            }}
            className="group flex w-full justify-between items-center border-b dark:border-gray-800 border-gray-200 dark:text-white text-gray-600 hover:text-gray-400 dark:hover:text-gray-400 cursor-pointer"
          >
            <div className="flex py-8">
              <div className="w-8 mr-2" style={{ position: 'relative', top: 0 }}>
                <CheckCircleIcon className="h-7 w-7 text-indigo-400" aria-hidden="true" />
              </div>
              <div className="py-0.4 flex flex-col">
                <strong>For</strong>
              </div>
            </div>
            <ChevronRightIcon className="h-4 w-4 dark:text-gray-400 text-gray-500 group-hover:opacity-50" />
          </a>
        </li>
        <li>
          <a
            onClick={() => {
              castVote('Against');
              setIsOpen(false);
            }}
            className="group flex w-full justify-between items-center border-b dark:border-gray-800 border-gray-200 dark:text-white text-gray-600 hover:text-gray-400 dark:hover:text-gray-400 cursor-pointer"
          >
            <div className="flex py-8">
              <div className="w-8 mr-2" style={{ position: 'relative', top: 0 }}>
                <XCircleIcon className="h-7 w-7 text-indigo-400" aria-hidden="true" />
              </div>
              <div className="py-0.4 flex flex-col">
                <strong>Against</strong>
              </div>
            </div>
            <ChevronRightIcon className="h-4 w-4 dark:text-gray-400 text-gray-500 group-hover:opacity-50" />
          </a>
        </li>
        <li>
          <a
            onClick={() => {
              castVote('Abstain');
              setIsOpen(false);
            }}
            className="group flex w-full justify-between items-center border-b dark:border-gray-800 border-gray-200 dark:text-white text-gray-600 hover:text-gray-400 dark:hover:text-gray-400 cursor-pointer"
          >
            <div className="flex py-8">
              <div className="w-8 mr-2" style={{ position: 'relative', top: 0 }}>
                <HandIcon className="h-7 w-7 text-indigo-400" aria-hidden="true" />
              </div>
              <div className="py-0.4 flex flex-col">
                <strong>Abstain</strong>
              </div>
            </div>
            <ChevronRightIcon className="h-4 w-4 dark:text-gray-400 text-gray-500 group-hover:opacity-50" />
          </a>
        </li>
      </ul>
    </Modal>
  );
};
