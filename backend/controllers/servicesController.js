const Service = require("../models/servicesModel");
const mongoose = require('mongoose')





const getAll = async (req, res) => {
    try {
        const services = await Service.find();
        res.status(200).json(services);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch services", error: error.message });
    }
}


const getItem = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ message: "No Service Found" })

    }
    try {
        const item = await Service.findById(id)
        if (!item) {
            return res.status(404).json({ message: "No Service Found" })
        }
        res.status(200).json(item)
    } catch (error) {
        res.status(500).json({ message: "Error fetching service", error: error.message });
    }
}

const getItemByLink = async (req, res) => {
    const { link } = req.params; // Use the service name (or slug) from the URL params

    try {
        // Query the database using the service name (case-insensitive)
        const item = await Service.findOne({ link }).sort({ createdAt: 1 });


        if (!item) {
            return res.status(404).json({ message: "No Service Found" });
        }

        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ message: "Error fetching Service", error: error.message });
    }
};


const createItem = async (req, res) => {
    const { name, aName, description, aDescription, icon, link, card, status, groups, bgImage } = req.body;

    try {
        // Validate required fields
        if (!name || !aName || !description || !aDescription || !icon || !link || !card || !bgImage) {
            return res.status(400).json({ message: "All required fields must be provided" });
        }

        if (groups && !Array.isArray(groups)) {
            return res.status(400).json({ message: "Groups must be an array" });
        }

        if (groups && groups.some(group => !group.name || !group.aName)) {
            return res.status(400).json({ message: "Each group must have a name and an Arabic name" });
        }

        const item = await Service.create({ name, aName, description, aDescription, icon, link, card, status, groups, bgImage });

        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ message: "Failed to create service", error: error.message });
    }
};


// Update a service
const updateItem = async (req, res) => {
    try {
        const { id } = req.params
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ error: "No Such Item Found" })
        }
        const item = await Service.findOneAndUpdate({ _id: id }, {
            ...req.body
        })

        if (!item) {
            return res.status(404).json({ error: "No Service Found" })
        }

        res.status(200).json(item)
    } catch (error) {
        res.status(500).json({ message: "Failed to update service", error: error.message });
    }

}

// Delete a service
const deleteItem = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedService = await Service.findByIdAndDelete(id);

        if (!deletedService) {
            return res.status(404).json({ message: "Service not found" });
        }

        res.status(200).json({ message: "Service deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete service", error: error.message });
    }

}


module.exports = { getItem, getAll, createItem, getItemByLink, updateItem, deleteItem };
