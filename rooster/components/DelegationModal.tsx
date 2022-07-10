/** @format */
import { ModalBase as Modal, ModalProps } from '../../src/ui/components/modal/ModalBase';
import { Form, FormField } from '../../src/ui/components/form';
import { useAccountId } from '../../src/ui/hooks';
import { AccountSelect } from '../../src/ui/components/account';
import { Button, Buttons, LoaderSmall } from '../../src/ui/components';
import { TransactionOptions } from './TransactionOptions';
import { useState } from 'react';
import { TxState } from './Page';
import { ExclamationCircleIcon } from '@heroicons/react/outline';
import { useDelegate } from '../lib/api';

interface Props extends ModalProps {
  onSuccess: () => any;
  dao: string;
}

export const DelegationModal = ({ isOpen, setIsOpen, onSuccess, dao }: Omit<Props, 'title'>) => {
  const { value: accountId, onChange: setAccountId, ...accountIdValidation } = useAccountId();
  const [options, setOptions] = useState({
    gasLimit: null,
    storageDepositLimit: null,
    value: null,
  });
  const [txState, setTxState] = useState<TxState>('idle');
  const [deploymentMessage, setDeploymentMessage] = useState('');
  const { delegate } = useDelegate(dao);
  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen} title="Delegate vote">
      <Form>
        <FormField
          className="mt-4"
          help=""
          id="labelDelegation"
          label="Delegate your voting power to yourself or another account:"
          isError={false}
          {...accountIdValidation}
        >
          <AccountSelect
            isDisabled={false}
            id="accountId"
            value={accountId}
            onChange={setAccountId}
            {...accountIdValidation}
          />
        </FormField>
        <TransactionOptions setOptions={setOptions} mutating={true}></TransactionOptions>
        {txState !== 'wait' && (
          <Buttons>
            <Button
              variant="primary"
              onClick={async () => {
                try {
                  setTxState('wait');
                  setDeploymentMessage('The delegation is being processed.');
                  await delegate(accountId, options);
                  onSuccess();
                  setIsOpen(false);
                } catch (e) {
                  setTxState('fail');
                }
              }}
            >
              Delegate
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
