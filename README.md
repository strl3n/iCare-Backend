# iCare Backend

Backend API for **iCare**, a mental health tracking and suicide prevention
mobile application, built with Node.js, Express, and MongoDB, and deployed
as a serverless application on Vercel.

## Background

Suicide remains one of the leading causes of death worldwide, and
adolescents and young adults are among the groups most at risk. According
to the World Health Organization, suicide is the third leading cause of
death among 15–29-year-olds globally, and many cases go unnoticed until it
is too late — often because early warning signs are missed, mental health
support is hard to access, or there is stigma around asking for help.

This backend service powers the iCare Android application, handling user
authentication, mood tracking data, and supportive content delivery. It is
developed in direct alignment with **UN Sustainable Development Goal
3.2.4**, which targets the reduction of the global suicide mortality rate,
by supporting an app designed to help users build healthier emotional
awareness habits.

## Tech Stack

- **Node.js** + **Express.js** — REST API framework
- **MongoDB Atlas** + **Mongoose** — database and ODM
- **JWT (jsonwebtoken)** — authentication
- **bcryptjs** — password hashing
- **express-validator** — request validation
- **Axios** — outbound requests to third-party APIs (RapidAPI quotes)
- **Vercel** — serverless deployment

## Project Structure

```
├── config/
│   └── database.js          # MongoDB connection (with serverless connection caching)
├── src/
│   ├── controllers/
│   │   ├── authController.js
│   │   └── moodController.js
│   ├── middlewares/
│   │   └── auth.js          # JWT verification middleware
│   ├── models/
│   │   ├── User.js
│   │   └── Mood.js
│   └── routes/
│       ├── authRoute.js
│       └── moodRoute.js
├── server.js                 # App entry point / Vercel handler
└── .env                       # Environment variables (not committed)
```

## Environment Variables

Create a `.env` file locally (and configure the same values in **Vercel →
Project Settings → Environment Variables** for production):

```
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
RAPIDAPI_KEY=your_rapidapi_key
PORT=3000
```

## API Endpoints

### Auth

| Method | Endpoint             | Description                     | Auth required |
|--------|----------------------|----------------------------------|:---:|
| POST   | `/api/auth/register` | Register a new user              | ❌ |
| POST   | `/api/auth/login`    | Login with email & password      | ❌ |
| POST   | `/api/auth/google`   | Login/register via Google account| ❌ |
| GET    | `/api/auth/me`       | Get current logged-in user       | ✅ |

### Mood

| Method | Endpoint            | Description                          | Auth required |
|--------|----------------------|--------------------------------------|:---:|
| POST   | `/api/mood`          | Save a new mood entry                | ✅ |
| GET    | `/api/mood/history`  | Get mood history (optional `filter=week`/`month`) | ✅ |
| GET    | `/api/mood/stats`    | Get mood statistics (average, highest, lowest, weekly average) | ✅ |
| DELETE | `/api/mood/:id`      | Delete a mood entry                  | ✅ |

### Content

| Method | Endpoint      | Description                                 | Auth required |
|--------|---------------|----------------------------------------------|:---:|
| GET    | `/api/quote`  | Get a random uplifting quote (via RapidAPI, with local fallback) | ❌ |

### Misc

| Method | Endpoint  | Description                          |
|--------|-----------|---------------------------------------|
| GET    | `/health` | Health check (server + MongoDB status) |

All authenticated endpoints require an `Authorization: Bearer <token>`
header, using the JWT token returned from login/register.

## Running Locally

```bash
npm install
npm start
```

The server will run at `http://localhost:3000` (or the port set in `PORT`).

## Deployment

This backend is deployed on **Vercel** as a serverless function. `server.js`
exports the Express app (`module.exports = app`), and MongoDB connections
are cached across invocations to avoid exhausting connection limits in a
serverless environment.

Make sure environment variables are configured in the Vercel dashboard
(not just in a local `.env` file, since `.env` is gitignored and never
gets deployed).

## Related Repositories

- Android client: [iCare-MDP](https://github.com/strl3n/iCare-MDP)
