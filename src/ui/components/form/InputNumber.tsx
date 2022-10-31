// Copyright 2022 @paritytech/contracts-ui authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { classes } from 'helpers';

export function InputNumber({
  children,
  className,
  onChange,
  value,
  disabled,
  min,
  max,
  placeholder,
  step,
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <input
        onChange={onChange}
        type="number"
        value={value?.toString() ?? ''}
        className={classes(
          className,
          'w-full dark:bg-gray-900 dark:text-gray-300 bg-white dark:border-gray-700 border-gray-200 rounded text-sm',
          disabled && 'dark:text-gray-500'
        )}
        disabled={disabled}
        min={min}
        max={max}
        placeholder={placeholder}
        step={step}
      />
      {children}
    </div>
  );
}
