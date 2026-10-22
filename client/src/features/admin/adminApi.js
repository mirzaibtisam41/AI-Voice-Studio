import { baseApi } from '@/store/baseApi';

const MODEL_CHANGE_TAGS = [
  'AiModels',
  'AiProviders',
  'Platform',
  'AuditLogs',
  'Voices',
];

const CREDIT_CHANGE_TAGS = [
  'AdminUsers',
  'AdminUserWallet',
  'CreditAdjustments',
  'AuditLogs',
  'Analytics',
  'Wallet',
  'Transactions',
  'Usage',
];

function cleanParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== '',
    ),
  );
}

function withMeta(key) {
  return (response) => ({ items: response.data[key], meta: response.meta });
}

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAnalyticsOverview: builder.query({
      query: () => '/api/admin/analytics/overview',
      transformResponse: (response) => response.data.overview,
      providesTags: ['Analytics'],
    }),

    listAdminUsers: builder.query({
      query: (params) => ({
        url: '/api/admin/users',
        params: cleanParams(params),
      }),
      transformResponse: withMeta('users'),
      providesTags: ['AdminUsers'],
    }),
    getAdminUser: builder.query({
      query: (userId) => `/api/admin/users/${userId}`,
      transformResponse: (response) => response.data,
      providesTags: ['AdminUsers'],
    }),
    getAdminUserWallet: builder.query({
      query: (userId) => `/api/admin/users/${userId}/wallet`,
      transformResponse: (response) => response.data,
      providesTags: ['AdminUserWallet'],
    }),
    updateUserStatus: builder.mutation({
      query: ({ userId, status }) => ({
        url: `/api/admin/users/${userId}/status`,
        method: 'PATCH',
        body: { status },
      }),
      transformResponse: (response) => response.data.user,
      invalidatesTags: ['AdminUsers', 'AuditLogs', 'Analytics'],
    }),
    updateUserRole: builder.mutation({
      query: ({ userId, role }) => ({
        url: `/api/admin/users/${userId}/role`,
        method: 'PATCH',
        body: { role },
      }),
      transformResponse: (response) => response.data.user,
      invalidatesTags: ['AdminUsers', 'AuditLogs'],
    }),
    adjustUserCredits: builder.mutation({
      query: ({ userId, amount, reason, idempotencyKey }) => ({
        url: `/api/admin/users/${userId}/credit-adjustments`,
        method: 'POST',
        body: { amount, reason },
        headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {},
      }),
      transformResponse: (response) => ({
        ...response.data,
        message: response.message,
      }),
      invalidatesTags: CREDIT_CHANGE_TAGS,
    }),
    listCreditAdjustments: builder.query({
      query: (params) => ({
        url: '/api/admin/users/credit-adjustments/recent',
        params: cleanParams(params),
      }),
      transformResponse: withMeta('adjustments'),
      providesTags: ['CreditAdjustments'],
    }),

    listAiProviders: builder.query({
      query: () => '/api/admin/providers',
      transformResponse: (response) => response.data.providers,
      providesTags: ['AiProviders'],
    }),
    createAiProvider: builder.mutation({
      query: (body) => ({ url: '/api/admin/providers', method: 'POST', body }),
      transformResponse: (response) => response.data.provider,
      invalidatesTags: ['AiProviders', 'AuditLogs'],
    }),
    updateAiProvider: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/api/admin/providers/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['AiProviders', 'AiModels', 'AuditLogs'],
    }),
    updateAiProviderStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/api/admin/providers/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: MODEL_CHANGE_TAGS,
    }),
    deleteAiProvider: builder.mutation({
      query: (id) => ({ url: `/api/admin/providers/${id}`, method: 'DELETE' }),
      invalidatesTags: ['AiProviders', 'AuditLogs'],
    }),

    listAiCapabilities: builder.query({
      query: () => '/api/admin/models/capabilities',
      transformResponse: (response) => response.data.capabilities,
      keepUnusedDataFor: 600,
    }),
    listAiModels: builder.query({
      query: (params) => ({
        url: '/api/admin/models',
        params: cleanParams(params),
      }),
      transformResponse: withMeta('models'),
      providesTags: ['AiModels'],
    }),
    getAiModel: builder.query({
      query: (id) => `/api/admin/models/${id}`,
      transformResponse: (response) => response.data.model,
      providesTags: ['AiModels'],
    }),
    createAiModel: builder.mutation({
      query: (body) => ({ url: '/api/admin/models', method: 'POST', body }),
      transformResponse: (response) => response.data.model,
      invalidatesTags: MODEL_CHANGE_TAGS,
    }),
    updateAiModel: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/api/admin/models/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: MODEL_CHANGE_TAGS,
    }),
    saveAiModelCapability: builder.mutation({
      query: ({ id, code, enabled, creditsPerUnit }) => ({
        url: `/api/admin/models/${id}/capabilities/${code}`,
        method: 'PUT',
        body: { enabled, creditsPerUnit },
      }),
      invalidatesTags: MODEL_CHANGE_TAGS,
    }),
    setAiModelCapabilityDefault: builder.mutation({
      query: ({ id, code }) => ({
        url: `/api/admin/models/${id}/capabilities/${code}/default`,
        method: 'PATCH',
      }),
      invalidatesTags: MODEL_CHANGE_TAGS,
    }),
    updateAiModelStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/api/admin/models/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: MODEL_CHANGE_TAGS,
    }),

    listAdminVoices: builder.query({
      query: () => '/api/admin/voices',
      transformResponse: (response) => response.data.voices,
      providesTags: ['AdminVoices'],
    }),
    updateAdminVoice: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/api/admin/voices/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['AdminVoices', 'Voices', 'AuditLogs'],
    }),

    getPlatformSettings: builder.query({
      query: () => '/api/admin/settings',
      transformResponse: (response) => response.data.settings,
      providesTags: ['PlatformSettings'],
    }),
    updatePlatformSettings: builder.mutation({
      query: (body) => ({
        url: '/api/admin/settings',
        method: 'PATCH',
        body,
      }),
      transformResponse: (response) => response.data.settings,
      invalidatesTags: ['PlatformSettings', 'Platform', 'AuditLogs'],
    }),

    listAdminGenerations: builder.query({
      query: (params) => ({
        url: '/api/admin/generations',
        params: cleanParams(params),
      }),
      transformResponse: withMeta('generations'),
      providesTags: ['AdminGenerations'],
    }),
    getGenerationStats: builder.query({
      query: () => '/api/admin/generations/stats',
      transformResponse: (response) => response.data,
      providesTags: ['AdminGenerations'],
    }),
    getAdminGeneration: builder.query({
      query: (id) => `/api/admin/generations/${id}`,
      transformResponse: (response) => response.data.generation,
      providesTags: ['AdminGenerations'],
    }),
    refundGeneration: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/api/admin/generations/${id}/refund`,
        method: 'POST',
        body: { reason },
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: [
        ...CREDIT_CHANGE_TAGS,
        'AdminGenerations',
        'Generations',
      ],
    }),

    listAuditLogs: builder.query({
      query: (params) => ({
        url: '/api/admin/audit-logs',
        params: cleanParams(params),
      }),
      transformResponse: withMeta('auditLogs'),
      providesTags: ['AuditLogs'],
    }),
  }),
});

export const {
  useGetAnalyticsOverviewQuery,
  useListAdminUsersQuery,
  useGetAdminUserQuery,
  useGetAdminUserWalletQuery,
  useUpdateUserStatusMutation,
  useUpdateUserRoleMutation,
  useAdjustUserCreditsMutation,
  useListCreditAdjustmentsQuery,
  useListAiProvidersQuery,
  useCreateAiProviderMutation,
  useUpdateAiProviderMutation,
  useUpdateAiProviderStatusMutation,
  useDeleteAiProviderMutation,
  useListAiCapabilitiesQuery,
  useListAiModelsQuery,
  useGetAiModelQuery,
  useCreateAiModelMutation,
  useUpdateAiModelMutation,
  useSaveAiModelCapabilityMutation,
  useSetAiModelCapabilityDefaultMutation,
  useUpdateAiModelStatusMutation,
  useListAdminVoicesQuery,
  useUpdateAdminVoiceMutation,
  useGetPlatformSettingsQuery,
  useUpdatePlatformSettingsMutation,
  useListAdminGenerationsQuery,
  useGetGenerationStatsQuery,
  useGetAdminGenerationQuery,
  useRefundGenerationMutation,
  useListAuditLogsQuery,
} = adminApi;
