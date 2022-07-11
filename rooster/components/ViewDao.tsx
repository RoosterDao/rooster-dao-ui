// view single dao

import { Button } from '../../src/ui/components/common';
import { CopyButton } from '../../src/ui/components/common/CopyButton';
import { Page } from './Page';
import { truncate } from '../../src/ui/util';
import { useDaos, useGlobalAccountId, useProposals } from '../lib/hooks';
import { useNavigate, useParams } from 'react-router';
import { Link } from 'react-router-dom';
import {
  PlusSmIcon,
  TrashIcon,
  UserIcon,
  InformationCircleIcon,
  StarIcon,
} from '@heroicons/react/outline';
import { DelegationModal } from './DelegationModal';
import { useEffect, useLayoutEffect, useReducer, useState } from 'react';
import { useGetNft, useGetVotes, useLists, useProposalState } from '../lib/api';
import ReactTooltip from 'react-tooltip';
import {
  firstCellBody,
  firstCellHeader,
  lastCellBody,
  lastCellHeader,
  Table,
  TableRow,
} from './Table';
import { useApi } from '../../src/ui/contexts';
import { BecomeMemberModal } from './BecomeMemberModal';
import { fetchRooster } from '../lib/ipfs-api';
import { useRmrkAcceptResource, useRmrkCoreResources } from '../lib/runtime-api';
import { EvolutionModal } from './EvolutionModal';

const SHORT_DESCRIPTION_LENGTH = 200;
const getCID = cid => cid?.replace('ipfs://ipfs/', '') ?? null;

const reducerFunc = (state, { id, value }) => {
  return { ...state, [id]: value };
};

