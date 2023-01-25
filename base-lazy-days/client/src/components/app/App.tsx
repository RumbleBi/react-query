import { ChakraProvider } from '@chakra-ui/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactElement } from 'react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { Loading } from './Loading';
import { Navbar } from './Navbar';
import { queryClient } from '../../react-query/queryClient';
import { Routes } from './Routes';
import { theme } from '../../theme';

export function App(): ReactElement {
  return (
    <ChakraProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <Navbar />
        <Loading />
        <Routes />
        <ReactQueryDevtools />
      </QueryClientProvider>
    </ChakraProvider>
  );
}
