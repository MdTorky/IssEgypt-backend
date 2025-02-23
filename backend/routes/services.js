const express = require('express');
const {
    getAll,
    getItem,
    createItem,
    deleteItem,
    updateItem,
    getItemByLink
} = require("../controllers/servicesController")

const router = express.Router()


router.get('/', getAll)
router.get('/:id', getItem)
router.get('/service/:link', getItemByLink)
router.post('/', createItem)
router.delete('/:id', deleteItem)
router.patch('/:id', updateItem)

module.exports = router