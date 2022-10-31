/** @format */
import { ModalBase as Modal, ModalProps } from '../../src/ui/components/modal/ModalBase';
import { Form } from '../../src/ui/components/form';
import { useBalance } from '../../src/ui/hooks';
import { Button, Buttons, LoaderSmall } from '../../src/ui/components';
import { useEffect, useState } from 'react';
import { useBecomeMember, useGetNftPrice } from '../lib/api';
import { formatBalance } from '@polkadot/util';
import { TxState } from './Page';
import { ExclamationCircleIcon } from '@heroicons/react/outline';

interface Props extends ModalProps {
  onSuccess: () => any;
  dao: string;
}

export const BecomeMemberModal = ({ isOpen, setIsOpen, dao, onSuccess }: Omit<Props, 'title'>) => {
  const { becomeMember } = useBecomeMember();
  const { queryGetNftPrice } = useGetNftPrice(dao);
  const { value: nftPrice, onChange: setNftPrice } = useBalance(0);
  const [txState, setTxState] = useState<TxState>('idle');
  const [deploymentMessage, setDeploymentMessage] = useState('');

  useEffect(() => {
    queryGetNftPrice().then(x => 
      setNftPrice(x));
  }, []);

  const [options, setOptions] = useState({
    gasLimit: 0,
    storageDepositLimit: null,
    value: 0,
  });
  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen} title="Become a member">
      <Form>
        <label className="block mt-8 mb-8 text-xl dark:text-white text-gray-600">
          Get the NFT for <strong className="text-gray-800">{formatBalance(nftPrice)}</strong> to
          become a member of the DAO.
        </label>
        {txState !== 'wait' && (
          <Buttons>
            <Button
              variant="primary"
              onClick={async () => {
                try {
                  setTxState('wait');
                  setDeploymentMessage('Your NFT is being minted');
                  await becomeMember(dao, options, nftPrice.toBn());
                  onSuccess();
                  setIsOpen(false);
                } catch (e) {
                  setTxState('fail');
                }
              }}
            >
              Get NFT and become Member
            </Button>
          </Buttons>
        )}
        <LoaderSmall isLoading={txState === 'wait'} message={deploymentMessage}></LoaderSmall>
        {txState === 'fail' && (
          <div className="flex">
            <ExclamationCircleIcon className="w-10 h-10 text-red-400 mb-3" />
            <p className="text-gray-500 mt-2 ml-2">
              NFT could not be minted. Please check the transaction options and your account
              balance.
            </p>
          </div>
        )}
      </Form>
    </Modal>
  );
};
