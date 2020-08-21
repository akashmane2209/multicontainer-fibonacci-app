const keys = require('./keys');

//Express Setup
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express();

app.use(bodyParser.json());
app.use(cors())

//postgres client setup
const { Pool } = require('pg');
const pgClient = new Pool({
    port: keys.pgPort,
    host: keys.pgHost,
    user: keys.pgUser,
    password: keys.pgPassword,
    database: keys.pgDatabase
})
pgClient.on('error', () => console.log('Lost PG Connection'))
pgClient.query('CREATE TABLE IF NOT EXISTS values (number INT)').catch(err => console.log(err))

//redis client setup

const redis = require('redis');
const redisClient = redis.createClient({
    port: keys.redisPort,
    host: keys.redisHost,
    retry_strategy: () => 1000
})

const redisPublisher = redisClient.duplicate()

//routes
app.get('/', (req, res) => {
    res.send('Server up')
})

app.get('/values/all', async (req, res) => {
    try {
        const values = await pgClient.query('SELECT * from values');
        res.send(values.rows())
    } catch (error) {
        res.status(400).json({ error });
        console.log(error)
    }
})

app.get('/values/current', async (req, res) => {
    try {
        redisClient.hgetall('values', (err, values) => {
            res.send(values)
        })
    } catch (error) {
        res.status(400).json({ error });
        console.log(error)
    }
})


app.post('/values', async (req, res) => {
    const { index } = req.body
    if (parseInt(index) > 40) {
        return res.status(422).send('Index too high')
    }
    redisClient.hset('values', index, 'Nothing yet')
    redisPublisher.publish('insert', index);
    pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);
    res.send({ working: true })
})

app.listen(5000, () => {
    console.log('Server started at port 5000')
}) 