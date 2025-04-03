const express = require('express')
const app = express()
const cors = require('cors')
const dotenv = require('dotenv')

dotenv.config()

app.use(cors())
app.use(express.json())


app.get('/', (req, res) =>{
    res.send('Hello world')
})

