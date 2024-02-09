const express = require('express');

// Controller

const { loginUser, registerUser } = require('../controllers/userController')


const router = express.Router();


//Login Route

router.post('/login', loginUser)


// Register Route
router.post('/register', registerUser)

module.exports = router