import mongoose from "mongoose"

const recipeCollectionSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    recipes: [
      {
        recipeId: { type: String, required: true },
        recipeTitle: { type: String, required: true },
        addedAt: { type: Date, default: Date.now },
        notes: { type: String, default: "" },
      },
    ],
    isPublic: { type: Boolean, default: true },
    tags: { type: [String], default: [] },
  },
  {
    timestamp: true,
  }
)

const RecipeCollection = mongoose.model("RecipeCollection", recipeCollectionSchema)

export default RecipeCollection
