const express = require('express');
const {
    getAll,
    getItem,
    getItemByService,
    createItem,
    deleteItem,
    updateItem,
} = require("../controllers/helpingController")

const router = express.Router()


router.get('/', getAll)
router.get('/:id', getItem)
router.get('/service/:service', getItemByService)
router.post('/', createItem)
router.delete('/:id', deleteItem)
router.patch('/:id', updateItem)

module.exports = router