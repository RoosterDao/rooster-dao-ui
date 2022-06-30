// Copyright 2022 @paritytech/contracts-ui authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Buffer } from 'buffer';
import { createRoot } from 'react-dom/client';
import { HashRouter, Route, Routes } from 'react-router-dom';
import App from './App';
import '../src/ui/styles/main.css';
import '@polkadot/api-augment';
import { Add } from './components/Add';
import { Explore } from './components/Explore';
import { Home } from './components/Home';
import { Settings } from './components/Settings';

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
        <Route path="add" element={<Add />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  </HashRouter>
);
