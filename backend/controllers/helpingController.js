const Helping = require("../models/helpingModel");
const mongoose = require('mongoose')





const getAll = async (req, res) => {
    try {
        const services = await Helping.find();
        res.status(200).json(services);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch services", error: error.message });
    }
}


const getItem = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ message: "No Helping Found" })

    }
    try {
        const item = await Helping.findById(id)
        if (!item) {
            return res.status(404).json({ message: "No Helping Found" })
        }
        res.status(200).json(item)
    } catch (error) {
        res.status(500).json({ message: "Error fetching Helping", error: error.message });
    }
}

const getItemByService = async (req, res) => {
    const { service } = req.params; // Use the service name (or slug) from the URL params

    try {
        // Query the database using the service name (case-insensitive)
        const items = await Helping.find({ service: { $regex: new RegExp(`^${service}$`, "i") } }).sort({ createdAt: 1 });

        if (!items || items.length === 0) {
            return res.status(404).json({ message: "No Helping Found" });
        }

        res.status(200).json(items); // Return all matching items as an array
    } catch (error) {
        res.status(500).json({ message: "Error fetching Helping", error: error.message });
    }
};


const createItem = async (req, res) => {
    const { service, group, name, aName, description, aDescription, img, links } = req.body;

    try {
        // Validate required fields
        if (!service || !name || !aName || !img) {
            return res.status(400).json({ message: "All required fields must be provided" });
        }

        const item = await Helping.create({ service, group, name, aName, description, aDescription, img, links, status: "Active" });

        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ message: "Failed to create Helping", error: error.message });
    }
};


// Update a Helping
const updateItem = async (req, res) => {
    try {
        const { id } = req.params
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ error: "No Such Item Found" })
        }
        const item = await Helping.findOneAndUpdate({ _id: id }, {
            ...req.body
        })

        if (!item) {
            return res.status(404).json({ error: "No Helping Found" })
        }

        res.status(200).json(item)
    } catch (error) {
        res.status(500).json({ message: "Failed to update Helping", error: error.message });
    }

}

// Delete a Helping
const deleteItem = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedService = await Helping.findByIdAndDelete(id);

        if (!deletedService) {
            return res.status(404).json({ message: "Helping not found" });
        }

        res.status(200).json({ message: "Helping deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete Helping", error: error.message });
    }

}


module.exports = { getItem, getAll, getItemByService, createItem, updateItem, deleteItem };
