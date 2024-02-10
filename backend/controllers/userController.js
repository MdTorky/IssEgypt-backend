const User = require('../models/userModel')
const jwt = require('jsonwebtoken')


const createToken = (_id) => {
    return jwt.sign({ _id }, process.env.SECRET, { expiresIn: '3d' })
}


// Login User

const loginUser = async (req, res) => {
    const { email, password } = req.body

    try {
        const user = await User.login(email, password)

        // Create a token
        const token = createToken(user._id)
        const committee = user.committee
        const type = user.type

        res.status(200).json({ email, token, committee, type })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}


// Register User

const registerUser = async (req, res) => {

    const { email, password, committee, type } = req.body

    try {
        const user = await User.register(email, password, committee, type)

        // Create a token
        const token = createToken(user._id)
        // const committee = user.committee
        // const type = user.type

        res.status(200).json({ email, token, committee, type })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}


module.exports = {
    loginUser,
    registerUser
}