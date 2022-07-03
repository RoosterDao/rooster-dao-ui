import {
  InputGas,
  InputBalance,
  InputStorageDepositLimit,
  FormField,
} from '../../src/ui/components/form';
import { ErrorBoundary } from './ErrorBoundary';
import { useWeight, useBalance, useAccountId } from '../../src/ui/hooks';
import { useToggle } from '../../src/ui/hooks/useToggle';
import { useStorageDepositLimit } from '../../src/ui/hooks/useStorageDepositLimit';
import { useEffect, useState } from 'react';
import { BN } from '../../src/types';
import { Switch } from '../../src/ui/components/common';

export function TransactionOptions({ setOptions, payable = false, mutating = false }) {
  const { value: accountId } = useAccountId();
  const { value, onChange: setValue, ...valueValidation } = useBalance(100);
  const [isUsingStorageDepositLimit, toggleIsUsingStorageDepositLimit] = useToggle();
  const [estimatedWeight, setEstimatedWeight] = useState<BN | null>(null);
  const storageDepositLimit = useStorageDepositLimit(accountId);
  const [isActive, setActive] = useState(false);
  const weight = useWeight(estimatedWeight);

  const toggleIsActive = () => setActive(!isActive);

  useEffect(() => {
    if (isActive) {
      setOptions({
        gasLimit: weight.weight,
        storageDepositLimit: isUsingStorageDepositLimit ? storageDepositLimit.maximum : null,
        value: payable ? value : null,
      });
    } else {
      setOptions({
        gasLimit: null,
        storageDepositLimit: null,
        value: null,
      });
    }
  }, [isActive, weight.weight, isUsingStorageDepositLimit, storageDepositLimit.maximum, value]);

  return (
    <ErrorBoundary>
      <FormField
        help="Set gas limit, storage deposit limit and in case of a payable transaction, the transferrable value."
        id="labelTxOption"
        label="Set the transaction options?"
        isError={!weight.isValid}
        message={!weight.isValid ? 'Invalid gas limit' : null}
      >
        <div className="pl-6">
          <Switch value={isActive} onChange={toggleIsActive} />
        </div>
      </FormField>
      {isActive && payable && (
        <FormField
          help="The balance to transfer to the contract as part of this call."
          id="value"
          label="Payment"
          {...valueValidation}
        >
          <InputBalance value={value} onChange={setValue} placeholder="Value" />
        </FormField>
      )}
      {isActive && (
        <span>
          <FormField
            help="The maximum amount of gas (in millions of units) to use for this contract call. If the call requires more, it will fail."
            id="maxGas"
            label="Max Gas Allowed"
            isError={!weight.isValid}
            message={!weight.isValid ? 'Invalid gas limit' : null}
          >
            <InputGas isCall={mutating} withEstimate {...weight} />
          </FormField>
          <FormField
            help="The maximum balance allowed to be deducted from the sender account for any additional storage deposit."
            id="storageDepositLimit"
            label="Storage Deposit Limit"
            isError={!storageDepositLimit.isValid}
            message={
              !storageDepositLimit.isValid
                ? storageDepositLimit.message || 'Invalid storage deposit limit'
                : null
            }
          >
            <InputStorageDepositLimit
              isActive={isUsingStorageDepositLimit}
              toggleIsActive={toggleIsUsingStorageDepositLimit}
              {...storageDepositLimit}
            />
          </FormField>
        </span>
      )}
    </ErrorBoundary>
  );
}
