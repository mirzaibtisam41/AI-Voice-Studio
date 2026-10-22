import { baseApi } from '@/store/baseApi';

const LIST_ENDPOINT = 'listLibraryAudioFiles';

function patchCachedLists({ dispatch, getState }, id, changes) {
  const patches = libraryApi.util
    .selectCachedArgsForQuery(getState(), LIST_ENDPOINT)
    .map((args) =>
      dispatch(
        libraryApi.util.updateQueryData(LIST_ENDPOINT, args, (draft) => {
          const audioFile = draft.audioFiles.find((item) => item.id === id);

          if (audioFile) Object.assign(audioFile, changes);
        }),
      ),
    );

  return () => patches.forEach((patch) => patch.undo());
}

export const libraryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    [LIST_ENDPOINT]: builder.query({
      query: (params) => ({ url: '/api/audio-files', params }),
      transformResponse: (response) => ({
        audioFiles: response.data.audioFiles,
        meta: response.meta,
      }),
      providesTags: ['AudioFiles'],
    }),
    uploadAudioFile: builder.mutation({
      query: (formData) => ({
        url: '/api/audio-files',
        method: 'POST',
        body: formData,
      }),
      transformResponse: (response) => response.data.audioFile,
      invalidatesTags: ['AudioFiles'],
    }),
    updateAudioFile: builder.mutation({
      query: ({ id, ...changes }) => ({
        url: `/api/audio-files/${id}`,
        method: 'PATCH',
        body: changes,
      }),
      transformResponse: (response) => response.data.audioFile,
      async onQueryStarted({ id, ...changes }, api) {
        const undo = patchCachedLists(api, id, changes);

        try {
          await api.queryFulfilled;
        } catch {
          undo();
        }
      },
      invalidatesTags: ['AudioFiles'],
    }),
    deleteAudioFile: builder.mutation({
      query: (id) => ({ url: `/api/audio-files/${id}`, method: 'DELETE' }),
      invalidatesTags: ['AudioFiles'],
    }),
    getAudioFileDownload: builder.mutation({
      query: (id) => `/api/audio-files/${id}/download`,
      transformResponse: (response) => response.data.url,
    }),
  }),
});

export const {
  useListLibraryAudioFilesQuery,
  useUploadAudioFileMutation,
  useUpdateAudioFileMutation,
  useDeleteAudioFileMutation,
  useGetAudioFileDownloadMutation,
} = libraryApi;
