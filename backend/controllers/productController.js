const Product = require('../models/productModel')
const mongoose = require('mongoose')

//get all items

const getAll = async (req, res) => {
    const items = await Product.find({}).sort({ createdAt: -1 })
    res.status(200).json(items)
}


// get single item
const getItem = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "No Such Item Found" })

    }
    const item = await Product.findById(id)

    if (!item) {
        return res.status(404).json({ error: "No Such Item Found" })
    }

    res.status(200).json(item)
}



// const getFirstProductByUserId = async (req, res) => {
//     const { userID } = req.params;

//     try {
//         const product = await Product.findOne({ userID }).sort({ createdAt: 1 });

//         if (!product) {
//             return res.status(404).json({ error: "No product found with the specified userID" });
//         }

//         res.status(200).json(product);
//     } catch (error) {
//         res.status(500).json({ error: "Internal server error" });
//     }
// };



//create a new item
const createItem = async (req, res) => {
    const { pTitle, pArabicTitle, pDescription, pArabicDescription, pPrice, pCategory, pImage, pStatus, pModel, pFrontImage } = req.body

    try {
        const item = await Product.create({ pTitle, pArabicTitle, pDescription, pArabicDescription, pPrice, pCategory, pImage, pStatus, pModel, pFrontImage })
        res.status(200).json(item)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

//delete an item
const deleteItem = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "No Such Item Found" })
    }

    const item = await Product.findOneAndDelete({ _id: id })

    if (!item) {
        return res.status(404).json({ error: "No Such Item Found" })
    }

    res.status(200).json(item)

}


//update an item
const updateItem = async (req, res) => {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "No Such Item Found" })
    }
    const item = await Product.findOneAndUpdate({ _id: id }, {
        ...req.body
    })

    if (!item) {
        return res.status(404).json({ error: "No Such Item Found" })
    }

    res.status(200).json(item)

}

const updateProductInventory = async (req, res) => {
    const { productId, size, quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(404).json({ error: "Invalid product ID" });
    }

    try {
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        const sizeInventory = product.pSizeInventory || new Map();

        // Use .get() for Maps
        const currentStock = sizeInventory.get(size) || 0;

        console.log(size, quantity, currentStock, sizeInventory);

        if (currentStock < quantity) {
            return res.status(400).json({
                error: "Not enough inventory",
                available: currentStock
            });
        }

        // Use .set() to update Maps
        sizeInventory.set(size, currentStock - quantity);

        product.pSizeInventory = sizeInventory;
        await product.save();

        return res.status(200).json({
            message: "Inventory updated successfully",
            remainingStock: sizeInventory.get(size)
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};




module.exports = {
    getAll,
    getItem,
    createItem,
    deleteItem,
    updateItem,
    updateProductInventory
    // getFirstProductByUserId
}



