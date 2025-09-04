import { DataTypes } from "sequelize"

export default (sequelize) => {
  const Recipe = sequelize.define(
    "Recipe",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      title: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      ingredients: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      instructions: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      cookingTime: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      servings: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      difficulty: {
        type: DataTypes.ENUM("easy", "medium", "hard"),
        allowNull: true,
      },
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isPublic: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
    },
    {
      tableName: "recipes",
      timestamps: true,
      underscored: false,
    }
  )

  return Recipe
}
