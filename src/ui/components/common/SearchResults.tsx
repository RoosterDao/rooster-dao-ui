// Copyright 2022 @paritytech/contracts-ui authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { CodeIcon } from '@heroicons/react/outline';
import { CodeBundleDocument, ContractDocument, VoidFn } from 'types';
import { classes } from 'helpers';

interface ItemProps extends React.HTMLAttributes<HTMLDivElement> {
  name: React.ReactNode;
  icon: React.ComponentType<React.HTMLAttributes<HTMLOrSVGElement>>;
  identifier: string;
  onClick: VoidFn;
}

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  contracts?: ContractDocument[] | null;
  codeBundles?: CodeBundleDocument[] | null;
  isOpen?: boolean;
  onSelectCodeBundle?: (_: CodeBundleDocument) => void;
  onSelectContract?: (_: ContractDocument) => void;
}

function SearchResultItem({ icon: Icon, name, identifier, onClick }: ItemProps) {
  return (
    <div className="group item" onClick={onClick}>
      <div>
        <Icon className="dark:group-hover:text-white" />
      </div>
      <span className="name dark:group-hover:text-white">{name}</span>
      <span className="identifier dark:group-hover:text-white">{identifier}</span>
    </div>
  );
}

export function SearchResults({
  className,
  contracts,
  codeBundles,
  isOpen,
  onSelectCodeBundle,
  onSelectContract,
}: Props) {
  return (
    <div className={classes('search-results', !isOpen && 'invisible', className)}>
      {onSelectContract && (
        <>
          <div className="header">Contracts</div>
          {contracts &&
            contracts?.length > 0 &&
            contracts.map(contract => {
              return (
                <SearchResultItem
                  icon={CodeIcon}
                  identifier={contract.address}
                  key={contract.address}
                  name={contract.name}
                  onMouseDown={e => {
                    e.preventDefault();
                  }}
                  onClick={() => onSelectContract(contract)}
                />
              );
            })}
          {!contracts ||
            (contracts.length === 0 && <div className="text-sm">No matches found.</div>)}
        </>
      )}

      {onSelectCodeBundle && (
        <>
          <div className="header">Code Bundles</div>
          {codeBundles &&
            codeBundles?.length > 0 &&
            codeBundles.map(codeBundle => {
              return (
                <SearchResultItem
                  icon={CodeIcon}
                  identifier={codeBundle.codeHash}
                  key={codeBundle.codeHash}
                  name={codeBundle.name}
                  onMouseDown={e => {
                    e.preventDefault();
                  }}
                  onClick={() => {
                    onSelectCodeBundle(codeBundle);
                  }}
                />
              );
            })}
          {!codeBundles ||
            (codeBundles.length === 0 && <div className="text-sm">No matches found.</div>)}
        </>
      )}
    </div>
  );
}
