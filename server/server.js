import express from "express"
import recipesRouter from "./routes/recipesRouter.js"

const PORT = 3000

const app = express()
app.use(express.json())

app.use("/api/recipes", recipesRouter)

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
