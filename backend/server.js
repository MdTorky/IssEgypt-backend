require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const formRoutes = require('./routes/forms')

// express app
const app = express()


app.use(express.json())

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next()
})

// routes
app.use('/api/forms', formRoutes)

// connect to db
mongoose.connect(process.env.MONGO_URI, {

})
    .then(() => {
        console.log('connected to database')
        // listen to port
        app.listen(process.env.PORT, () => {
            console.log('listening for requests on port', process.env.PORT)
        })
    })
    .catch((err) => {
        console.log(err)
    }) 