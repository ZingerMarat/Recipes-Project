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

export const getCollections = async (req, res, next) => {
  try {
    const userId = req.userID

    const collections = await RecipeCollection.find({ $or: [{ userId }, { isPublic: true }] })

    if (!collections.length) {
      return res.status(404).json({ message: "No collection found" })
    }

    res.status(200).json(collections)
  } catch (err) {
    next(err)
  }
}

export const addToCollection = async (req, res, next) => {
  try {
    const collectionId = req.params.id
    const { recipeId, notes } = req.body

    const exists = await RecipeCollection.findOne({
      _id: collectionId,
      "recipes.recipeId": recipeId,
    })

    if (exists) return res.status(400).json({ message: "Recipe already in collection" })

    const recipe = await Recipe.findByPk(recipeId)
    if (!recipe) {
      return res.status(404).json({ message: "No recipe found with this id" })
    }

    const recipeTitle = recipe.title

    const addedRecipe = await RecipeCollection.findByIdAndUpdate(
      collectionId,
      {
        $addToSet: {
          recipes: { recipeId, recipeTitle, notes },
        },
      },
      { new: true }
    )

    res.status(201).json(addedRecipe)
  } catch (err) {
    next(err)
  }
}
