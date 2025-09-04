import db from "../db/models/index.js"
const { Recipe } = db

export const checkRecipeOwnership = async (req, res, next) => {
  const userId = req.userID
  const recipeId = req.params.id

  const recipe = await Recipe.findByPk(recipeId)

  if (!recipe) {
    return res.status(404).json({ message: "Recipe not found" })
  }

  const plainRecipe = recipe.get({ plain: true })

  if (plainRecipe.userId !== userId) {
    return res.status(403).json({ message: "You are not authorized to update this recipe" })
  }

  req.plainRecipe = plainRecipe
  next()
}
