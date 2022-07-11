// Copyright 2022 @paritytech/contracts-ui authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createContext, useContext, useEffect, useState } from 'react';
import { useLocalStorage } from 'ui/hooks/useLocalStorage';

type Theme = 'light' | 'dark';
type Props = {
  theme: Theme;
  setTheme?: (_: Theme) => void;
};

const INIT_STATE: Props = {
  theme: 'light',
};

export const ThemeContext = createContext(INIT_STATE);

export const ThemeContextProvider = ({ children }: React.PropsWithChildren<Partial<Props>>) => {
  const [theme, setTheme] = useState('light');
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};
export const useTheme = () => useContext(ThemeContext);
