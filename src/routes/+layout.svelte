<script>
  import {QueryClient, QueryClientProvider} from '@tanstack/svelte-query';

  import './global.scss';

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        retry: false,
      },
    },
  });
</script>

<QueryClientProvider client={queryClient}>
  <slot></slot>
</QueryClientProvider>