export function ViewDao() {
  const { address } = useParams();
  if (!address) throw new Error('No address in url');
  const navigate = useNavigate();
  const { keyring } = useApi();
  const [delegationModalOpen, openDelegationModal] = useState(false);
  const [becomeMemberModalOpen, openBecomeMemberModal] = useState(false);
  const [evolutionModalOpen, openEvolutionModal] = useState(false);
  const [votes, setVotes] = useState(0);
  const [nft, setNft] = useState(false);
  const [rooster, setRooster] = useState({} as any);
  const [availableEvolution, setAvailableEvolution] = useState({} as any);
  const [memberMessage, setMemberMessage] = useState('');

  const [proposalStates, setProposalStates] = useReducer(
    reducerFunc,
    {} as Record<string, string | null>
  );
  const [proposalVotes, setProposalVotes] = useReducer(
    reducerFunc,
    {} as Record<string, string | null>
  );

  const [topVoter, setTopVoter] = useReducer(reducerFunc, {} as Record<string, string | null>);
  const [votesByHolder, setVotesByHolder] = useReducer(
    reducerFunc,
    {} as Record<string, string | null>
  );
  const [holders, setHolder] = useState([]);

  const { getDao, forgetDao } = useDaos();
  const { getProposalsForDao } = useProposals();
  const dao = getDao(address);
  const proposals = getProposalsForDao(dao?.address);

  const { queryGetVotes } = useGetVotes(address);
  const { queryGetNft } = useGetNft(address);
  const { queryNextResource } = useRmrkCoreResources();
  const { acceptResource } = useRmrkAcceptResource();
  const { queryListOwners, queryListProposals } = useLists();

  const { queryState, queryProposalVotes } = useProposalState(address);
  const { value: accountId } = useGlobalAccountId();

  const isMember = nft?.Err !== 'NotOwner';

  const getHolders = () => {
    queryListOwners(address).then(x => {
      const holder = x.toArray().map(x => ({ id: x.toJSON()[0], value: x.toJSON()[2] }));
      holder.forEach(x => setVotesByHolder(x));
    });
  };

  useEffect(() => {
    proposals.forEach(proposal => {
      queryState(proposal.id).then(value => setProposalStates({ id: proposal.id, value }));
      queryProposalVotes(proposal.id).then(value => setProposalVotes({ id: proposal.id, value }));
      getHolders();
    });
  }, [JSON.stringify(proposals), address]);

  useEffect(() => {
    queryListProposals(address).then(x => {
      const proposalVoters = x.toJSON().flatMap(entry => entry[1].hasVoted);
      const top = Object.keys(votesByHolder).map(holder => {
        return { id: holder, value: proposalVoters.filter(voter => voter === holder).length };
      });
      const sorted = top.sort((a, b) => b.value - a.value);
      setHolder(sorted.map(x => x.id));
      top.forEach(setTopVoter);
    });
  }, [votesByHolder]);

  const getDelegateVotes = () => {
    queryGetVotes().then(votes => setVotes(votes));
    getHolders();
  };

  const checkForEvolutions = async ([collectionId, nftId]) => {
    const resource = await queryNextResource(collectionId, nftId);
    setMemberMessage('');
    setRooster({});
    if (resource.currentNft) {
      const currentCId = getCID(resource?.currentNft?.resource?.Basic?.metadata ?? null);
      const nextCId = getCID(resource?.nextNft?.resource?.Basic?.metadata ?? null);

      if (resource.nextNft) {
        fetchRooster(currentCId).then(setRooster);

        if (resource.nextNft.pending && Number(resource.nextNft.id) <= 3) {
          setAvailableEvolution({
            resourceId: resource.nextNft.id,
            currentCId,
            nextCId,
            collectionId,
            nftId,
          });
        }
      } else {
        if (resource.currentNft.pending) {
          setMemberMessage(
            'Stay tuned, your NFT is almost here...'
          );
          await acceptResource({ collectionId, nftId, resourceId: resource.currentNft.id });
          checkForEvolutions([collectionId, nftId]);
        } else {
          fetchRooster(currentCId).then(setRooster);
          setAvailableEvolution({});
        }
      }
    } else {
      fetchRooster().then(setRooster);
      setMemberMessage(
        'Congratulations, you are part of this DAO now! Vote on a proposal to receive the first evolution of your NFT.'
      );
    }
  };

  useLayoutEffect(() => {
    setMemberMessage('');
    setRooster({});
    if (nft?.Ok) {
      checkForEvolutions(nft.Ok);
    }
  }, [nft]);

  const getNft = () => {
    queryGetNft().then(async result => {
      setNft(result);
    });
  };

  useEffect(() => {
    getDelegateVotes();
    getNft();
  }, [accountId, address]);

  const forget = () => {
    forgetDao(dao);
    navigate('/explore');
  };

  return (
    <Page>
      <div className="grid grid-cols-6">
        <div className="col-span-3">
          <h2 className="inline pr-8 text-xl font-semibold dark:text-white text-gray-700 capitalize">
            {dao?.name}
          </h2>
          <div className="inline mt-4 dark:text-gray-400 text-gray-500 text-sm">
            <div className="inline-flex items-center">
              <span className="inline-block relative bg-blue-500 text-blue-400 bg-opacity-20 text-xs px-1.5 py-1 font-mono rounded">
                {truncate(address, 4)}
              </span>
              <CopyButton className="ml-1" value={address} />
            </div>
          </div>
          <div>
            {!isMember && (
              <a
                onClick={() => openBecomeMemberModal(true)}
                className="inline-flex mt-12 w-max justify-between items-center px-6 py-4 border text-gray-500 dark:border-gray-700 border-gray-200 rounded-md dark:bg-elevation-1 dark:hover:bg-elevation-2 hover:bg-gray-100 cursor-pointer"
              >
                <div className="flex items-center text-base dark:text-gray-300 text-gray-500 space-x-2">
                  <UserIcon className="h-8 w-8 dark:text-gray-500 text-gray-400 group-hover:text-gray-500" />
                  <span>Become member</span>
                </div>
              </a>
            )}
            {!isMember && (
              <>
                <InformationCircleIcon
                  className="inline cursor-help ml-1.5 pt-4 w-8 h-8 dark:text-gray-500"
                  data-tip
                  data-for={`formFieldHelp-delegation`}
                />
                <ReactTooltip id={`formFieldHelp-delegation`}>
                  Get the NFT to become part of this DAO.
                </ReactTooltip>
              </>
            )}
            {votes !== 0 && isMember && (
              <Link
                to={`/dao/${address}/proposal/new`}
                className="inline-flex mt-12 mr-6 w-max justify-between items-center px-6 py-4 border text-gray-500 dark:border-gray-700 border-gray-200 rounded-md dark:bg-elevation-1 dark:hover:bg-elevation-2 hover:bg-gray-100"
              >
                <div className="flex items-center text-base dark:text-gray-300 text-gray-500 space-x-2">
                  <PlusSmIcon className="h-8 w-8 dark:text-gray-500 text-gray-400 group-hover:text-gray-500" />
                  <span>Create new proposal</span>
                </div>
              </Link>
            )}
            {isMember && (
              <a
                onClick={() => openDelegationModal(true)}
                className="inline-flex mt-12 w-max justify-between items-center px-6 py-4 border text-gray-500 dark:border-gray-700 border-gray-200 rounded-md dark:bg-elevation-1 dark:hover:bg-elevation-2 hover:bg-gray-100 cursor-pointer"
              >
                <div className="flex items-center text-base dark:text-gray-300 text-gray-500 space-x-2">
                  <UserIcon className="h-8 w-8 dark:text-gray-500 text-gray-400 group-hover:text-gray-500" />
                  <span>Delegate vote</span>
                </div>
              </a>
            )}
            {votes === 0 && isMember && (
              <>
                <InformationCircleIcon
                  className="inline cursor-help ml-1.5 pt-4 w-8 h-8 dark:text-gray-500"
                  data-tip
                  data-for={`formFieldHelp-delegation`}
                />
                <ReactTooltip id={`formFieldHelp-delegation`}>
                  You don't have enough voting power yet to vote on proposals or to create new
                  proposals. Start with delegating your vote to yourself.
                </ReactTooltip>
              </>
            )}
          </div>

          {isMember && (
            <div className="mt-14">
              <div className="inline-flex items-center text-base dark:text-gray-300 text-gray-500 space-x-2">
                <StarIcon className="h-8 w-8 dark:text-gray-500 text-gray-400 group-hover:text-gray-500" />
                <span>{rooster.description ?? memberMessage}</span>
              </div>
              {availableEvolution.resourceId && (
                <a
                  onClick={() => openEvolutionModal(true)}
                  className="inline-flex ml-8 w-max justify-between items-center px-6 py-4 border text-gray-500 dark:border-gray-700 border-gray-200 rounded-md dark:bg-elevation-1 dark:hover:bg-elevation-2 hover:bg-gray-100 cursor-pointer"
                >
                  <div className="flex items-center text-base dark:text-gray-300 text-gray-500 space-x-2">
                    <UserIcon className="h-8 w-8 dark:text-gray-500 text-gray-400 group-hover:text-gray-500" />
                    <span>See available evolution</span>
                  </div>
                </a>
              )}
            </div>
          )}
        </div>

        {rooster.imageUrl ? (
          <div className="w-60 col-span-2 justify-self-center collapsible-panel">
            <img className="p-5 max-w-full max-h-full" src={rooster.imageUrl}></img>
          </div>
        ) : (
          <div className="col-span-2"></div>
        )}
        <div>
          <Button
            className="float-right border-2 dark:border-gray-700 border-gray-200"
            onClick={forget}
          >
            <TrashIcon className="w-4 dark:text-gray-500 mr-1 justify-self-end" />
            Forget DAO
          </Button>
        </div>
      </div>

      <h2 className="mt-12 mb-3 text-xl font-semibold dark:text-white text-gray-700">Proposals</h2>

      {proposals.length > 0 ? (
        <Table
          classes="w-full"
          header={
            <>
              <th className={firstCellHeader}>Description</th>
              <th className="w-40">State</th>
              <th className="w-40">For</th>
              <th className="w-40">Against</th>
              <th className={`${lastCellHeader} w-40`}>Abstain</th>
            </>
          }
          body={proposals.map((proposal, index) => (
            <TableRow
              key={proposal.id}
              index={index}
              onClick={() => navigate(`/dao/${address}/proposal/${proposal.id}`)}
            >
              <td className={firstCellBody}>
                <Link to={`/dao/${address}/proposal/${proposal.id}`}>
                  {proposal.description.length <= SHORT_DESCRIPTION_LENGTH
                    ? proposal.description
                    : proposal.description.substring(0, 140) + '.....'}
                </Link>
              </td>
              <td>{proposalStates[proposal.id] ?? '...'}</td>
              <td className="">{proposalVotes[proposal.id]?.for ?? '...'}</td>
              <td className="">{proposalVotes[proposal.id]?.against ?? '...'}</td>
              <td className={lastCellBody}>{proposalVotes[proposal.id]?.abstain ?? '...'}</td>
            </TableRow>
          ))}
        />
      ) : (
        'No proposals yet'
      )}

      <h2 className="mt-12 mb-3 text-xl font-semibold dark:text-white text-gray-700">Top Voters</h2>
      {holders.length > 0 ? (
        <Table
          classes="w-full"
          header={
            <>
              <th className={`${firstCellHeader} w-20`}>#</th>
              <th className="text-left">Voter</th>
              <th>Address</th>
              <th className="w-40">Proposals voted</th>
              <th className="w-40">Total Votes</th>
              <th className={`${lastCellHeader} w-40`}>Voting power</th>
            </>
          }
          body={holders.map((voter, index) => (
            <TableRow key={voter} index={index}>
              <td className={firstCellBody}>{index + 1}</td>
              <td className="text-left">
                <div className="inline mr-4">
                  <strong>{keyring.getPair(voter).meta.name}</strong>
                </div>
              </td>
              <td>
                {' '}
                <div className="inline mt-4 dark:text-gray-400 text-gray-500 text-sm">
                  <div className="inline-flex items-center">
                    <span className="inline-block relative bg-blue-500 text-blue-400 bg-opacity-20 text-xs px-1.5 py-1 font-mono rounded">
                      {truncate(voter, 6)}
                    </span>
                    <CopyButton className="ml-1" value={voter} />
                  </div>
                </div>
              </td>
              <td className="">{topVoter[voter]}</td>
              <td className="">{votesByHolder[voter]}</td>
              <td className={lastCellBody}>
                {((votesByHolder[voter] / holders.length) * 100).toString().substring(0, 5)}%
              </td>
            </TableRow>
          ))}
        />
      ) : (
        'No voters yet'
      )}

      {delegationModalOpen && (
        <DelegationModal
          setIsOpen={openDelegationModal}
          isOpen={delegationModalOpen}
          onSuccess={getDelegateVotes}
          dao={address}
        />
      )}
      {becomeMemberModalOpen && (
        <BecomeMemberModal
          dao={address}
          setIsOpen={openBecomeMemberModal}
          isOpen={becomeMemberModalOpen}
          onSuccess={getNft}
        />
      )}
      {evolutionModalOpen && (
        <EvolutionModal
          dao={address}
          availableEvolution={availableEvolution}
          setIsOpen={openEvolutionModal}
          isOpen={evolutionModalOpen}
          onEvolve={checkForEvolutions}
        />
      )}
    </Page>
  );
}
