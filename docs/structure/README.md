# Project Directory Guide

Hey team,

This is the official guide for our project's directory structure. Please follow this so we all know where to find and put our files.

---

## Root Directory

This is the main folder.

```
/
├── node_modules/     # (Ignored) All our installed `pnpm` packages. Don't touch.
├── prisma/           # **DATABASE STUFF HERE**
│   ├── schema.prisma   # Our single source of truth for the database schema.
│   └── migrations/     # (Auto-generated) Database version history.
├── src/              # **ALL OUR CODE GOES HERE**
├── .env              # (Ignored) **NEVER PUSH THIS.** This has your local database password.
├── .env.example      # A template showing what's needed in `.env`.
├── .gitignore        # Tells Git what to ignore (like `.env`).
├── package.json      # Our project's dependencies and scripts.
├── pnpm-lock.yaml    # Locks our dependency versions.
└── tsconfig.json     # TypeScript settings.
```

---

## The `src/` Directory

This is where we'll be working. Here's the breakdown of what goes where.

```
src/
├── config/           # Holds our shared Prisma client.
├── controllers/      # Handles HTTP requests and sends responses.
├── middlewares/      # For checking things (like auth) before the controller runs.
├── routes/           # Defines all our API endpoints.
├── services/         # Contains all business logic and database calls.
└── index.ts          # Starts the server and connects everything.
```

### `src/config/`

-   **Purpose:** For shared configuration files.
-   **What to put here:** We'll have `prisma.ts`.
-   **Why:** This file creates _one_ Prisma Client instance so we can import `prisma` from this single file anywhere we need to talk to the database.

### `src/routes/`

-   **Purpose:** To define all our API's URLs (endpoints).
-   **What to put here:** `transaction.routes.ts`, `genre.routes.ts`, `auth.routes.ts`, etc. We'll also have an `index.ts` to combine all these smaller route files.
-   **How it works:** A route file maps a URL to a Controller function.
    -   **Example:** `router.post('/transactions', transactionController.createTransaction)`

### `src/controllers/`

-   **Purpose:** To act as the "traffic cop." It handles the `request` and `response` of an API call.
-   **What to put here:** `transaction.controller.ts`, `genre.controller.ts`, etc.
-   **Job:**
    1.  Get the request (`req`) from Express.
    2.  Do basic checks (e.g., `req.body` isn't empty).
    3.  Call a **Service function** to do the heavy lifting.
    4.  Get the result from the service and send the response (e.g., `res.json(...)` or `res.status(400).send(...)`).
-   **STRICT RULE:** Controllers **DO NOT** talk to Prisma directly. They _must_ call a Service.

### `src/services/`

-   **Purpose:** This is the "brain" of our app. All our business logic and database logic lives here.
-   **What to put here:** `transaction.service.ts`, `genre.service.ts`, etc.
-   **Job:**
    1.  Get called by a Controller.
    2.  Handle all logic (e.g., "Check if books are in stock," "Calculate total price").
    3.  Use `prisma` to read from or write to the database (e.g., `prisma.transaction.create(...)`).
    4.  Return the data (or an error) to the controller.
-   **STRICT RULE:** Services **DO NOT** know about `req` or `res`. They are just functions that take arguments (like `userId`) and return data.

### `src/middlewares/`

-   **Purpose:** A "security checkpoint" that runs _before_ a controller function.
-   **What to put here:** `auth.middleware.ts` (This is for Member B).
-   **Job:**
    1.  Check for the auth token.
    2.  If the token is valid, attach the user to `req` and call `next()`.
    3.  If it's invalid, send a `401 Unauthorized` error.

### `src/index.ts`

-   **Purpose:** The main entry point that starts our server.
-   **Job:**
    1.  Create the Express app.
    2.  Apply global middlewares (like `express.json()`).
    3.  Load the main router from `src/routes/`.
    4.  Connect to the database.
    5.  Listen on our `PORT`.
