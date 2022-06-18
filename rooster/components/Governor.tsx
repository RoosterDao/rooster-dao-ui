// Components
import { PageFull } from '../../src/ui/templates';
import { Form, FormField } from '../../src/ui/components/form';

// Hooks
import { useEffect, useState } from 'react';
import { useApi } from '../../src/ui/contexts';

// Utility
import { Abi, ContractPromise as Contract } from '../../src/types';
import abi from '../../contracts/governor/target/ink/metadata.json';

export function Governor() {
  const { api } = useApi();
  const [blockNumber, setBlockNumber] = useState(0);
  const [contractAddress, setContractAddress] = useState('');
  const [availableMessages, setAvailableMessages] = useState([]);

  const subscribeToNewBlocks = async () => {
    await api.rpc.chain.subscribeNewHeads(header => {
      setBlockNumber(header.number);
    });
  };

  useEffect(() => {
    subscribeToNewBlocks();
  }, []);

  useEffect(() => {
    api.query.system.events().then(events => {
      events.forEach(event => {
        if (api.events.contracts.Instantiated.is(event.event)) {
          const [account_id, contract_evt] = event.event.data;
          const contract = new Contract(api, abi, contract_evt);
          setAvailableMessages(Object.keys(contract.query));
          setContractAddress(contract.address.toHuman());
        }
      });
    });
  });

  return (
    <PageFull header="Governor" help={<>Test the Governor smart contract.</>}>
      <div className="grid grid-cols-12 w-full">
        <div className="col-span-8 lg:col-span-8 2xl:col-span-8 rounded-lg w-full">
          <Form>
            <FormField
              className="mt-4"
              help=""
              id="currentBlockNumberLabel"
              label="Current Block Number"
              isError={false}
              message={''}
            >
              <div>
                <span className="font-semibold">{blockNumber.toString()}</span>
              </div>
            </FormField>
            <FormField
              className="mt-4"
              help=""
              id="governorContractAdressLabel"
              label="Last deployed Governor contract address"
              isError={false}
              message={''}
            >
              <div>
                <span className="font-semibold">{contractAddress.toString()}</span>
              </div>
            </FormField>
            <FormField
              className="mt-4"
              help=""
              id="availableMessagesLabel"
              label="Available messages"
              isError={false}
              message={''}
            >
              <div>
                {availableMessages.map(message => (
                  <div>{message}</div>
                ))}
              </div>
            </FormField>
          </Form>
        </div>
      </div>
    </PageFull>
  );
}
