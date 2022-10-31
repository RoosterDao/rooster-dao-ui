// Copyright 2022 @paritytech/contracts-ui authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { CheckIcon } from '@heroicons/react/outline';
import { format } from 'date-fns';
import { classes } from '../../src/helpers';

export type Step = { name: string; date: number; index: number };

interface Props {
  steps: Step[];
}

export function Timeline({ steps }: Props) {
  return (
    <>
      {steps.map(({ name, index, date }) => {
        const currentDate = Date.now();
        const isFilled = date <= currentDate;
        const isCurrent = steps.filter(x => x.date > currentDate)?.[0]?.date === date;

        return (
          <div key={`${name}`}>
            {index > 1 ? (
              <div className="flex justify-center w-6 py-4">
                <span
                  className={`h-14 ${
                    isFilled ? 'bg-green-500' : 'dark:bg-elevation-2 bg-gray-200'
                  }`}
                  style={{ width: '2px' }}
                ></span>
              </div>
            ) : null}
            <div className="flex space-x-4 items-center">
              <div
                className={classes(
                  isFilled
                    ? 'bg-green-500 text-white'
                    : 'dark:bg-elevation-2 bg-gray-200 dark:text-white text-gray-600',
                  'flex items-center justify-center  text-center text-sm rounded-md w-6 h-6 p-1'
                )}
              >
                {date < currentDate ? (
                  <CheckIcon className="bg-green-500 text-white text-lg rounded-md w-6" />
                ) : (
                  index
                )}
              </div>
              <span
                className={classes(
                  'text-sm',
                  isCurrent ? 'text-gray-400 dark:text-gray-200' : 'text-gray-500'
                )}
              >
                <div className="mb-2">{name}</div>
                <div className="mb-2">{format(date, 'dd. MMMM yy')}</div>
                <div className="mb-2">at {format(date, 'HH:mm:ss')}</div>
              </span>
            </div>
          </div>
        );
      })}
    </>
  );
}
