// Copyright 2022 @paritytech/contracts-ui authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { Account } from '../account/Account';
import { Button, Buttons } from '../common/Button';
import { useApi, useInstantiate, useTransactions } from 'ui/contexts';
import { createInstantiateTx, truncate, printBN } from 'helpers';
import { SubmittableResult } from 'types';
import { useNewContract } from 'ui/hooks';

export function Step3() {
  const { codeHash: codeHashUrlParam } = useParams<{ codeHash: string }>();
  const { data, step, setStep } = useInstantiate();
  const { api } = useApi();
  const { accountId, value, metadata, weight, name, constructorIndex } = data;
  const { queue, process, txs, dismiss } = useTransactions();
  const [txId, setTxId] = useState<number>(0);
  const onSuccess = useNewContract();

  const displayHash = codeHashUrlParam || metadata?.info.source.wasmHash.toHex();

  useEffect(() => {
    const isValid = (result: SubmittableResult) => !result.isError && !result.dispatchError;

    if (data.accountId) {
      const tx = createInstantiateTx(api, data);

      if (!txId) {
        const newId = queue({
          extrinsic: tx,
          accountId: data.accountId,
          onSuccess,
          isValid,
        });
        setTxId(newId);
      }
    }
  }, [api, data, queue, onSuccess, txId]);

  const call = () => {
    async function processTx() {
      txs[txId]?.status === 'queued' && (await process(txId));
    }
    processTx().catch(e => console.error(e));
  };

  if (step !== 3) return null;

  return (
    <>
      <div className="review">
        <div className="field full">
          <p className="key">Account</p>
          <div className="value">
            <Account value={accountId} />
          </div>
        </div>

        <div className="field full">
          <p className="key">Name</p>
          <p className="value">{name}</p>
        </div>
        {metadata?.constructors[constructorIndex].isPayable && value && (
          <div className="field">
            <p className="key">Value</p>
            <p className="value">{printBN(value)}</p>
          </div>
        )}

        <div className="field">
          <p className="key">Weight</p>
          <p className="value">{printBN(weight)}</p>
        </div>

        {displayHash && (
          <div className="field">
            <p className="key">Code Hash</p>
            <p className="value">{truncate(displayHash)}</p>
          </div>
        )}

        {txs[txId]?.extrinsic.args[3] && (
          <div className="field">
            <p className="key">Data</p>
            <p className="value">{truncate(txs[txId]?.extrinsic.args[3].toHex())}</p>
          </div>
        )}
      </div>
      <Buttons>
        <Button
          variant="primary"
          isDisabled={!txs[txId]?.isValid}
          isLoading={txs[txId]?.status === 'processing'}
          onClick={() => call()}
          data-cy="submit-btn"
        >
          Upload and Instantiate
        </Button>

        <Button
          onClick={(): void => {
            dismiss(txId);
            setTxId(0);
            setStep(2);
          }}
          isDisabled={txs[txId]?.status === 'processing'}
        >
          Go Back
        </Button>
      </Buttons>
    </>
  );
}
