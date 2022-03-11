// Copyright 2021 @paritytech/contracts-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect } from 'react';
import { useParams } from 'react-router';
import { Button, Buttons } from '../common/Button';
import {
  Input,
  InputFile,
  Form,
  FormField,
  useMetadataField,
  getValidation
} from '../form';
import { Loader } from '../common/Loader';
import { AccountSelect } from '../account';
import { CodeHash } from './CodeHash';
import { useNonEmptyString } from 'ui/hooks/useNonEmptyString';
import { useInstantiate } from 'ui/contexts';
import { useAccountId } from 'ui/hooks';

export function Step1() {
  const { codeHash: codeHashUrlParam } = useParams<{ codeHash: string }>();

  const { stepForward, setData, data, currentStep } = useInstantiate();

  const { value: accountId, onChange: setAccountId, ...accountIdValidation } = useAccountId();
  const { value: name, onChange: setName, ...nameValidation } = useNonEmptyString();

  const { file, value: metadata, isLoading, isStored, onChange, onRemove, ...metadataValidation } = useMetadataField();

  useEffect((): void => {
    if (metadata && !name) {
      setName(metadata.info.contract.name.toString());
    }
  }, [metadata, name, setName]);

  function submitStep1() {
    setData &&
      setData({
        ...data,
        accountId,
        metadata,
        name,
        codeHash: codeHashUrlParam,
      });

    stepForward && stepForward();
  }

  if (currentStep !== 1) return null;

  return (
    <Loader isLoading={isLoading}>
      <Form>
        <FormField
          help="The account to use for this instantiation. The ees and storage deposit will be deducted from this account."
          id="accountId"
          label="Account"
          {...accountIdValidation}
        >
          <AccountSelect
            id="accountId"
            className="mb-2"
            value={accountId}
            onChange={setAccountId}
          />
        </FormField>
        <FormField
          help="A name for the new contract to help users distinguish it. Only used for display purposes."
          id="name"
          label="Contract Name"
          {...nameValidation}
        >
          <Input
            id="contractName"
            placeholder="Give your contract a descriptive name"
            value={name}
            onChange={setName}
          />
        </FormField>
        {codeHashUrlParam && (
          <FormField
            help="The on-chain code hash that will be reinstantiated as a new contract."
            id="metadata"
            label="On-Chain Code"
          >
            <CodeHash codeHash={codeHashUrlParam} name={name} />
          </FormField>
        )}
        {(!codeHashUrlParam || !isStored) && (
          <FormField
            help="Helpful tooltip"
            id="metadata"
            label={codeHashUrlParam ? 'Upload Metadata' : 'Upload Contract Bundle'}
            {...getValidation(metadataValidation)}
          >
            <InputFile
              placeholder="Click to select or drag & drop to upload file."
              onChange={onChange}
              onRemove={onRemove}
              isError={metadataValidation.isError}
              value={file}
            />
          </FormField>
        )}
      </Form>
      <Buttons>
        <Button
          isDisabled={!metadata || !nameValidation.isValid || !metadataValidation.isValid}
          onClick={submitStep1}
          variant="primary"
        >
          Next
        </Button>
      </Buttons>
    </Loader>
  );
}
