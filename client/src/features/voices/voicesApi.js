import { baseApi } from '@/store/baseApi';

export const voicesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAvailableVoices: builder.query({
      query: () => '/api/voices',
      transformResponse: (response) => response.data.voices,
      providesTags: ['Voices'],
    }),
    getVoicePreview: builder.query({
      query: (voiceId) => `/api/speech/voices/${voiceId}/preview`,
      transformResponse: (response) => response.data.url,
      keepUnusedDataFor: 300,
    }),
  }),
});

export const {
  useGetAvailableVoicesQuery,
  useGetVoicePreviewQuery,
  useLazyGetVoicePreviewQuery,
} = voicesApi;
