import { baseApi } from '@/store/baseApi';
import { userUpdated } from '@/features/auth/authSlice';

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMySettings: builder.query({
      query: () => '/api/me/settings',
      transformResponse: (response) => response.data.settings,
      providesTags: ['UserSettings'],
    }),
    updateMySettings: builder.mutation({
      query: (body) => ({ url: '/api/me/settings', method: 'PATCH', body }),
      transformResponse: (response) => response.data.settings,
      async onQueryStarted(_body, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          dispatch(
            settingsApi.util.upsertQueryData('getMySettings', undefined, data),
          );
        } catch {
          return;
        }
      },
    }),
    updateMyProfile: builder.mutation({
      query: (body) => ({ url: '/api/me/profile', method: 'PATCH', body }),
      transformResponse: (response) => response.data.user,
      async onQueryStarted(_body, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          dispatch(userUpdated(data));
        } catch {
          return;
        }
      },
    }),
    changeMyPassword: builder.mutation({
      query: (body) => ({ url: '/api/me/password', method: 'POST', body }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['Sessions'],
    }),
    deactivateMyAccount: builder.mutation({
      query: (body) => ({ url: '/api/me/deactivate', method: 'POST', body }),
    }),
    getSettingsVoiceOptions: builder.query({
      query: () => '/api/voices',
      transformResponse: (response) => response.data.voices,
      providesTags: ['Voices'],
    }),
  }),
});

export const {
  useGetMySettingsQuery,
  useUpdateMySettingsMutation,
  useUpdateMyProfileMutation,
  useChangeMyPasswordMutation,
  useDeactivateMyAccountMutation,
  useGetSettingsVoiceOptionsQuery,
} = settingsApi;
