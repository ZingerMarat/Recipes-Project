import mongoose from "mongoose"

const aiInteractionSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    sessionId: { type: String, required: true },
    interactions: [
      {
        type: { type: String, enum: ["suggestion", "substitution", "weather"], required: true },
        query: { type: String, required: true },
        response: { type: String, required: true },
        context: { type: Object, default: {} },
        timestamp: { type: Date, default: Date.now },
        helpful: { type: Boolean, default: null },
      },
    ],
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
)

const AIInteraction = mongoose.model("AIInteraction", aiInteractionSchema)
export default AIInteraction
