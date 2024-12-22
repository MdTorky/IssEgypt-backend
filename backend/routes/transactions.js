const express = require('express');
const {
    getAll,
    getItem,
    createItem,
    deleteItem,
    updateItem,
    getItemByReference,
    updateAllTransactionStatus
} = require("../controllers/transactionsController")

const router = express.Router()


// require auth for all routes


// Get All
router.get('/', getAll)


// Get Single
router.get('/:id', getItem)

router.get('/t/:referenceNumber', getItemByReference)


//Insert Product
router.post('/', createItem)


//Delete Product
router.delete('/:id', deleteItem)

//Update Product
router.patch('/:id', updateItem)
router.patch('/t/updateAll', updateAllTransactionStatus)

module.exports = router