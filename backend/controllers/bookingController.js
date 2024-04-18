const Booking = require('../models/bookingModel')
const Book = require('../models/bookModel')
const mongoose = require('mongoose')
const dotenv = require("dotenv");
const cron = require('node-cron');
const schedule = require('node-schedule');
var nodemailer = require('nodemailer');

dotenv.config();



const reminderTask = cron.schedule('* * * * *', async () => { // This runs the task every second
    console.log("Running Tasks")

    try {
        const today = new Date();
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        // console.log('Tomorrow:', tomorrow);

        // const forms = await Booking.find({ reserverDate: tomorrow });
        const forms = await Booking.find({
            reserverDate: {
                $gte: tomorrow,
                $lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000) // Next day's midnight
            }
        });

        const bookIds = forms.map(form => form.bookId);
        const books = await Book.find({ _id: { $in: bookIds } });
        // console.log('Forms:', forms);

        // forms.forEach(async (form) => {
        //     await sendMessage(form)
        //     console.log('Reminder messages sent successfully.');
        // });

        forms.forEach(async form => {
            const book = books.find(book => book._id.toString() === form.bookId.toString());
            if (book) {
                await sendMessage(form, book);
                console.log('Reminder messages sent successfully.');
            } else {
                console.error('Book not found for form:', form);
            }
        });

    } catch (error) {
        console.error('Error sending reminder messages:', error);
    }
});

reminderTask.start();

process.on('exit', () => {
    reminderTask.stop();
});


