/** @format */
import { ModalBase as Modal, ModalProps } from '../../src/ui/components/modal/ModalBase';
import { useEffect, useState } from 'react';
import { TxState } from './Page';
import { ArrowCircleRightIcon, ExclamationCircleIcon } from '@heroicons/react/outline';
import { fetchRooster } from '../lib/ipfs-api';
import { LoaderSmall } from '../../src/ui/components';
import { useRmrkAcceptResource } from '../lib/runtime-api';

interface Props extends ModalProps {
  onEvolve: () => any;
  dao: string;
  availableEvolution: any;
}

export const EvolutionModal = ({
  isOpen,
  setIsOpen,
  dao,
  onEvolve,
  availableEvolution,
}: Omit<Props, 'title'>) => {
  const [txState, setTxState] = useState<TxState>('idle');
  const [rooster1, setRooster1] = useState('');
  const [rooster2, setRooster2] = useState('');
  const { acceptResource } = useRmrkAcceptResource();

  const fetchAvailableRooster = async () => {
    if (availableEvolution.currentCId) {
      const rooster = await fetchRooster(availableEvolution.currentCId);
      setRooster1(rooster.imageUrl);
    } else {
      const rooster = await fetchRooster();
      setRooster1(rooster.imageUrl);
    }
    if (availableEvolution.nextCId) {
      const rooster = await fetchRooster(availableEvolution.nextCId);
      setRooster2(rooster.imageUrl);
    }
  };

  useEffect(() => {
    fetchAvailableRooster();
  }, []);

  const evolve = async () => {
    setTxState('wait');
    try {
      await acceptResource(availableEvolution);
      onEvolve([availableEvolution.collectionId, availableEvolution.nftId]);
      setIsOpen(false);
    } catch (e) {
      setTxState('fail');
    }
  };

  const [options, setOptions] = useState({
    gasLimit: 0,
    storageDepositLimit: null,
    value: 0,
  });
  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen} title="Evolve your NFT">
      {availableEvolution.nextCId ? (
        <div className="mt-6 grid gap-6 grid-cols-7">
          <div className="col-span-3">
            <div className="w-50">
              <img className="max-w-full max-h-full" src={rooster1}></img>
            </div>
          </div>
          <div className="col-span-1 self-center">
            <div className="dark:text-gray-300 text-gray-300 space-x-2">
              <ArrowCircleRightIcon></ArrowCircleRightIcon>
            </div>
          </div>
          <div className="col-span-3">
            <div className="w-50">
              <img className="max-w-full max-h-full" src={rooster2}></img>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex ml-[10%] mt-6 w-80">
          <img className="max-w-full max-h-full" src={rooster1}></img>
        </div>
      )}

      {txState !== 'wait' && (
        <div className="flex ml-[30%] mt-6 mb-6">
          <div className="mr-4 inline flex items-center text-base dark:text-gray-300 text-gray-500 space-x-2">
            <span>Ready?</span>
          </div>
          <a
            onClick={evolve}
            className="inline-flex w-max justify-between items-center px-6 py-4 border text-gray-500 dark:border-gray-700 border-gray-200 rounded-md dark:bg-elevation-1 dark:hover:bg-elevation-2 hover:bg-gray-100 cursor-pointer"
          >
            <div className="flex items-center text-base dark:text-gray-300 text-gray-500 space-x-2">
              <span>Evolve!</span>
            </div>
          </a>
        </div>
      )}
      {txState === 'wait' && (
        <div className="flex ml-[20%] mt-6 mb-6">
          <LoaderSmall isLoading={txState === 'wait'} message="Your NFT is evolving"></LoaderSmall>
        </div>
      )}
      {txState === 'fail' && (
        <div className="flex">
          <ExclamationCircleIcon className="w-10 h-10 text-red-400 mb-3" />
          <p className="text-gray-500 mt-2 ml-2">
            NFT could not be evolved. Please check if the node is still accessible.
          </p>
        </div>
      )}
    </Modal>
  );
};
