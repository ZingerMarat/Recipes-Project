# Recipes Project — API (Server)

Overview

- This is a REST API for a recipes application: users can register, add recipes with images, comment, like comments, create collections, and mark recipes as favorites.
- Server is built with Node.js and Express. Sequelize (relational DB) is used for core entities (users, recipes, favorites). MongoDB is used for flexible entities (comments, collections).
- AI features are implemented using Google Gemini via the `@google/genai` package (see the AI / Gemini section).

Key server structure (important files/folders)

- `server.js` — entry point, DB connections, middlewares and route registration.
- `routes/` — API routes:
  - `authRouter.js` — register, login, profile
  - `recipesRouter.js` — recipes CRUD, comments
  - `favoritesRouter.js` — favorites
  - `commentsRouter.js` — edit comments, likes
  - `collectionsRouter.js` — recipe collections
  - `aiRouter.js` — AI endpoints (Gemini)
- `controllers/` — route handlers and business logic
- `db/` — Sequelize config and models
- `mongoDB/` — MongoDB connection and schemas (comments, collections, etc.)
- `public/uploads/recipes` — uploaded images storage
- `middleware/` — auth, validation, upload, rate-limit

Environment variables

Create a `.env` file inside the `server` folder with at least:

- `PORT` — port (Render sets this automatically)
- `DATABASE_URL` or Sequelize config entries (see `db/config`)
- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — JWT secret
- `GOOGLE_GEMINI_API_KEY` — API key for Google Gemini (used by `@google/genai`)

Local install and run

```bash
cd server
npm install
# create .env from the example
npm start
```

API — endpoints

All routes are mounted under the `/api` prefix (see `server.js`).

1. Auth

- POST /api/auth/register

  - Description: Register a new user
  - Body (JSON): { username, email, password, firstName, lastName }
  - Response: 201 + user + token

- POST /api/auth/login

  - Description: Login
  - Body (JSON): { email, password }
  - Response: 200 + user + token

- GET /api/auth/profile
  - Description: Get current user profile
  - Headers: Authorization: Bearer <token>
  - Response: 200 + user

2. Recipes

- GET /api/recipes

  - Description: Get list of recipes
  - Query params (optional): difficulty, maxCookingTime, search, sort, order
  - Response: 200 + array of recipes

- GET /api/recipes/:id

  - Description: Get a recipe by id
  - Response: 200 + recipe object

- GET /api/recipes/my-recipes

  - Description: Get recipes created by the current user
  - Protected: requires Authorization

- POST /api/recipes

  - Description: Create a new recipe (Protected)
  - Requires: Authorization header
  - Content-Type: multipart/form-data
  - Fields: title, description, ingredients, instructions, cookingTime, servings, difficulty, isPublic
  - File: field `image` — uploaded image
  - Response: 201 + created recipe

- PUT /api/recipes/:id

  - Description: Update a recipe (Protected, owner check)
  - Content-Type: multipart/form-data (image optional)
  - Response: 200 + updated recipe

- DELETE /api/recipes/:id
  - Description: Delete a recipe (Protected, owner check)
  - Response: 200 + { message }

3. Comments

- POST /api/recipes/:id/comments

  - Description: Add a comment to a recipe (Protected)
  - Body (JSON): { comment, rating }
  - Response: 201 + created comment (MongoDB)

- GET /api/recipes/:id/comments

  - Description: Get comments for a recipe (paginated)
  - Query: page, limit
  - Response: 200 + { comments, page, limit, total, rating }

- POST /api/comments/:commentId/like

  - Description: Toggle like on a comment (Protected)
  - Response: 200 + updated comment

- PUT /api/comments/:commentId
  - Description: Edit a comment (Protected)
  - Body: { comment, rating }
  - Response: 200 + updated comment

4. Favorites

- POST /api/users/favorites/:recipeId (Protected) — add a recipe to favorites
- DELETE /api/users/favorites/:recipeId (Protected) — remove from favorites
- GET /api/users/favorites (Protected) — get favorites for current user

5. Collections

- GET /api/collections (Protected) — get user collections and public collections
- POST /api/collections (Protected) — create a collection: { title, description, recipeIds }
- POST /api/collections/:id/recipes (Protected) — add a recipe to a collection: { recipeId, notes }

6. AI / Gemini

AI endpoints are under `/api/ai`:

- POST /api/ai/recipe-suggestions

  - Protected: requires Authorization: Bearer <token>
  - Body (JSON): { ingredients, dietary_restrictions, cuisine_preference, cooking_time }
  - Behavior: Builds a prompt and sends it to Google Gemini via `@google/genai` using model `gemini-2.0-flash`.
  - Expected response: JSON following the configured schema, for example:
    { suggestions: [ { title, ingredients:[], instructions:[], confidence } ] }

- POST /api/ai/ingredient-substitutions
  - Protected
  - Body (JSON): { recipe_id, substitute_ingredient, dietary_need }
  - Behavior: Loads the recipe from the DB, builds a prompt and requests 3 substitution suggestions from Gemini.
  - Expected response: { substitutions: [ { substitute, ratio, notes } ] }

Notes about AI / Gemini integration

- Library: `@google/genai` (see `controllers/aiController.js` import `GoogleGenAI, Type`).
- An API key `GOOGLE_GEMINI_API_KEY` must be provided in `.env` to call Gemini.
- The controller configures a `responseSchema` to request structured JSON from the model and parses the model text as JSON.

Notes and implementation details

- Authentication: JWT-based. Middleware `middleware/auth.js` sets `req.userID` and `req.username`.
- Uploads: `middleware/upload.js` stores files in `public/uploads/recipes`.
- Recipe validation: `middleware/validateRecipeMiddleware.js` uses AJV with `models/recipeSchema.js`.
- Rate limiting: `middleware/rateLimit.js` — default 10 requests per minute.
- MongoDB is used for flexible-scheme entities (comments, collections). Sequelize is used for users, recipes, favorites.

Deployment on Render — quick notes

- Render sets the `PORT` environment variable — `server.js` already uses `process.env.PORT || 8080`.
- The `start` script in `package.json` currently uses `node --watch server.js` which is useful for development. For production on Render you may prefer `node server.js`.
- Minimal steps to deploy:

```bash
# push your repo
git push origin main
# in Render create a Web Service, set the root to `server/`, set build and start commands (if needed) and use `npm start` as the start command
# add environment variables: MONGO_URI, DATABASE_URL, JWT_SECRET, GOOGLE_GEMINI_API_KEY
```

Examples (curl) using the live server

- Register:

```bash
curl -X POST https://recipes-project-zjy7.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john","email":"john@example.com","password":"pass","firstName":"John","lastName":"Doe"}'
```

- AI recipe suggestions:

```bash
curl -X POST https://recipes-project-zjy7.onrender.com/api/ai/recipe-suggestions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"ingredients":"tomato, pasta, basil","dietary_restrictions":"none","cuisine_preference":"Italian","cooking_time":30}'
```
