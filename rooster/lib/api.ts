// api functions

import { randomAsHex } from '@polkadot/util-crypto';
import { Abi, BN as BNType } from '../../src/types';
import { BN } from '@polkadot/util';

import { createInstantiateTx, maximumBlockWeight } from '../../src/api';
import abi from '../lib/metadata.json';

export const instantiateDAO = async ({
  api,
  keyring,
  accountId,
  codeHash,
  args,
}: {
  api;
  keyring;
  accountId;
  codeHash;
  args: { name: string; votingPeriod: BNType; votingDelay: BNType; executionDelay: BNType };
}) => {
  const params = {
    codeHash,
    metadata: new Abi(abi),
    origin: accountId,
    weight: new BN('100000000000'), //TODO: check best way to determine gas limit
    storageDepositLimit: null,
    argValues: args,
    salt: randomAsHex(),
    constructorIndex: 0,
    value: null, // not payable
  };

  const tx = createInstantiateTx(api, params);

  tx.signAndSend(keyring.getPair(accountId), { signer: undefined }, async result => {
    await console.log(result);
  });
};
