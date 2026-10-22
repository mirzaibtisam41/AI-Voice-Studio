import { baseApi } from '@/store/baseApi';

export const platformApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    publicPlatform: builder.query({
      query: () => '/api/platform',
      transformResponse: (response) => response.data,
      providesTags: ['Platform'],
    }),
  }),
});

export const { usePublicPlatformQuery } = platformApi;
