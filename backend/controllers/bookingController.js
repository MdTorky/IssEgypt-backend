const Booking = require('../models/bookingModel')
const mongoose = require('mongoose')
const dotenv = require("dotenv");
const cron = require('node-cron');
const schedule = require('node-schedule');
dotenv.config();


const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const client = require('twilio')(accountSid, authToken);



const sendWhatsAppMessage = async (to, message, bookingId) => {
    try {
        // Construct the link with the booking ID
        const extendLink = `https://issegypt.vercel.app/extendTime/${bookingId}`;
        const fullMessage = `${message} ${extendLink}`;
        console.log(fullMessage);
        await client.messages.create({
            body: fullMessage,
            from: `whatsapp:${twilioPhoneNumber}`,
            to: `whatsapp:${to}`
        });
        console.log('WhatsApp message sent successfully.');
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
    }
};



const reminderTask = cron.schedule('* * * * *', async () => {
    console.log("Running Tasks")

    try {
        // Get all bookings with return dates for tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const forms = await Booking.find({ reserverDate: tomorrow });

        forms.forEach(async (form) => {
            console.log("foind")
            // Send WhatsApp reminder message
            const message = `Hello ${form.reserverName},ISS Egypt here, just a friendly reminder that you need to return the book tomorrow. Your Key is ${form.reserverPassword}Click here to extend the time:`;
            const bookingId = form._id; // Assuming the booking ID is stored in _id field

            await sendWhatsAppMessage(form.reserverPhone, message, bookingId);
            console.log('Reminder messages sent successfully.');
        });

    } catch (error) {
        console.error('Error sending reminder messages:', error);
    }
});

reminderTask.start(); // Start the cron job

// Ensure the cron job stops when the script exits
process.on('exit', () => {
    reminderTask.stop();
});



const job = cron.schedule('* * * * * *', () => {
    // const extendLink = `https://issegypt.vercel.app/extendTime/${bookingId}`;
    // 
    // sendMessage()
})

const sendMessage = () => {
    client.messages.create({
        body: 'Hello',
        from: 'whatsapp:+14155238886',
        to: 'whatsapp:+601121792872'
    })
        .then(message => console.log(message.sid))
        .catch(error => console.error('Error sending WhatsApp message:', error));
}

const getForms = async (req, res) => {
    const forms = await Booking.find({}).sort({ createdAt: -1 })
    res.status(200).json(forms)
}




const getForm = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "No Such Booking" })
    }
    const form = await Booking.findById(id)

    if (!form) {
        return res.status(404).json({ error: "No Such Booking" })
    }

    res.status(200).json(form)

}




const createForm = async (req, res) => {
    const { bookId, reserverName, reserverEmail, reserverMatric, reserverPhone, reserverFaculty, reserverDate, reserverStatus } = req.body;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const length = 10; // Define the length of the random string

    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    try {
        // Create a new Book document with the extracted properties
        const form = await Booking.create({ bookId, reserverName, reserverEmail, reserverMatric, reserverPhone, reserverFaculty, reserverPassword: result, reserverDate, reserverStatus });

        // Respond with the created form
        res.status(200).json(form);
    } catch (error) {
        // Handle errors
        console.error('Error creating form:', error);
        res.status(400).json({ error: error.message });
    }
}


const deleteForm = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "No Such Booking" })
    }


    const form = await Booking.findOneAndDelete({ _id: id })
    if (!form) {
        return res.status(404).json({ error: "No Such Booking" })
    }
    res.status(200).json(form)
}




const updateForm = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "No Such Booking" })
    }

    const form = await Booking.findOneAndUpdate({ _id: id }, {
        ...req.body
    })
    if (!form) {
        return res.status(404).json({ error: "No Such Booking" })
    }
    res.status(200).json(form)

}


module.exports = {
    createForm,
    getForms,
    getForm,
    deleteForm,
    updateForm,
    sendMessage
}