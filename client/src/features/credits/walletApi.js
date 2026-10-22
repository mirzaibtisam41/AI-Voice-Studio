import { baseApi } from '@/store/baseApi';

export const walletApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyWallet: builder.query({
      query: () => '/api/wallet',
      transformResponse: (response) => response.data,
      providesTags: ['Wallet'],
    }),
  }),
});

export const { useGetMyWalletQuery } = walletApi;
