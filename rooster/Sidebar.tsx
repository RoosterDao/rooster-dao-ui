// Copyright 2022 @paritytech/contracts-ui authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { NetworkAndUser } from '../src/ui/components/sidebar/NetworkAndUser';
import { SwitchVerticalIcon, PhotographIcon, DocumentReportIcon } from '@heroicons/react/outline';
import { NavLink } from '../src/ui/components/sidebar/NavLink';

// Copyright 2022 @paritytech/contracts-ui authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

function Navigation() {
  return (
    <div className="navigation">
      <NavLink to={`/test-flipper`} icon={SwitchVerticalIcon}>
        Flipper
      </NavLink>
      <NavLink icon={PhotographIcon} to={`/test-erc721`} end>
        Erc 721
      </NavLink>
      <NavLink icon={DocumentReportIcon} to={`/test-governor`} end>
        Governor
      </NavLink>
    </div>
  );
}

export function Sidebar() {
  return (
    <>
      <div className="sidebar">
        <div className="sidebar-inner">
          <div className="upper">
            <nav aria-label="Sidebar">
              <NetworkAndUser />
              <Navigation />
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}
