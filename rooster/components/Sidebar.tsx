// Copyright 2022 @paritytech/contracts-ui authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { NetworkAndUser } from '../../src/ui/components/sidebar/NetworkAndUser';
import {
  CogIcon,
  PlusCircleIcon,
  SearchCircleIcon,
  DotsCircleHorizontalIcon,
} from '@heroicons/react/outline';
import { NavLink } from '../../src/ui/components/sidebar/NavLink';
import { Link } from 'react-router-dom';
import { useDaos } from '../lib/hooks';

function Navigation() {
  return (
    <div className="navigation">
      <NavLink icon={SearchCircleIcon} to={`/explore`} end>
        Explore DAO's
      </NavLink>
      <NavLink icon={PlusCircleIcon} to={`/add`} end>
        Add DAO
      </NavLink>
    </div>
  );
}

function QuickLinks() {
  const { daosList } = useDaos();
  return (
    <div className="quick-links">
      <div className="section your-contracts">
        {daosList.length > 0 && <div className="header">Your DAO's</div>}
        {daosList.map((dao: any) => {
          return (
            <NavLink icon={DotsCircleHorizontalIcon} key={dao.address} to={`/dao/${dao.address}`}>
              {dao.name}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div>
        <div>
          <div className="text-xs font-medium dark:text-gray-500 text-gray-600">
            <span>Site based on</span>
          </div>
          <div className="text-xs font-medium dark:text-gray-500 text-gray-600 dark:hover:text-gray-300 hover:text-gray-400 cursor-pointer">
            <a href="https://paritytech.github.io/contracts-ui/" target="_blank">
              Parity's Contracts UI
            </a>
          </div>
        </div>
      </div>
    </footer>
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
              <QuickLinks />
            </nav>
          </div>
          <Footer />
        </div>
      </div>
    </>
  );
}
