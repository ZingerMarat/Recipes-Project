import RecipeCollection from "../mongoDB/models/recipeCollectionSchema.js"
import db from "../db/models/index.js"
const { Recipe } = db

export const addCollection = async (req, res, next) => {
  try {
    const userId = req.userID
    const title = req.body.title
    const description = req.body.description
    const recipeIds = req.body.recipeIds
    const recipes = []

    for (const id of recipeIds) {
      const recipe = await Recipe.findByPk(id)
      if (!recipe) {
        return res.status(404).json({ message: "No recipe found with this id" })
      }

      recipes.push({
        recipeId: id,
        recipeTitle: recipe.title,
      })
    }

    const data = {
      userId,
      title,
      description,
      recipes,
    }

    const newCollection = new RecipeCollection(data)
    await newCollection.save()

    res.status(201).json(newCollection)
  } catch (err) {
    next(err)
  }
}
