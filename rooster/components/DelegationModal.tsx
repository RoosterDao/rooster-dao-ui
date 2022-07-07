/** @format */
import { ModalBase as Modal, ModalProps } from '../../src/ui/components/modal/ModalBase';
import { Form, FormField } from '../../src/ui/components/form';
import { useAccountId } from '../../src/ui/hooks';
import { AccountSelect } from '../../src/ui/components/account';
import { Button, Buttons } from '../../src/ui/components';
import { TransactionOptions } from './TransactionOptions';
import { useState } from 'react';

interface Props extends ModalProps {
  setDelegate: (accountId, options) => any;
}

export const DelegationModal = ({ isOpen, setIsOpen, setDelegate }: Omit<Props, 'title'>) => {
  const { value: accountId, onChange: setAccountId, ...accountIdValidation } = useAccountId();
  const [options, setOptions] = useState({
    gasLimit: null,
    storageDepositLimit: null,
    value: null,
  });
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
        <Buttons>
          <Button
            variant="primary"
            onClick={() => {
              setDelegate(accountId, options);
              setIsOpen(false);
            }}
          >
            Delegate
          </Button>
        </Buttons>
      </Form>
    </Modal>
  );
};
