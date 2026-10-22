# AI Voice Studio backend

Fastify 5 + MongoDB (Mongoose) API for the AI Voice Studio client. Every paid AI action is a `Generation` that holds credits first, then settles or refunds them. Credit rates are set by an admin per AI model and capability.

## Setup

1. **MongoDB as a replica set** (credit changes use transactions). Locally, start `mongod` with a replica set name once:
   ```
   mongod --dbpath <data-folder> --port 27017 --replSet rs0
   ```
   then in `mongosh`: `rs.initiate()`. MongoDB Atlas works out of the box.
2. `cp .env.example .env` and fill in `MONGODB_URI`, `JWT_ACCESS_SECRET` (32+ chars), the Cloudflare R2 values and `OPENAI_API_KEY`. `BREVO_API_KEY` is optional; without it emails are written to the log in development.
3. `npm install`
4. `npm run db:seed` creates platform settings, the OpenAI provider, models with default rates and the voices. It only inserts what is missing, so admin edits survive a re-run.
5. `npm run dev`, register an account, then `npm run admin:promote -- you@example.com`.

## Scripts

| Script                             | What it does                                                                                                                         |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `npm run dev`                      | API with file watching on `PORT` (8000)                                                                                              |
| `npm test`                         | All tests against `TEST_MONGODB_URI` (default `mongodb://127.0.0.1:27018/ai_voice_studio_test?replicaSet=rs0&directConnection=true`) |
| `npm run db:seed`                  | Seed settings, provider, models and voices                                                                                           |
| `npm run admin:promote -- <email>` | Make a user an admin                                                                                                                 |
| `npm run lint` / `npm run format`  | ESLint / Prettier                                                                                                                    |

## Default rates (admin can change them)

| Capability             | Model                 | Unit               | Credits |
| ---------------------- | --------------------- | ------------------ | ------- |
| Text to Speech         | gpt-realtime-2.1-mini | per 100 characters | 1       |
| Speech to Text         | gpt-transcribe        | per minute         | 1       |
| Real-time conversation | gpt-realtime-2.1-mini | per minute         | 3       |
| Voice agent session    | gpt-realtime-2.1-mini | per minute         | 3       |
| Agent test chat        | gpt-5-nano            | per message        | 1       |

New accounts get `signupCredits` (50) once. There are no subscriptions or payments.

## API map

| Prefix                                          | Module                                                                                            | Who                |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------ |
| `/health`                                       | health                                                                                            | anyone             |
| `/api/auth`                                     | auth: register, login, refresh, logout, me, sessions, forgot/reset password, verify email         | anyone / logged in |
| `/api/me`, `/api/me/settings`                   | users, user-settings                                                                              | logged in          |
| `/api/platform`                                 | public settings and current rates                                                                 | anyone             |
| `/api/wallet`, `/api/usage`, `/api/generations` | credit-wallets, usage, generations                                                                | logged in          |
| `/api/voices`                                   | enabled voices                                                                                    | logged in          |
| `/api/speech`                                   | text to speech, voice previews                                                                    | logged in          |
| `/api/audio-files`                              | audio library                                                                                     | logged in          |
| `/api/transcriptions`                           | speech to text                                                                                    | logged in          |
| `/api/realtime`                                 | real-time sessions (ephemeral OpenAI keys)                                                        | logged in          |
| `/api/agents`                                   | voice agents, test chat, analytics                                                                | logged in          |
| `/api/admin/*`                                  | users, wallets, providers, models and rates, voices, settings, generations, audit logs, analytics | admin              |

Not built because OpenAI does not offer them: voice cloning, voice transformation, audio enhancement.
