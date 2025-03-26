// const nodemailer = require('nodemailer');

// // Configure your email transporter
// // const transporter = nodemailer.createTransport({
// //     service: 'gmail', // or your preferred email service
// //     auth: {
// //         user: process.env.EMAIL_USER,
// //         pass: process.env.EMAIL_PASS
// //     }
// // });

// const transporter = nodemailer.createTransport({
//     port: 465,
//     host: "smtp.gmail.com",
//     service: 'gmail',
//     secure: true,
//     auth: {
//         user: process.env.SHOP_EMAIL,
//         pass: process.env.SHOP_PASSWORD,
//     }
// });

// // await new Promise((resolve, reject) => {
// //     // verify connection configuration
// //     transporter.verify(function (error, success) {
// //         if (error) {
// //             console.log(error);
// //             reject(error);
// //         } else {
// //             // console.log("Server is ready to take our messages");
// //             resolve(success);
// //         }
// //     });
// // });


// /**
//  * Send confirmation email with form details
//  * @param {Object} formData - The submitted form data
//  * @param {Object} formTemplate - The original form template
//  */
// const sendConfirmationEmail = async (formData, formTemplate) => {
//     // Construct email content dynamically based on form inputs
//     let emailContent = `Dear ${formData.fullName},\n\nThank you for registering for ${formTemplate.eventName}.\n\nYour submitted details:\n\n`;

//     // Add standard inputs
//     const standardInputs = ['fullName', 'matric', 'email', 'phone', 'faculty', 'year', 'semester'];
//     standardInputs.forEach(input => {
//         if (formData[input]) {
//             emailContent += `${input.charAt(0).toUpperCase() + input.slice(1)}: ${formData[input]}\n`;
//         }
//     });

//     // Add custom inputs
//     if (formData.customInputs && formData.customInputs.length > 0) {
//         emailContent += '\nCustom Inputs:\n';
//         formData.customInputs.forEach((customInput, index) => {
//             emailContent += `${formTemplate.customInputs[index] || `Custom Input ${index + 1}`}: ${customInput}\n`;
//         });
//     }

//     // Add select inputs
//     if (formData.selectInputs && formData.selectInputs.size > 0) {
//         emailContent += '\nSelected Inputs:\n';
//         formData.selectInputs.forEach((values, label) => {
//             emailContent += `${label}: ${values.join(', ')}\n`;
//         });
//     }

//     // Add payment information if applicable
//     if (formTemplate.paymentAmount) {
//         emailContent += `\nPayment Amount: ${formTemplate.paymentAmount}\n`;
//     }

//     emailContent += '\nThank you for your registration!';

//     try {
//         await transporter.sendMail({
//             from: process.env.SHOP_EMAIL,
//             to: formData.email,
//             subject: `Confirmation: ${formTemplate.eventName} Registration`,
//             text: emailContent
//         });
//         console.log(`Confirmation email sent to ${formData.email}`);
//     } catch (error) {
//         console.error('Error sending confirmation email:', error);
//     }
// };

// module.exports = { sendConfirmationEmail };
























const nodemailer = require('nodemailer');
const Handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

const transporter = nodemailer.createTransport({
    port: 465,
    host: "smtp.gmail.com",
    service: 'gmail',
    secure: true,
    auth: {
        user: process.env.SHOP_EMAIL,
        pass: process.env.SHOP_PASSWORD,
    }
});

/**
 * Send confirmation email with form details using a custom template
 * @param {Object} formData - The submitted form data
 * @param {Object} formTemplate - The original form template
 */
const sendConfirmationEmail = async (formData, formTemplate) => {
    try {
        // Read the email template
        const templatePath = path.join(__dirname, '../templates/emailTemplate.html');
        const templateSource = fs.readFileSync(templatePath, 'utf8');

        // Prepare template data
        const templateData = {
            fullName: formData.fullName,
            matric: formData.matric || null,
            phone: formData.phone || null,
            faculty: formData.faculty || null,
            year: formData.year || null,
            semester: formData.semester || null,
            eventName: formTemplate.eventName,
            eventImage: formTemplate.eventImg || null,

            // Standard inputs
            standardInputs: [
                { label: 'Full Name', value: formData.fullName },
                { label: 'Matric', value: formData.matric },
                { label: 'Email', value: formData.email },
                { label: 'Phone', value: formData.phone },
                { label: 'Faculty', value: formData.faculty },
                { label: 'Year', value: formData.year },
                { label: 'Semester', value: formData.semester }
            ].filter(input => input.value), // Remove inputs with no value

            // Custom Inputs (without 'Custom Input' label)
            customInputs: formData.customInputs
                ? formTemplate.customInputs.map((label, index) => ({
                    label: label,
                    value: formData.customInputs[index]
                }))
                : [],

            // Select Inputs
            selectInputs: formData.selectInputs
                ? Array.from(formData.selectInputs).map(([label, values]) => ({
                    label: label,
                    value: values.join(', ')
                }))
                : [],

            // Payment information

            paymentAmount: formTemplate.paymentAmount,
            paymentProof: formData.proof || null,
            picture: formData.picture || null
        };

        // Compile the template
        const template = Handlebars.compile(templateSource);
        const htmlContent = template(templateData);

        // Send email
        await transporter.sendMail({
            from: {
                name: 'ISS Egypt UTM',
                address: process.env.SHOP_EMAIL,
            },
            to: formData.email,
            subject: `Confirmation: ${formTemplate.eventName} Registration`,
            html: htmlContent
        });

        console.log(`Confirmation email sent to ${formData.email}`);
    } catch (error) {
        console.error('Error sending confirmation email:', error);
    }
};

module.exports = { sendConfirmationEmail };