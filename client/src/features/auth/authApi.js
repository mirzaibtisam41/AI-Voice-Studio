import { baseApi } from '@/store/baseApi';
import {
  loggedOut,
  sessionStarted,
  userUpdated,
} from '@/features/auth/authSlice';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (body) => ({ url: '/api/auth/register', method: 'POST', body }),
      transformResponse: (response) => response.data,
    }),
    login: builder.mutation({
      query: (body) => ({ url: '/api/auth/login', method: 'POST', body }),
      transformResponse: (response) => response.data,
      async onQueryStarted(_body, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          dispatch(sessionStarted(data));
        } catch {
          return;
        }
      },
    }),
    logout: builder.mutation({
      query: () => ({ url: '/api/auth/logout', method: 'POST' }),
      async onQueryStarted(_body, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch {
          return;
        } finally {
          dispatch(loggedOut());
        }
      },
    }),
    getMe: builder.query({
      query: () => '/api/auth/me',
      transformResponse: (response) => response.data,
      providesTags: ['Me'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          dispatch(userUpdated(data.user));
        } catch {
          return;
        }
      },
    }),
    forgotPassword: builder.mutation({
      query: (body) => ({
        url: '/api/auth/forgot-password',
        method: 'POST',
        body,
      }),
    }),
    resetPassword: builder.mutation({
      query: (body) => ({
        url: '/api/auth/reset-password',
        method: 'POST',
        body,
      }),
    }),
    verifyEmail: builder.mutation({
      query: (token) => ({
        url: '/api/auth/verify-email',
        method: 'POST',
        body: { token },
      }),
      transformResponse: (response) => response.data,
    }),
    resendVerification: builder.mutation({
      query: () => ({ url: '/api/auth/resend-verification', method: 'POST' }),
    }),
    getSessions: builder.query({
      query: () => '/api/auth/sessions',
      transformResponse: (response) => response.data.sessions,
      providesTags: ['Sessions'],
    }),
    revokeSession: builder.mutation({
      query: (familyId) => ({
        url: `/api/auth/sessions/${familyId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Sessions'],
    }),
    logoutOtherSessions: builder.mutation({
      query: () => ({ url: '/api/auth/logout-others', method: 'POST' }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['Sessions'],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetMeQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useGetSessionsQuery,
  useRevokeSessionMutation,
  useLogoutOtherSessionsMutation,
} = authApi;
