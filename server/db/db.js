import db from "./models/index.js"

export async function connectDB() {
  try {
    await db.sequelize.authenticate()
    console.log("✅ Database connection has been established successfully.")
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error)
  }
}
