// Login User

const loginUser = async (req, res) => {
    res.json({ mssg: "Login User" })
}


// Register User

const registerUser = async (req, res) => {
    res.json({ mssg: "Register User" })
}


module.exports = {
    loginUser,
    registerUser
}