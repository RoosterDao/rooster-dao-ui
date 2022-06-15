// Components
import { PageFull } from '../../src/ui/templates';

export function Governor() {
  return (
    <PageFull
      header="Governor"
      help={
        <>
          Test the Governor smart contract.
        </>
      }
    >
      <div className="grid grid-cols-12 w-full">
        <div className="col-span-8 lg:col-span-8 2xl:col-span-8 rounded-lg w-full"></div>
      </div>
    </PageFull>
  );
}
