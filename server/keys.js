const { redisPort } = require("../worker/keys")

module.exports = {
    redisHost: process.env.REDIS_HOST,
    redisPort: process.env.REDIS_HOST,
    pgUser: process.env.PGUSER,
    pgPassword: process.env.PGPASSWORD,
    pgPort: process.env.PGPORT,
    pgHost: process.env.PGHOST,
    pgDatabase: process.env.PGDATABASE
}