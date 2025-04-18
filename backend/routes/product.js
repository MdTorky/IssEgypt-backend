const express = require('express');
const {
    getAll,
    getItem,
    createItem,
    deleteItem,
    updateItem,
    updateProductInventory
} = require("../controllers/productController")

const router = express.Router()


// require auth for all routes


// Get All
router.get('/', getAll)


// Get Single
router.get('/:id', getItem)



//Insert Product
router.post('/', createItem)


//Delete Product
router.delete('/:id', deleteItem)

//Update Product
router.patch('/:id', updateItem)
router.post('/inventory', updateProductInventory)

module.exports = router