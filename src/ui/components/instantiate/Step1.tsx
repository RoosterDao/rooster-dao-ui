// Copyright 2022 @paritytech/contracts-ui authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect } from 'react';
import { useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Button, Buttons } from '../common/Button';
import { Input, InputFile, Form, FormField, useMetadataField, getValidation } from '../form';
import { Loader } from '../common/Loader';
import { AccountSelect } from '../account';
import { CodeHash } from './CodeHash';
import { useNonEmptyString } from 'ui/hooks/useNonEmptyString';
import { useInstantiate } from 'ui/contexts';
import { useAccountId } from 'ui/hooks';

export function Step1() {
  const { t } = useTranslation();
  const { codeHash: codeHashUrlParam } = useParams<{ codeHash: string }>();

  const { stepForward, setData, data, currentStep } = useInstantiate();

  const { value: accountId, onChange: setAccountId, ...accountIdValidation } = useAccountId();
  const { value: name, onChange: setName, ...nameValidation } = useNonEmptyString();

  const {
    file,
    value: metadata,
    isLoading,
    isStored,
    onChange,
    onRemove,
    ...metadataValidation
  } = useMetadataField();

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
          help={t(
            'instantiateAccountHelp',
            'The account to use for this instantiation. The fees and storage deposit will be deducted from this account.'
          )}
          id="accountId"
          label={t('instantiateAccountLabel', 'Account')}
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
          help={t(
            'instantiateNameHelp',
            'A name for the new contract to help users distinguish it. Only used for display purposes.'
          )}
          id="name"
          label={t('instantiateNameLabel', 'Contract Name')}
          {...nameValidation}
        >
          <Input
            id="contractName"
            placeholder={t('instantiateNamePlaceholder', 'Give your contract a descriptive name')}
            value={name}
            onChange={setName}
          />
        </FormField>
        {codeHashUrlParam && (
          <FormField
            help={t(
              'instantiateCodeHashHelp',
              'The on-chain code hash that will be reinstantiated as a new contract.'
            )}
            id="metadata"
            label={t('instantiateCodeHashLabel', 'On-Chain Code')}
          >
            <CodeHash codeHash={codeHashUrlParam} name={name} />
          </FormField>
        )}
        {(!codeHashUrlParam || !isStored) && (
          <FormField
            help={
              codeHashUrlParam && !isStored
                ? t(
                    'instantiateUploadMetadataHelp',
                    'The contract metadata JSON file to save for this contract. Constructor and message information will be derived from this file'
                  )
                : t(
                    'instantiateUploadBundleHelp',
                    'The contract bundle file containing the WASM blob and metadata.'
                  )
            }
            id="metadata"
            label={
              codeHashUrlParam
                ? t('instantiateUploadMetadataLabel', 'Upload Metadata')
                : t('instantiateUploadBundleLabel', 'Upload Contract Bundle')
            }
            {...getValidation(metadataValidation)}
          >
            <InputFile
              placeholder={t('inputFileHelp', 'Click to select or drag and drop to upload file.')}
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
          data-cy="next-btn"
        >
          {t('next', 'Next')}
        </Button>
      </Buttons>
    </Loader>
  );
}
