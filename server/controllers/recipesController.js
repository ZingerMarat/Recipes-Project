import { v4 as uuidv4 } from "uuid"
import { readRecipes, writeRecipes } from "../utils/fileHelpers.js"

const filterRecipes = (recipes, query) => {
  const { difficulty, maxCookingTime, search } = query
  const maxTime = Number(maxCookingTime)

  const filtered = recipes.filter((r) => {
    const matchesDifficulty = difficulty ? difficulty.split(" ").includes(r.difficulty) : true

    const matchesTime =
      maxCookingTime && !isNaN(maxTime) ? r.cookingTime <= Number(maxCookingTime) : true

    const matchesSearch = search
      ? search
          .split(" ")
          .some(
            (searchWord) =>
              r.title.toLowerCase().includes(searchWord.toLowerCase()) ||
              r.description.toLowerCase().includes(searchWord.toLowerCase())
          )
      : true

    return matchesDifficulty && matchesSearch && matchesTime
  })

  return filtered
}

const sortRecipes = (recipes, query) => {
  const { sort, order = "asc" } = query

  const sortKeys = {
    rating: (r) => r.rating,
    cookingTime: (r) => r.cookingTime,
    date: (r) => new Date(r.createdAt).getTime(),
  }

  const getValue = sortKeys[sort]
  if (!getValue) return recipes

  return [...recipes].sort((a, b) => {
    const aVal = getValue(a)
    const bVal = getValue(b)
    return order === "desc" ? bVal - aVal : aVal - bVal
  })
}

export const getAllRecipes = async (req, res, next) => {
  //GET /recipes?difficulty=easy%20medium&maxCookingTime=30&search=pasta%20tomato&sort=rating&order=desc
  try {
    const recipes = await readRecipes()

    const filteredRecipes = filterRecipes(recipes, req.query)

    if (!filteredRecipes.length) {
      return res.status(404).json({ message: "No recipes found" })
    }

    const sortedRecipes = sortRecipes(filteredRecipes, req.query)

    res.status(200).json(sortedRecipes)
  } catch (err) {
    next(err)
  }
}

export const getRecipe = async (req, res, next) => {
  //GET /recipes/:id
  const id = req.params.id

  try {
    const recipes = await readRecipes()
    const recipe = recipes.find((r) => r.id === id)

    if (!recipe) {
      return res.status(404).json({ message: "No recipe found with the same id" })
    }

    res.status(200).json(recipe)
  } catch (err) {
    next(err)
  }
}

export const addRecipe = async (req, res, next) => {
  //POST /recipes/
  const newRecipe = req.body
  const id = uuidv4()
  const createdAt = new Date().toISOString()

  try {
    const recipes = await readRecipes()

    const recipe = { id, ...newRecipe, createdAt }
    recipes.push(recipe)

    await writeRecipes(recipes)

    res.status(201).json(recipe)
  } catch (err) {
    next(err)
  }
}

export const updateRecipe = async (req, res, next) => {
  //PUT /recipes/:id
  const id = req.params.id
  const update = req.body

  try {
    const recipes = await readRecipes()

    const index = recipes.findIndex((r) => r.id === id)

    if (index === -1) {
      return res.status(404).json({ message: "Recipe not found" })
    }

    recipes[index] = { ...recipes[index], ...update }

    await writeRecipes(recipes)

    res.status(200).json(recipes[index])
  } catch (err) {
    next(err)
  }
}

export const deleteRecipe = async (req, res, next) => {
  const id = req.params.id

  try {
    const recipes = await readRecipes()

    const index = recipes.findIndex((r) => r.id === id)

    if (index === -1) {
      return res.status(404).json({ message: "Recipe not found" })
    }

    recipes.splice(index, 1)

    await writeRecipes(recipes)

    res.status(204).end()
  } catch (err) {
    next(err)
  }
}

const createStats = (recipes) => {
  let totalNumber = 0
  let avgCookingTime = 0
  let recByDifficulty = { easy: [], hard: [], medium: [] }
  let mostCommonIng = []

  totalNumber = recipes.length

  avgCookingTime = recipes.reduce((sum, r) => (sum += r.cookingTime), 0) / totalNumber

  recByDifficulty.easy = recipes.filter((r) => r.difficulty === "easy").map((r) => r.id)
  recByDifficulty.hard = recipes.filter((r) => r.difficulty === "hard").map((r) => r.id)
  recByDifficulty.medium = recipes.filter((r) => r.difficulty === "medium").map((r) => r.id)

  let allIng = []
  for (let r of recipes) {
    allIng.push(...r.ingredients)
  }

  const ingMap = new Map()
  for (let ing of allIng) {
    ingMap.set(ing, (ingMap.get(ing) || 0) + 1)
  }

  const ingObj = Object.fromEntries(ingMap)
  const ingArr = Object.entries(ingObj).map(([key, value]) => ({
    ingredient: key,
    count: value,
  }))
  const sortedIngArr = ingArr.sort((a, b) => b.count - a.count)
  mostCommonIng = sortedIngArr.slice(0, 10).map((ing) => ing.ingredient)

  return { totalNumber, avgCookingTime, recByDifficulty, mostCommonIng }
}

export const getStats = async (req, res, next) => {
  try {
    const recipes = await readRecipes()
    const stats = createStats(recipes)

    res.status(200).json(stats)
  } catch (err) {
    next(err)
  }
}

export const updateRating = async (req, res, next) => {
  const { id, rating } = req.params
  const newRating = Number(rating)

  try {
    if (isNaN(newRating) || newRating < 0 || newRating > 5) {
      return res.status(400).json({ message: "Rating must be a number between 0 and 5" })
    }

    const recipes = await readRecipes()
    const recipe = recipes.find((r) => r.id === id)

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" })
    }

    recipe.rating = newRating
    await writeRecipes(recipes)

    res.status(200).json(recipe)
  } catch (err) {
    next(err)
  }
}