const sendMessage = async (form, book) => {
    try {

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'issegypt.academic@gmail.com',
                pass: 'duea uvwi yebk bfve'

            }
        });

        function formatDateTime(dateTime) {
            const date = new Date(dateTime);
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            const month = months[date.getMonth()];
            const day = date.getDate();
            const year = date.getFullYear();

            let hours = date.getHours();
            const minutes = date.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';

            hours = hours % 12;
            hours = hours ? hours : 12; // Handle midnight (0 hours)

            const formattedTime = `${hours}:${minutes.toString().padStart(2, '0')}${ampm}`;

            return `${month} ${day}, ${year} - ${formattedTime}`;
        }


        var html = `
<!DOCTYPE HTML
  PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:o="urn:schemas-microsoft-com:office:office">

<head>

  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">

  <meta http-equiv="X-UA-Compatible" content="IE=edge"><!--<![endif]-->

  <style type="text/css">
    @media only screen and (min-width: 520px) {
      .u-row {
        width: 500px !important;
      }

      .u-row .u-col {
        vertical-align: top;
      }

      .u-row .u-col-33p33 {
        width: 166.65px !important;
      }

      .u-row .u-col-50 {
        width: 250px !important;
      }

      .u-row .u-col-100 {
        width: 500px !important;
      }

    }

    @media (max-width: 520px) {
      .u-row-container {
        max-width: 100% !important;
        padding-left: 0px !important;
        padding-right: 0px !important;
      }

      .u-row .u-col {
        min-width: 320px !important;
        max-width: 100% !important;
        display: block !important;
      }

      .u-row {
        width: 100% !important;
      }

      .u-col {
        width: 100% !important;
      }

      .u-col>div {
        margin: 0 auto;
      }
    }

    body {
      margin: 0;
      padding: 0;
    }

    table,
    tr,
    td {
      vertical-align: top;
      border-collapse: collapse;
    }

    p {
      margin: 0;
    }

    .ie-container table,
    .mso-container table {
      table-layout: fixed;
    }

    * {
      line-height: inherit;
    }

    a[x-apple-data-detectors='true'] {
      color: inherit !important;
      text-decoration: none !important;
    }

    table,
    td {
      color: #000000;
    }

    #u_body a {
      color: #0000ee;
      text-decoration: underline;
    }
  </style>



</head>

<body class="clean-body u_body"
  style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #F7F8F9;color: #000000">
  <table id="u_body"
    style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #F7F8F9;width:100%"
    cellpadding="0" cellspacing="0">
    <tbody>
      <tr style="vertical-align: top">
        <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">

          <div class="u-row-container" style="padding: 0px;background-color: transparent">
            <div class="u-row"
              style="margin: 0 auto;min-width: 320px;max-width: 500px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
              <div
                style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
                <div class="u-col u-col-33p33"
                  style="max-width: 320px;min-width: 166.67px;display: table-cell;vertical-align: top;">
                  <div
                    style="height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">

                    <div
                      style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">


                      <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0"
                        cellspacing="0" width="100%" border="0">
                        <tbody>
                          <tr>
                            <td
                              style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;"
                              align="left">

                              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                  <td style="padding-right: 0px;padding-left: 0px;" align="center">
                                    <a href="https://issegypt.vercel.app/" target="_blank">
                                      <img align="center" border="0" src='https://res.cloudinary.com/dmv4mxgn5/image/upload/v1713476037/icons/logo_xtrdek.png' alt="ISS Egypt"
                                        title="ISS Egypt"
                                        style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 100%;max-width: 146.67px;"
                                        width="146.67" />
                                    </a>
                                  </td>
                                </tr>
                              </table>

                            </td>
                          </tr>
                        </tbody>
                      </table>


                    </div>
                  </div>
                </div>

                <div class="u-col u-col-33p33"
                  style="max-width: 320px;min-width: 166.67px;display: table-cell;vertical-align: top;">
                  <div
                    style="height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">

                    <div
                      style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">

                    </div>
                  </div>
                </div>

                <div class="u-col u-col-33p33"
                  style="max-width: 320px;min-width: 166.67px;display: table-cell;vertical-align: top;">
                  <div
                    style="height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">

                    <div
                      style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">

                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>





          <div class="u-row-container" style="padding: 0px;background-color: transparent">
            <div class="u-row"
              style="margin: 0 auto;min-width: 320px;max-width: 500px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
              <div
                style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">

                <div class="u-col u-col-100"
                  style="max-width: 320px;min-width: 500px;display: table-cell;vertical-align: top;">
                  <div
                    style="height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">

                    <div
                      style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">


                      <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0"
                        cellspacing="0" width="100%" border="0">
                        <tbody>
                          <tr>
                            <td
                              style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;"
                              align="left">


                              <h1
                                style="margin: 0px; color: #da0037; line-height: 100%; text-align: left; word-wrap: break-word; font-family: verdana,geneva; font-size: 22px; font-weight: 700;">
                                <span><span><span><span><span><span style="line-height: 22px;"><span
                                              style="line-height: 22px;"><span style="line-height: 22px;"><span
                                                  style="line-height: 22px;"><span style="line-height: 22px;">ISS EGYPT
                                                    GATEWAY</span></span></span></span></span></span></span></span></span></span>
                              </h1>


                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0"
                        cellspacing="0" width="100%" border="0">
                        <tbody>
                          <tr>
                            <td
                              style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;"
                              align="left">

                              <div style="font-size: 14px; line-height: 140%; text-align: left; word-wrap: break-word;">
                                <p style="line-height: 140%;"><strong>Reminder of the Book's Return Date</strong></p>
                              </div>

                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0"
                        cellspacing="0" width="100%" border="0">
                        <tbody>
                          <tr>
                            <td
                              style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;"
                              align="left">


                              <h2
                                style="margin: 0px; line-height: 140%; text-align: left; word-wrap: break-word; font-size: 20px; font-weight: 400;">
                                <span><span><strong>Hello ${form.reserverName}</strong></span></span>
                              </h2>


                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0"
                        cellspacing="0" width="100%" border="0">
                        <tbody>
                          <tr>
                            <td
                              style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;"
                              align="left">

                              <div style="font-size: 14px; line-height: 140%; text-align: left; word-wrap: break-word;">
                                <p style="line-height: 140%;">This email is a reminder to return the book you booked
                                  from the ISS library back to the library</p>
                              </div>

                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0"
                        cellspacing="0" width="100%" border="0">
                        <tbody>
                          <tr>
                            <td
                              style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;"
                              align="left">

                              <table height="0px" align="center" border="0" cellpadding="0" cellspacing="0" width="100%"
                                style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 1px solid #BBBBBB;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                <tbody>
                                  <tr style="vertical-align: top">
                                    <td
                                      style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                      <span>&#160;</span>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>

                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0"
                        cellspacing="0" width="100%" border="0">
                        <tbody>
                          <tr>
                            <td
                              style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;"
                              align="left">

                              <div style="font-size: 19px; line-height: 140%; text-align: left; word-wrap: break-word;">
                                <p style="line-height: 140%;"><span style="line-height: 26.6px;"><strong>The Book
                                      Details:</strong></span> </p>
                              </div>

                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0"
                        cellspacing="0" width="100%" border="0">
                        <tbody>
                          <tr>
                            <td
                              style="overflow-wrap:break-word;word-break:break-word;padding:0px;font-family:arial,helvetica,sans-serif;"
                              align="left">

                              <div style="font-size: 17px; line-height: 140%; text-align: left; word-wrap: break-word;">
                                <ul>
                                  <li style="line-height: 23.8px;">Book Name: <b> ${book.bookName} </b></li>
                                  <li style="line-height: 23.8px;">Return Date: <b> ${formatDateTime(form.reserverDate)}</b></li>
                                </ul>
                              </div>

                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0"
                        cellspacing="0" width="100%" border="0">
                        <tbody>
                          <tr>
                            <td
                              style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;"
                              align="left">

                              <table height="0px" align="center" border="0" cellpadding="0" cellspacing="0" width="100%"
                                style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 1px solid #BBBBBB;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                <tbody>
                                  <tr style="vertical-align: top">
                                    <td
                                      style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                      <span>&#160;</span>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>

                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0"
                        cellspacing="0" width="100%" border="0">
                        <tbody>
                          <tr>
                            <td
                              style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;"
                              align="left">

                              <div style="font-size: 14px; line-height: 140%; text-align: left; word-wrap: break-word;">
                                <p style="line-height: 140%;"><span style="line-height: 19.6px;">If you want to request
                                    to extend the return date please click on the link below and use the one time
                                    password provided</span></p>
                              </div>

                            </td>
                          </tr>
                        </tbody>
                      </table>


                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>





          <div class="u-row-container" style="padding: 0px;background-color: transparent">
            <div class="u-row"
              style="margin: 0 auto;min-width: 320px;max-width: 500px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
              <div
                style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">

                <div class="u-col u-col-50"
                  style="max-width: 320px;min-width: 250px;display: table-cell;vertical-align: top;">
                  <div
                    style="background-color: #da0037;height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">

                    <div
                      style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">


                      <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0"
                        cellspacing="0" width="100%" border="0">
                        <tbody>
                          <tr>
                            <td
                              style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;"
                              align="left">

                              <div
                                style="font-size: 14px; font-weight: 400; color: #f5f3f3; line-height: 140%; text-align: center; word-wrap: break-word;">
                                <p style="line-height: 140%;">Your One Time Password is</p>
                              </div>
                                
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0"
                        cellspacing="0" width="100%" border="0">
                        <tbody>
                          <tr>
                            <td
                              style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;"
                              align="left">

                              <div
                                style="font-size: 14px; font-weight: 700; color: #ffffff; line-height: 140%; text-align: center; word-wrap: break-word;">
                                <p style="line-height: 140%;">${form.reserverPassword}</p>
                              </div>

                            </td>
                          </tr>
                        </tbody>
                      </table>


                    </div>
                  </div>
                </div>

                <div class="u-col u-col-50"
                  style="max-width: 320px;min-width: 250px;display: table-cell;vertical-align: top;">
                  <div
                    style="height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">

                    <div
                      style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">


                      <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0"
                        cellspacing="0" width="100%" border="0">
                        <tbody>
                          <tr>
                            <td
                              style="overflow-wrap:break-word;word-break:break-word;padding:22px;font-family:arial,helvetica,sans-serif;"
                              align="left">


                              <div align="center">

                              <a href=${`https://issegypt.vercel.app/extendTime/${form._id}`}
                                  target="_blank" class="v-button"
                                  style="box-sizing: border-box;display: inline-block;text-decoration: none;-webkit-text-size-adjust: none;text-align: center;color: #FFFFFF; background-color: #da0037; border-radius: 6px;-webkit-border-radius: 6px; -moz-border-radius: 6px; width:auto; max-width:100%; overflow-wrap: break-word; word-break: break-word; word-wrap:break-word; mso-border-alt: none;font-size: 14px;font-weight: 700; ">
                                  <span style="display:block;padding:10px 20px;line-height:120%;"><span
                                      style="line-height: 16.8px;">Extend Return Date</span></span>
                                </a>

                              </div>

                            </td>
                          </tr>
                        </tbody>
                      </table>

                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>





          <div class="u-row-container" style="padding: 0px;background-color: transparent">
            <div class="u-row"
              style="margin: 0 auto;min-width: 320px;max-width: 500px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
              <div
                style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">

                <div class="u-col u-col-100"
                  style="max-width: 320px;min-width: 500px;display: table-cell;vertical-align: top;">
                  <div
                    style="height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">

                    <div
                      style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">

                      <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0"
                        cellspacing="0" width="100%" border="0">
                        <tbody>
                          <tr>
                            <td
                              style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;"
                              align="left">

                              <table height="0px" align="center" border="0" cellpadding="0" cellspacing="0" width="100%"
                                style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 1px solid #BBBBBB;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                <tbody>
                                  <tr style="vertical-align: top">
                                    <td
                                      style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                      <span>&#160;</span>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>

                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0"
                        cellspacing="0" width="100%" border="0">
                        <tbody>
                          <tr>
                            <td
                              style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;"
                              align="left">

                              <div style="font-size: 14px; line-height: 140%; text-align: left; word-wrap: break-word;">
                                <p style="line-height: 140%;"><em><span style="line-height: 19.6px;">If you have any
                                      questions don't hesitate to ask us on this number</span></em></p>
                              </div>

                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0"
                        cellspacing="0" width="100%" border="0">
                        <tbody>
                          <tr>
                            <td
                              style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;"
                              align="left">


                              <div align="center">

                                <a href=${`http://wa.me/+201554206775`}
                                  target="_blank" class="v-button"
                                  style="box-sizing: border-box;display: inline-block;text-decoration: none;-webkit-text-size-adjust: none;text-align: center;color: #FFFFFF; background-color: #bbbbbb; border-radius: 6px;-webkit-border-radius: 6px; -moz-border-radius: 6px; width:auto; max-width:100%; overflow-wrap: break-word; word-break: break-word; word-wrap:break-word; mso-border-alt: none;font-size: 14px;font-weight: 700; ">
                                  <span style="display:block;padding:10px 20px;line-height:120%;"><span
                                      style="line-height: 16.8px;">Ask Us Any Question</span></span>
                                </a>

                              </div>

                            </td>
                          </tr>
                        </tbody>
                      </table>


                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>





          <div class="u-row-container" style="padding: 0px;background-color: transparent">
            <div class="u-row"
              style="margin: 0 auto;min-width: 320px;max-width: 500px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
              <div
                style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">



                <div class="u-col u-col-100"
                  style="max-width: 320px;min-width: 500px;display: table-cell;vertical-align: top;">
                  <div
                    style="background-color: #da0037;height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">

                    <div
                      style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">


                      <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0"
                        cellspacing="0" width="100%" border="0">
                        <tbody>
                          <tr>
                            <td
                              style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;"
                              align="left">

                              <div align="right">
                                <div style="display: table; max-width:119px;">




                                  <table align="left" border="0" cellspacing="0" cellpadding="0" width="32" height="32"
                                    style="width: 32px !important;height: 32px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 8px">
                                    <tbody>
                                      <tr style="vertical-align: top">
                                        <td align="left" valign="middle"
                                          style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                                          <a href="https://www.instagram.com/issegypt/" title="Instagram"
                                            target="_blank">
                                            <img src="https://res.cloudinary.com/dmv4mxgn5/image/upload/v1713476650/icons/instagram_uozpif.png" alt="Instagram" title="Instagram" width="32"
                                              style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important">
                                          </a>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>

                                  <table align="left" border="0" cellspacing="0" cellpadding="0" width="32" height="32"
                                    style="width: 32px !important;height: 32px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 8px">
                                    <tbody>
                                      <tr style="vertical-align: top">
                                        <td align="left" valign="middle"
                                          style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                                          <a href="https://www.facebook.com/Eg.UTM" title="Facebook" target="_blank">
                                            <img src="https://res.cloudinary.com/dmv4mxgn5/image/upload/v1713476650/icons/facebook_rwr4b3.png" alt="Facebook" title="Facebook" width="32"
                                              style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important">
                                          </a>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>

                                  <table align="left" border="0" cellspacing="0" cellpadding="0" width="32" height="32"
                                    style="width: 32px !important;height: 32px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 0px">
                                    <tbody>
                                      <tr style="vertical-align: top">
                                        <td align="left" valign="middle"
                                          style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                                          <a href="https://www.linkedin.com/in/iss-egypt-utm-821447267/"
                                            title="LinkedIn" target="_blank">
                                            <img src="https://res.cloudinary.com/dmv4mxgn5/image/upload/v1713476650/icons/linkedin_qrfqhy.png" alt="LinkedIn" title="LinkedIn" width="32"
                                              style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important">
                                          </a>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>




                                </div>
                              </div>

                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</body>

</html>
`;

        var mailOptions = {
            from: 'issegypt.academic@gmail.com',
            to: form.reserverEmail,
            subject: 'ISS EGYPT - Reminder to Return the Book!',
            html: html
        }

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log("Success")
                return res.send({ Status: 'Success' })
            }
        });

    } catch (error) {
        res.status(400).json({ error: error.message })
    }
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