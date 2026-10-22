import { baseApi } from '@/store/baseApi';

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    countAgentsByStatus: builder.query({
      query: (status) => ({
        url: '/api/agents',
        params: { status, limit: 1 },
      }),
      transformResponse: (response) => response.meta.total,
      providesTags: ['Agents'],
    }),
  }),
});

export const { useCountAgentsByStatusQuery } = dashboardApi;
