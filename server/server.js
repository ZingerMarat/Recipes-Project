import express from "express"
import authRouter from "./routes/authRouter.js"
import recipesRouter from "./routes/recipesRouter.js"
import favoritesRouter from "./routes/favoritesRouter.js"
import morgan from "morgan"
import { rateLimit } from "./middleware/rateLimit.js"
import { connectDB } from "./db/db.js"
//import cookieParser from "cookie-parser"

const PORT = 3000
morgan.token("timestamp", () => new Date().toISOString())

const app = express()
connectDB()

//app.use(cors({ origin: "http://localhost:5173", credentials: true })) // for local development
//app.use(cors({ origin: "https://your-production-domain.com", credentials: true })) // for production

//app.use(cookieParser("mySecretKey"))

app.use(express.json())
app.use(express.static("public"))

app.use(morgan(":method :url :status - :response-time ms [:timestamp]"))

app.use(rateLimit(10, 60 * 1000)) //rate limit 10 req on 1 minute

app.use("/api/auth", authRouter)
app.use("/api/recipes", recipesRouter)
app.use("/api/users/favorites", favoritesRouter)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

// Error Handling Middleware
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    error: true,
    message: err.message || "Server Error",
    statuCode: err.status || 500,
  })
})
