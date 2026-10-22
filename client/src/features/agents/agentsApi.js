import { baseApi } from '@/store/baseApi';

export const agentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listAgents: builder.query({
      query: () => ({ url: '/api/agents', params: { limit: 50 } }),
      transformResponse: (response) => response.data.agents,
      providesTags: ['Agents'],
    }),
    getAgent: builder.query({
      query: (id) => `/api/agents/${id}`,
      transformResponse: (response) => response.data.agent,
      providesTags: (_result, _error, id) => [{ type: 'Agents', id }],
    }),
    createAgent: builder.mutation({
      query: (body) => ({ url: '/api/agents', method: 'POST', body }),
      transformResponse: (response) => response.data.agent,
      invalidatesTags: ['Agents'],
    }),
    updateAgent: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/api/agents/${id}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response) => response.data.agent,
      invalidatesTags: (_result, _error, { id }) => [
        'Agents',
        { type: 'Agents', id },
      ],
    }),
    updateAgentStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/api/agents/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      transformResponse: (response) => response.data.agent,
      invalidatesTags: (_result, _error, { id }) => [
        'Agents',
        { type: 'Agents', id },
      ],
    }),
    duplicateAgent: builder.mutation({
      query: (id) => ({ url: `/api/agents/${id}/duplicate`, method: 'POST' }),
      transformResponse: (response) => response.data.agent,
      invalidatesTags: ['Agents'],
    }),
    deleteAgent: builder.mutation({
      query: (id) => ({ url: `/api/agents/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Agents'],
    }),
    chatWithAgent: builder.mutation({
      query: ({ id, messages }) => ({
        url: `/api/agents/${id}/chat`,
        method: 'POST',
        body: { messages },
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: [
        'Wallet',
        'Transactions',
        'Usage',
        'Generations',
        'AgentAnalytics',
      ],
    }),
    getAgentAnalytics: builder.query({
      query: ({ id, days }) => ({
        url: `/api/agents/${id}/analytics`,
        params: { days },
      }),
      transformResponse: (response) => response.data.analytics,
      providesTags: ['AgentAnalytics'],
    }),
  }),
});

export const {
  useListAgentsQuery,
  useGetAgentQuery,
  useCreateAgentMutation,
  useUpdateAgentMutation,
  useUpdateAgentStatusMutation,
  useDuplicateAgentMutation,
  useDeleteAgentMutation,
  useChatWithAgentMutation,
  useGetAgentAnalyticsQuery,
} = agentsApi;
