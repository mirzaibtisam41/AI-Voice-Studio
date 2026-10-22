import { baseApi } from '@/store/baseApi';

export const creditsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsageSummary: builder.query({
      query: ({ days, timezone }) => ({
        url: '/api/usage',
        params: { days, timezone },
      }),
      transformResponse: (response) => response.data,
      providesTags: ['Usage'],
    }),
    listWalletTransactions: builder.query({
      query: ({ page, limit, type }) => ({
        url: '/api/wallet/transactions',
        params: type ? { page, limit, type } : { page, limit },
      }),
      transformResponse: (response) => ({
        transactions: response.data.transactions,
        meta: response.meta,
      }),
      providesTags: ['Transactions'],
    }),
    getPublicPlatform: builder.query({
      query: () => '/api/platform',
      transformResponse: (response) => response.data,
      providesTags: ['Platform'],
    }),
  }),
});

export const {
  useGetUsageSummaryQuery,
  useListWalletTransactionsQuery,
  useGetPublicPlatformQuery,
} = creditsApi;
