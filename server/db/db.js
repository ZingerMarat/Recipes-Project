import { Sequelize } from "sequelize"

const sequelize = new Sequelize("mysql://root:1234@localhost/recipes_project")

const connectDB = async () => {
  try {
    await sequelize.authenticate()
    console.log("Connection has been established successfully.")
  } catch (error) {
    console.error("Unable to connect to the database:", error)
  }
}

export { sequelize, connectDB }
