const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const validator = require('validator')
const Schema = mongoose.Schema


const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    committee: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        required: true,
    }
})


// static register method
userSchema.statics.register = async function (email, password, committee, type) {

    //validation
    if (!email || !password || !committee) {
        throw Error("All fields must be filled")
    }

    if (!validator.isEmail(email)) {
        throw Error("Email is not valid")
    }

    if (!validator.isStrongPassword(password)) {
        throw Error("Password is not strong enough")
    }

    const emailExists = await this.findOne({ email })

    const committeeExists = await this.findOne({ committee })

    // const userNameExists = await this.findOne({ userName })

    if (emailExists) {
        throw Error('Email already in use')
    }

    if (committeeExists) {
        throw Error('This Committee President already has an account')
    }
    // if (userNameExists) {
    //     throw Error('UserName already in use')
    // }

    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    const user = await this.create({ email, password: hash, committee, type })

    return user

}


// static Login Method

userSchema.statics.login = async function (email, password) {

    if (!email || !password) {
        throw Error("All fields must be filled")
    }

    const user = await this.findOne({ email })

    if (!user) {
        throw Error('Incorrect Email')
    }

    const match = await bcrypt.compare(password, user.password)

    if (!match) {
        throw Error('Incorrect Password')
    }

    return user

}

module.exports = mongoose.model('User', userSchema)