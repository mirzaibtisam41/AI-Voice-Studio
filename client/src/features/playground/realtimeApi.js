import { baseApi } from '@/store/baseApi';

const CREDIT_TAGS = [
  'Wallet',
  'Transactions',
  'Usage',
  'Generations',
  'RealtimeSessions',
  'AgentAnalytics',
];

export const realtimeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRealtimeOptions: builder.query({
      query: () => '/api/realtime/options',
      transformResponse: (response) => response.data,
      providesTags: ['Platform', 'Voices'],
    }),
    listRealtimeSessions: builder.query({
      query: (params = {}) => ({ url: '/api/realtime/sessions', params }),
      transformResponse: (response) => ({
        sessions: response.data.sessions,
        meta: response.meta,
      }),
      providesTags: ['RealtimeSessions'],
    }),
    getRealtimeSession: builder.query({
      query: (id) => `/api/realtime/sessions/${id}`,
      transformResponse: (response) => response.data.session,
      providesTags: (_result, _error, id) => [{ type: 'RealtimeSessions', id }],
    }),
    startRealtimeSession: builder.mutation({
      query: (body) => ({
        url: '/api/realtime/sessions',
        method: 'POST',
        body,
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: CREDIT_TAGS,
    }),
    endRealtimeSession: builder.mutation({
      query: ({ id, transcript }) => ({
        url: `/api/realtime/sessions/${id}/end`,
        method: 'POST',
        body: { transcript },
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: CREDIT_TAGS,
    }),
    cancelRealtimeSession: builder.mutation({
      query: (id) => ({
        url: `/api/realtime/sessions/${id}/cancel`,
        method: 'POST',
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: CREDIT_TAGS,
    }),
  }),
});

export const {
  useGetRealtimeOptionsQuery,
  useListRealtimeSessionsQuery,
  useGetRealtimeSessionQuery,
  useStartRealtimeSessionMutation,
  useEndRealtimeSessionMutation,
  useCancelRealtimeSessionMutation,
} = realtimeApi;
