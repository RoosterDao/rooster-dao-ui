// Copyright 2022 @paritytech/contracts-ui authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Outlet } from 'react-router';
import { AwaitApis } from '../src/ui/components';
import { Sidebar } from './components/Sidebar';
import {
  ApiContextProvider,
  DatabaseContextProvider,
  TransactionsContextProvider,
  ThemeContextProvider,
} from '../src/ui/contexts';

const App = (): JSX.Element => {
  return (
    <ThemeContextProvider>
      <ApiContextProvider>
        <DatabaseContextProvider>
          <TransactionsContextProvider>
            <div className="relative md:fixed flex min-h-screen inset-0 overflow-hidden dark:bg-gray-900 dark:text-white text-black">
              <Sidebar />
              <AwaitApis>
                <Outlet />
              </AwaitApis>
            </div>
          </TransactionsContextProvider>
        </DatabaseContextProvider>
      </ApiContextProvider>
    </ThemeContextProvider>
  );
};

export default App;
