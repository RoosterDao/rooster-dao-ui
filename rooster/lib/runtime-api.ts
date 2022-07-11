// api functions

import { resolve } from 'path';
import { useApi } from '../../src/ui/contexts';
import { useGlobalAccountId } from './hooks';

export function useRmrkCoreResources() {
  const { api } = useApi();
  const { value: accountId } = useGlobalAccountId();

  const queryResources = (collectionId, nftId, resourceId = 0) =>
    new Promise<any>(async (resolve, reject) => {
      const result = await api.query.rmrkCore.resources(
        Number(collectionId),
        Number(nftId),
        resourceId
      );
      resolve(result.toHuman());
    });

  const queryNextResource = (collectionId, nftId) =>
    new Promise<any>(async (resolve, reject) => {
      let currentNft = await queryResources(collectionId, nftId, 0);
      let nextNft = await queryResources(collectionId, nftId, 1);

      let resourceId = 1;
      while (nextNft && !nextNft.pending) {
        currentNft = await queryResources(collectionId, nftId, resourceId);
        nextNft = await queryResources(collectionId, nftId, resourceId + 1);
        resourceId = resourceId + 1;
      }

      resolve({
        resourceId,
        currentNft,
        nextNft,
        accountId,
      });
    });

  return { queryResources, queryNextResource };
}

export const useRmrkAcceptResource = () => {
  const { api, keyring } = useApi();
  const { value: accountId } = useGlobalAccountId();

  const acceptResource = async ({ collectionId, nftId, resourceId }) =>
    new Promise<any>(async (resolve, reject) => {
      const txHash = await api.tx.rmrkCore
        .acceptResource(Number(collectionId), Number(nftId), Number(resourceId))
        .signAndSend(keyring.getPair(accountId), async result => {
          await result;
          if (result.isCompleted) {
            resolve(true);
          }
        });
    });

  return { acceptResource };
};
