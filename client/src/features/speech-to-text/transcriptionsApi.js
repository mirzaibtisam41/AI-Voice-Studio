import { baseApi } from '@/store/baseApi';

export const transcriptionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTranscriptionOptions: builder.query({
      query: () => '/api/transcriptions/options',
      transformResponse: (response) => response.data,
      providesTags: ['AiModels'],
    }),
    listSttTranscripts: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: '/api/transcriptions',
        params: { page, limit },
      }),
      transformResponse: (response) => ({
        transcriptions: response.data.transcriptions,
        meta: response.meta,
      }),
      providesTags: [{ type: 'Transcriptions', id: 'LIST' }],
    }),
    getSttTranscript: builder.query({
      query: (id) => `/api/transcriptions/${id}`,
      transformResponse: (response) => response.data.transcription,
      providesTags: (_result, _error, id) => [{ type: 'Transcriptions', id }],
    }),
    createSttTranscript: builder.mutation({
      query: (body) => ({ url: '/api/transcriptions', method: 'POST', body }),
      transformResponse: (response) => response.data,
      invalidatesTags: [
        'Wallet',
        'Transactions',
        'Usage',
        'Generations',
        'Transcriptions',
        'AudioFiles',
      ],
    }),
    updateSttTranscript: builder.mutation({
      query: ({ id, text }) => ({
        url: `/api/transcriptions/${id}`,
        method: 'PATCH',
        body: { text },
      }),
      transformResponse: (response) => response.data.transcription,
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Transcriptions', id: 'LIST' },
        { type: 'Transcriptions', id },
      ],
    }),
    deleteSttTranscript: builder.mutation({
      query: (id) => ({ url: `/api/transcriptions/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Transcriptions', id: 'LIST' }, 'AudioFiles'],
    }),
    listSttUploads: builder.query({
      query: (limit) => ({
        url: '/api/audio-files',
        params: { kind: 'uploaded', limit },
      }),
      transformResponse: (response) => response.data.audioFiles,
      providesTags: ['AudioFiles'],
    }),
    uploadSttAudio: builder.mutation({
      query: (file) => {
        const body = new FormData();

        body.append('file', file);

        return { url: '/api/audio-files', method: 'POST', body };
      },
      transformResponse: (response) => response.data.audioFile,
      invalidatesTags: ['AudioFiles'],
    }),
  }),
});

export const {
  useGetTranscriptionOptionsQuery,
  useListSttTranscriptsQuery,
  useGetSttTranscriptQuery,
  useCreateSttTranscriptMutation,
  useUpdateSttTranscriptMutation,
  useDeleteSttTranscriptMutation,
  useListSttUploadsQuery,
  useUploadSttAudioMutation,
} = transcriptionsApi;
