// Copyright 2022 @paritytech/contracts-ui authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Buffer } from 'buffer';
import { createRoot } from 'react-dom/client';
import { HashRouter, Route, Routes } from 'react-router-dom';
import App from './App';
import '../src/ui/styles/main.css';
import '@polkadot/api-augment';
import { AddDao } from './components/AddDao';
import { Explore } from './components/Explore';
import { Home } from './components/Home';
import { ViewDao } from './components/ViewDao';
import { Settings } from './components/Settings';
import { AddProposal } from './components/AddProposal';
import { ViewProposal } from './components/ViewProposal';

globalThis.Buffer = Buffer;

const container = document.getElementById('app-root');
// non-null assertion encouraged by react 18 upgrade guide
// https://reactjs.org/blog/2022/03/08/react-18-upgrade-guide.html#updates-to-client-rendering-apis
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!);

root.render(
  <HashRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<Home />} />
        <Route path="explore" element={<Explore />} />
        <Route path="add" element={<AddDao />} />
        <Route path="settings" element={<Settings />} />
        <Route path="/dao/:address/" element={<ViewDao />} />
        <Route path="/dao/:address/proposal/new" element={<AddProposal />} />
        <Route path="/dao/:address/proposal/:proposal/" element={<ViewProposal />} />
      </Route>
    </Routes>
  </HashRouter>
);
