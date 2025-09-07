require("dotenv").config()

module.exports = {
  development: {
    use_env_variable: "DB_CONNECTION_MYSQL",
    dialect: "mysql",
  },
  test: {
    use_env_variable: "DB_CONNECTION",
    dialect: "mysql",
  },
  production: {
    use_env_variable: "DB_CONNECTION",
    dialect: "postgres",
  },
}
