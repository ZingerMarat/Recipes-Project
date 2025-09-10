import db from "./models/index.js"

export async function connectDB() {
  try {
    await db.sequelize.authenticate()
    console.log("✅ PostgreSQL connected")
  } catch (error) {
    console.error("❌ PostgreSQL connection error:", error)
  }
}
