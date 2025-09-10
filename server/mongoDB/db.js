import mongoose from "mongoose"

const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.DB_CONNECTION_MONGO)

    console.log("✅ MongoDB connected")
  } catch (err) {
    console.error("❌ MongoDB connection error:", err)
    process.exit(1)
  }
}

export default connectMongoDB
