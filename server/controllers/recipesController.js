import { v4 as uuidv4 } from "uuid"
import { readRecipes, writeRecipes } from "../utils/fileHelpers.js"

export const getAllRecipes = async (req, res, next) => {
  //GET /recipes?difficulty=easy&maxCookingTime=30&search=pasta
  const { difficulty, maxCookingTime, search } = req.query

  try {
    const recipes = await readRecipes()

    const filteredRecipes = recipes.filter((r) => {
      const matchesDifficulty = difficulty ? r.difficulty === difficulty : true
      const matchesTime = maxCookingTime ? r.cookingTime <= Number(maxCookingTime) : true
      const matchesSearch = search
        ? r.title.toLowerCase().includes(search.toLowerCase()) ||
          r.description.toLowerCase().includes(search.toLowerCase())
        : true

      return matchesDifficulty && matchesSearch && matchesTime
    })

    if (!filteredRecipes.length) {
      return res.status(404).json({ message: "No recipes found" })
    }

    res.status(200).json(filteredRecipes)
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
