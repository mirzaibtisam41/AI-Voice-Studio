import { baseApi } from '@/store/baseApi';

export const speechApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSpeechOptions: builder.query({
      query: () => '/api/speech/options',
      transformResponse: (response) => response.data,
      providesTags: ['Voices', 'AiModels'],
    }),
    getSpeechDefaults: builder.query({
      query: () => '/api/me/settings',
      transformResponse: (response) => response.data.settings,
      providesTags: ['UserSettings'],
    }),
    getRecentSpeechFiles: builder.query({
      query: (limit) => ({
        url: '/api/audio-files',
        params: { kind: 'generated', limit },
      }),
      transformResponse: (response) => response.data.audioFiles,
      providesTags: ['AudioFiles'],
    }),
    createSpeech: builder.mutation({
      query: (body) => ({ url: '/api/speech', method: 'POST', body }),
      transformResponse: (response) => response.data,
      invalidatesTags: [
        'Wallet',
        'AudioFiles',
        'Generations',
        'Transactions',
        'Usage',
      ],
    }),
    getSpeechDownloadUrl: builder.mutation({
      query: (audioFileId) => `/api/audio-files/${audioFileId}/download`,
      transformResponse: (response) => response.data.url,
    }),
  }),
});

export const {
  useGetSpeechOptionsQuery,
  useGetSpeechDefaultsQuery,
  useGetRecentSpeechFilesQuery,
  useCreateSpeechMutation,
  useGetSpeechDownloadUrlMutation,
} = speechApi;
