const Transaction = require('../models/transactionsModel')
const Product = require('../models/productModel'); // Import the Product model

const mongoose = require('mongoose')
const schedule = require('node-schedule');
var nodemailer = require('nodemailer');
const dotenv = require("dotenv");

//get all items

const getAll = async (req, res) => {
    const items = await Transaction.find({}).sort({ createdAt: -1 })
    res.status(200).json(items)
}


// get single item
const getItem = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "No Such Item Found" })

    }
    const item = await Transaction.findById(id)

    if (!item) {
        return res.status(404).json({ error: "No Such Item Found" })
    }

    res.status(200).json(item)
}




//create a new item
const createItem = async (req, res) => {
    const { productId, buyerName, buyerMatric, buyerEmail, buyerPhone, buyerFaculty, buyerSemester, productQuantity, productSize, proof } = req.body

    const generateReferenceNumber = () => {
        const buyerNamePart = buyerName.slice(0, 2).toUpperCase();
        const buyerMatricPart = buyerMatric.slice(0, 2).toUpperCase();
        const randomPart = Math.random().toString(36).substr(2, 4).toUpperCase();
        return buyerNamePart + buyerMatricPart + randomPart;
    };
    const referenceNumber = generateReferenceNumber();

    try {
        const item = await Transaction.create({ productId, buyerName, buyerMatric, buyerEmail, buyerPhone, buyerFaculty, buyerSemester, productQuantity, productSize, referenceNumber, transactionStatus: "Not Delivered", proof })

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }


        const purchaseDate = new Date();
        const formattedDate = purchaseDate.toLocaleString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        }).replace(',', '');





        const html = `
        <!DOCTYPE HTML
    PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
    xmlns:o="urn:schemas-microsoft-com:office:office">
  
  <head>
    <!--[if gte mso 9]>
  <xml>
    <o:OfficeDocumentSettings>
      <o:AllowPNG/>
      <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
  </xml>
  <![endif]-->
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="x-apple-disable-message-reformatting">
    <!--[if !mso]><!-->
    <meta http-equiv="X-UA-Compatible" content="IE=edge"><!--<![endif]-->
    <title></title>
  
    <style type="text/css">
      @media only screen and (min-width: 620px) {
        .u-row {
          width: 600px !important;
        }
  
        .u-row .u-col {
          vertical-align: top;
        }
  
  
        .u-row .u-col-50 {
          width: 300px !important;
        }
  
  
        .u-row .u-col-100 {
          width: 600px !important;
        }
  
      }
  
      @media only screen and (max-width: 620px) {
        .u-row-container {
          max-width: 100% !important;
          padding-left: 0px !important;
          padding-right: 0px !important;
        }
  
        .u-row {
          width: 100% !important;
        }
  
        .u-row .u-col {
          display: block !important;
          width: 100% !important;
          min-width: 320px !important;
          max-width: 100% !important;
        }
  
        .u-row .u-col>div {
          margin: 0 auto;
        }
  
  
        .u-row .u-col img {
          max-width: 100% !important;
        }
  
      }
  
      body {
        margin: 0;
        padding: 0
      }
  
      table,
      td,
      tr {
        border-collapse: collapse;
        vertical-align: top
      }
  
      .ie-container table,
      .mso-container table {
        table-layout: fixed
      }
  
      * {
        line-height: inherit
      }
  
      a[x-apple-data-detectors=true] {
        color: inherit !important;
        text-decoration: none !important
      }
  
  
      table,
      td {
        color: #000000;
      }
    </style>
  
  
  
  
    <link href="https://fonts.googleapis.com/css2?family=Anton&display=swap" rel="stylesheet" type="text/css">
    <link href="https://fonts.googleapis.com/css?family=Cabin:400,700" rel="stylesheet" type="text/css"><!--<![endif]-->
  
  </head>
  
  <body class="clean-body u_body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;color: #000000">
  
    <table id="u_body"
      style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #f9f9f9;width:100%"
      cellpadding="0" cellspacing="0">
      <tbody>
        <tr style="vertical-align: top">
          <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
  
  
  
            <div class="u-row-container" style="padding: 0px;background-color: transparent">
              <div class="u-row"
                style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
                <div
                  style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
  
                  <div class="u-col u-col-100"
                    style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                    <div style="height: 100%;width: 100% !important;">
                      <div
                        style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
  
                        <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0"
                          width="100%" border="0">
                          <tbody>
                            <tr>
                            </tr>
                          </tbody>
                        </table>
  
                      </div>
                    </div>
  
                  </div>
                </div>
              </div>
  
  
  
  
  
              <div class="u-row-container" style="padding: 0px;background-color: transparent">
                <div class="u-row"
                  style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;">
                  <div
                    style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
  
                    <div class="u-col u-col-100"
                      style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                      <div style="height: 100%;width: 100% !important;">
  
                        <div
                          style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
  
  
                          <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0"
                            cellspacing="0" width="100%" border="0">
                            <tbody>
                              <tr>
                                <td
                                  style="overflow-wrap:break-word;word-break:break-word;padding:20px;font-family:'Cabin',sans-serif;"
                                  align="left">
  
                                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                    <tr>
                                      <td style="padding-right: 0px;padding-left: 0px;" align="center">
  
                                        <img align="center" border="0"
                                          src="https://assets.unlayer.com/projects/257282/1734738943555-New%20Logo.png?w=240.8px"
                                          alt="Image" title="Image"
                                          style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 43%;max-width: 240.8px;"
                                          width="240.8" />
  
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
                  </div>
                </div>
              </div>
  
  
  
  
  
              <div class="u-row-container" style="padding: 0px;background-color: transparent">
                <div class="u-row"
                  style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #da0037;">
                  <div
                    style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
  
                    <div class="u-col u-col-100"
                      style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                      <div style="height: 100%;width: 100% !important;">
                        <div
                          style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
  
                          <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0"
                            cellspacing="0" width="100%" border="0">
                            <tbody>
                              <tr>
                                <td
                                  style="overflow-wrap:break-word;word-break:break-word;padding:10px 0px;font-family:'Cabin',sans-serif;"
                                  align="left">
  
                                  <div
                                    style="font-size: 14px; color: #e5eaf5; line-height: 140%; text-align: center; word-wrap: break-word;">
                                    <p style="line-height: 140%; margin: 0px;" dir="RTL"><span
                                        style="line-height: 61.6px; font-size: 44px; color: #FFFFFF"><strong>Thanks
                                          for
                                          your Purchase</strong></span></p>
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
                  style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #ffffff;">
                  <div
                    style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
  
                    <div class="u-col u-col-100"
                      style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                      <div style="height: 100%;width: 100% !important;">
                        <div
                          style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
  
                          <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0"
                            cellspacing="0" width="100%" border="0">
                            <tbody>
                              <tr>
                                <td
                                  style="overflow-wrap:break-word;word-break:break-word;padding:10px 10px 0px;font-family:'Cabin',sans-serif;"
                                  align="left">
  
                                  <div
                                    style="font-size: 20px; line-height: 140%; text-align: left; word-wrap: break-word;">
                                    <p style="line-height: 140%; margin: 0px;"><span
                                        style="color: #2b2b2b; line-height: 28px;"><strong><span
                                            style="line-height: 28px;">Dear<br></span></strong></span></p>
                                  </div>
  
                                </td>
                              </tr>
                            </tbody>
                          </table>
  
                          <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0"
                            cellspacing="0" width="100%" border="0">
                            <tbody>
                              <tr>
                                <td
                                  style="overflow-wrap:break-word;word-break:break-word;padding:0px 10px 10px;font-family:'Cabin',sans-serif;"
                                  align="left">
  
                                  <div
                                    style="font-family: inherit; font-size: 25px; line-height: 140%; text-align: left; word-wrap: break-word;">
                                    <p style="line-height: 140%; margin: 0px;"><span
                                        style="line-height: 35px; color: #da0037;"><strong><span
                                            style="line-height: 35px;">${buyerName}</span></strong></span></p>
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
                  style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
                  <div
                    style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
  
                    <div class="u-col u-col-100"
                      style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                      <div
                        style="background-color: #2b2b2b;height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
                        <div
                          style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
  
                          <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0"
                            cellspacing="0" width="100%" border="0">
                            <tbody>
                              <tr>
                                <td
                                  style="overflow-wrap:break-word;word-break:break-word;padding:33px 55px 33px 33px;font-family:'Cabin',sans-serif;"
                                  align="left">
  
                                  <div
                                    style="font-size: 14px; line-height: 100%; text-align: center; word-wrap: break-word;">
                                    <p style="font-size: 14px; line-height: 100%; text-align: left; margin: 0px;"><span
                                        style="font-size: 16px; line-height: 16px; color: #fafafa;"><strong><span
                                            style="font-family: inherit; line-height: 14px;font-weight: bold">You successfully purchased:
                                            <span style="line-height: 14px;">${product.pTitle}</span></span></strong></span></p>
                                    <p style="font-size: 14px; line-height: 100%; text-align: left; margin: 0px;"><span
                                        style="font-size: 16px; line-height: 16px; color: #fafafa;"><strong><span
                                            style="font-family: inherit; line-height: 14px; font-weight: bold">Date: <span
                                              style="background-color: line-height: 14px;">${formattedDate}</span><br></span></strong></span>
                                    </p>
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
                  style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
                  <div
                    style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
                    <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: transparent;"><![endif]-->
  
                    <!--[if (mso)|(IE)]><td align="center" width="300" style="width: 300px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
                    <div class="u-col u-col-50"
                      style="max-width: 320px;min-width: 300px;display: table-cell;vertical-align: top;">
                      <div
                        style="height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
                        <!--[if (!mso)&(!IE)]><!-->
                        <div
                          style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
                          <!--<![endif]-->
  
                          <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0"
                            cellspacing="0" width="100%" border="0">
                            <tbody>
                              <tr>
                                <td
                                  style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Cabin',sans-serif;"
                                  align="left">
  
                                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                    <tr>
                                      <td style="padding-right: 0px;padding-left: 0px;" align="center">
  
                                        <img align="center" border="0"
                                          src=${product.pImage} alt="" title=""
                                          style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 100%;max-width: 280px;"
                                          width="280" />
  
                                      </td>
                                    </tr>
                                  </table>
  
                                </td>
                              </tr>
                            </tbody>
                          </table>
  
                          <!--[if (!mso)&(!IE)]><!-->
                        </div><!--<![endif]-->
                      </div>
                    </div>
                    <!--[if (mso)|(IE)]></td><![endif]-->
                    <!--[if (mso)|(IE)]><td align="center" width="300" style="width: 300px;padding: 15px 0px 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
                    <div class="u-col u-col-50"
                      style="max-width: 320px;min-width: 300px;display: table-cell;vertical-align: top;">
                      <div
                        style="height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
                        <!--[if (!mso)&(!IE)]><!-->
                        <div
                          style="box-sizing: border-box; height: 100%; padding: 15px 0px 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
                          <!--<![endif]-->
  
                          <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0"
                            cellspacing="0" width="100%" border="0">
                            <tbody>
                              <tr>
                                <td
                                  style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Cabin',sans-serif;"
                                  align="left">
  
                                  <div
                                    style="font-size: 14px; line-height: 50%; text-align: left; word-wrap: break-word;">
                                    <p style="line-height: 50%; margin: 0px;"><strong>${product.pTitle} - ${productSize}</strong>
                                    </p>
                                  </div>
  
                                </td>
                              </tr>
                            </tbody>
                          </table>
  
                          <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0"
                            cellspacing="0" width="100%" border="0">
                            <tbody>
                              <tr>
                                <td
                                  style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Cabin',sans-serif;"
                                  align="left">
  
                                  <div
                                    style="font-size: 14px; line-height: 50%; text-align: left; word-wrap: break-word;">
                                    <p style="line-height: 50%; margin: 0px;">${productQuantity} x ${product.pPrice} RM = <strong><span
                                          style="color: #da0037; line-height: 7px;">${product.pPrice * productQuantity} RM</span></strong></p>
                                  </div>
  
                                </td>
                              </tr>
                            </tbody>
                          </table>
  
                          <!--[if (!mso)&(!IE)]><!-->
                        </div><!--<![endif]-->
                      </div>
                    </div>
                    <!--[if (mso)|(IE)]></td><![endif]-->
                    <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                  </div>
                </div>
              </div>
  
  
  
  
  
              <div class="u-row-container" style="padding: 0px;background-color: transparent">
                <div class="u-row"
                  style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
                  <div
                    style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
                    <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: transparent;"><![endif]-->
  
                    <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                    <div class="u-col u-col-100"
                      style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                      <div style="height: 100%;width: 100% !important;">
                        <!--[if (!mso)&(!IE)]><!-->
                        <div
                          style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                          <!--<![endif]-->
  
                          <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0"
                            cellspacing="0" width="100%" border="0">
                            <tbody>
                              <tr>
                                <td
                                  style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Cabin',sans-serif;"
                                  align="left">
  
                                  <table height="0px" align="center" border="0" cellpadding="0" cellspacing="0"
                                    width="85%"
                                    style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 1px solid #da0037;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
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
  
                          <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0"
                            cellspacing="0" width="100%" border="0">
                            <tbody>
                              <tr>
                                <td
                                  style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Cabin',sans-serif;"
                                  align="left">
  
                                  <div
                                    style="font-size: 27px; line-height: 140%; text-align: center; word-wrap: break-word;">
                                    <p style="line-height: 140%; margin: 0px;"><span
                                        style="color: #da0037; line-height: 37.8px;"><strong>Your Reference
                                          Number</strong></span></p>
                                  </div>
  
                                </td>
                              </tr>
                            </tbody>
                          </table>
  
                          <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0"
                            cellspacing="0" width="100%" border="0">
                            <tbody>
                              <tr>
                                <td
                                  style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Cabin',sans-serif;"
                                  align="left">
  
                                  <!--[if mso]><![endif]-->
                                  <div align="center">
                                    <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://issegypt.vercel.app/reference/${referenceNumber}" style="height:45px; v-text-anchor:middle; width:278px;" arcsize="9%"  stroke="f" fillcolor="#da0037"><w:anchorlock/><center style="color:#FFFFFF;"><![endif]-->
                                    <a href="https://issegypt.vercel.app/reference/${referenceNumber}" target="_blank" class="v-button"
                                      style="box-sizing: border-box; display: inline-block; text-decoration: none; text-size-adjust: none; text-align: center; color: rgb(255, 255, 255); background: rgb(216, 0, 55); border-radius: 4px; width: 48%; max-width: 100%; word-break: break-word; overflow-wrap: break-word; font-size: 21px; font-weight: 700; line-height: inherit;"><span
                                        style="display:block;padding:10px 20px;line-height:120%;"><span
                                          style="line-height: 25.2px;">${referenceNumber}</span></span>
                                    </a>
                                    <!--[if mso]></center></v:roundrect><![endif]-->
                                  </div>
  
                                </td>
                              </tr>
                            </tbody>
                          </table>
  
                          <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0"
                            cellspacing="0" width="100%" border="0">
                            <tbody>
                              <tr>
                                <td
                                  style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Cabin',sans-serif;"
                                  align="left">
  
                                  <div
                                    style="font-size: 17px; line-height: 140%; text-align: center; word-wrap: break-word;">
                                    <p style="line-height: 140%; margin: 0px;">Don't share your reference number with anyone, also you will
                                      be
                                      notified as soon as your product arrives.</p>
                                  </div>
  
                                </td>
                              </tr>
                            </tbody>
                          </table>
  
                          <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0"
                            cellspacing="0" width="100%" border="0">
                            <tbody>
                              <tr>
                                <td
                                  style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Cabin',sans-serif;"
                                  align="left">
  
                                  <table height="0px" align="center" border="0" cellpadding="0" cellspacing="0"
                                    width="85%"
                                    style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 1px solid #da0037;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
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
  
                          <!--[if (!mso)&(!IE)]><!-->
                        </div><!--<![endif]-->
                      </div>
                    </div>
                    <!--[if (mso)|(IE)]></td><![endif]-->
                    <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                  </div>
                </div>
              </div>
  
  
  
  
  
              <div class="u-row-container" style="padding: 0px;background-color: transparent">
                <div class="u-row"
                  style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #da0037;">
                  <div
                    style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
                    <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #da0037;"><![endif]-->
  
                    <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                    <div class="u-col u-col-100"
                      style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                      <div style="height: 100%;width: 100% !important;">
                        <!--[if (!mso)&(!IE)]><!-->
                        <div
                          style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                          <!--<![endif]-->
  
                          <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0"
                            cellspacing="0" width="100%" border="0">
                            <tbody>
                              <tr>
                                <td
                                  style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Cabin',sans-serif;"
                                  align="left">
  
                                  <div
                                    style="font-size: 14px; color: #fafafa; line-height: 180%; text-align: center; word-wrap: break-word;">
                                    <p style="font-size: 14px; line-height: 180%; margin: 0px;"><span
                                        style="font-size: 16px; line-height: 28.8px;">Copyrights © ISS Egypt UTM All
                                        Rights
                                        Reserved</span></p>
                                    <p style="font-size: 14px; line-height: 180%; margin: 0px;"><span
                                        style="font-size: 30px; line-height: 54px;"><strong><span
                                            style="line-height: 25.2px;">ISS EGYPT 2025</span></strong></span></p>
                                  </div>
  
                                </td>
                              </tr>
                            </tbody>
                          </table>
  
                          <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0"
                            cellspacing="0" width="100%" border="0">
                            <tbody>
                              <tr>
                                <td
                                  style="overflow-wrap:break-word;word-break:break-word;padding:0px 55px;font-family:'Cabin',sans-serif;"
                                  align="left">
  
                                  <div
                                    style="font-size: 14px; color: #003399; line-height: 160%; text-align: center; word-wrap: break-word;">
                                    <p style="font-size: 14px; line-height: 160%; margin: 0px;"><span
                                        style="font-size: 20px; line-height: 32px; color: #ffffff;"><strong>Connect With
                                          Us</strong></span></p>
                                  </div>
  
                                </td>
                              </tr>
                            </tbody>
                          </table>
  
                          <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0"
                            cellspacing="0" width="100%" border="0">
                            <tbody>
                              <tr>
                                <td
                                  style="overflow-wrap:break-word;word-break:break-word;padding:10px 10px 33px;font-family:'Cabin',sans-serif;"
                                  align="left">
  
                                  <div align="center" style="direction: ltr;">
                                    <div style="display: table; max-width:244px;">
                                      <!--[if (mso)|(IE)]><table width="244" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-collapse:collapse;" align="center"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; mso-table-lspace: 0pt;mso-table-rspace: 0pt; width:244px;"><tr><![endif]-->
  
  
                                      <!--[if (mso)|(IE)]><td width="32" style="width:32px; padding-right: 17px;" valign="top"><![endif]-->
                                      <table border="0" cellspacing="0" cellpadding="0" width="32" height="32"
                                        style="width: 32px !important;height: 32px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 17px">
                                        <tbody>
                                          <tr style="vertical-align: top">
                                            <td valign="middle"
                                              style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                                              <a href="https://www.instagram.com/issegypt/" title="Instagram"
                                                target="_blank"
                                                style="color: rgb(0, 0, 238); text-decoration: underline; line-height: inherit;"><img
                                                  src="https://cdn.tools.unlayer.com/social/icons/circle-white/instagram.png"
                                                  alt="Instagram" title="Instagram" width="32"
                                                  style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important">
                                              </a>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                      <!--[if (mso)|(IE)]></td><![endif]-->
  
                                      <!--[if (mso)|(IE)]><td width="32" style="width:32px; padding-right: 17px;" valign="top"><![endif]-->
                                      <table border="0" cellspacing="0" cellpadding="0" width="32" height="32"
                                        style="width: 32px !important;height: 32px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 17px">
                                        <tbody>
                                          <tr style="vertical-align: top">
                                            <td valign="middle"
                                              style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                                              <a href="https://www.facebook.com/Eg.UTM" title="Facebook" target="_blank"
                                                style="color: rgb(0, 0, 238); text-decoration: underline; line-height: inherit;"><img
                                                  src="https://cdn.tools.unlayer.com/social/icons/circle-white/facebook.png"
                                                  alt="Facebook" title="Facebook" width="32"
                                                  style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important">
                                              </a>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                      <!--[if (mso)|(IE)]></td><![endif]-->
  
                                      <!--[if (mso)|(IE)]><td width="32" style="width:32px; padding-right: 17px;" valign="top"><![endif]-->
                                      <table border="0" cellspacing="0" cellpadding="0" width="32" height="32"
                                        style="width: 32px !important;height: 32px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 17px">
                                        <tbody>
                                          <tr style="vertical-align: top">
                                            <td valign="middle"
                                              style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                                              <a href="https://www.linkedin.com/company/issegypt" title="LinkedIn"
                                                target="_blank"
                                                style="color: rgb(0, 0, 238); text-decoration: underline; line-height: inherit;"><img
                                                  src="https://cdn.tools.unlayer.com/social/icons/circle-white/linkedin.png"
                                                  alt="LinkedIn" title="LinkedIn" width="32"
                                                  style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important">
                                              </a>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                      <!--[if (mso)|(IE)]></td><![endif]-->
  
                                      <!--[if (mso)|(IE)]><td width="32" style="width:32px; padding-right: 17px;" valign="top"><![endif]-->
                                      <table border="0" cellspacing="0" cellpadding="0" width="32" height="32"
                                        style="width: 32px !important;height: 32px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 17px">
                                        <tbody>
                                          <tr style="vertical-align: top">
                                            <td valign="middle"
                                              style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                                              <a href="https://www.youtube.com/@issegypt" title="YouTube" target="_blank"
                                                style="color: rgb(0, 0, 238); text-decoration: underline; line-height: inherit;"><img
                                                  src="https://cdn.tools.unlayer.com/social/icons/circle-white/youtube.png"
                                                  alt="YouTube" title="YouTube" width="32"
                                                  style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important">
                                              </a>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                      <!--[if (mso)|(IE)]></td><![endif]-->
  
                                      <!--[if (mso)|(IE)]><td width="32" style="width:32px; padding-right: 0px;" valign="top"><![endif]-->
                                      <table border="0" cellspacing="0" cellpadding="0" width="32" height="32"
                                        style="width: 32px !important;height: 32px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 0px">
                                        <tbody>
                                          <tr style="vertical-align: top">
                                            <td valign="middle"
                                              style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                                              <a href="mailto:issegypt0@gmail.com" title="Email" target="_blank"
                                                style="color: rgb(0, 0, 238); text-decoration: underline; line-height: inherit;"><img
                                                  src="https://cdn.tools.unlayer.com/social/icons/circle-white/email.png"
                                                  alt="Email" title="Email" width="32"
                                                  style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important">
                                              </a>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                      <!--[if (mso)|(IE)]></td><![endif]-->
  
  
                                      <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                                    </div>
                                  </div>
  
                                </td>
                              </tr>
                            </tbody>
                          </table>
  
                          <!--[if (!mso)&(!IE)]><!-->
                        </div><!--<![endif]-->
                      </div>
                    </div>
                    <!--[if (mso)|(IE)]></td><![endif]-->
                    <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                  </div>
                </div>
              </div>
  
  
  
              <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
          </td>
        </tr>
      </tbody>
    </table>
    <!--[if mso]></div><![endif]-->
    <!--[if IE]></div><![endif]-->
  </body>
  
  </html>
      `;



        var transporter = nodemailer.createTransport({
            port: 465,
            host: "smtp.gmail.com",
            service: 'gmail',
            secure: true,
            auth: {
                user: process.env.SHOP_EMAIL,
                pass: process.env.SHOP_PASSWORD,
            }
        });

        await new Promise((resolve, reject) => {
            // verify connection configuration
            transporter.verify(function (error, success) {
                if (error) {
                    console.log(error);
                    reject(error);
                } else {
                    console.log("Server is ready to take our messages");
                    resolve(success);
                }
            });
        });

        // Configure email options
        var mailOptions = {
            from: {
                name: 'ISS Egypt UTM',
                address: process.env.SHOP_EMAIL // Replace with your email
            },
            to: buyerEmail,
            subject: 'ISS EGYPT - Thanks For Your Purchase!',
            html: html
        };

        // Send the email
        await new Promise((resolve, reject) => {
            // send mail
            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    console.log(info);
                    resolve(info);
                }
            });
        });
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

    const item = await Transaction.findOneAndDelete({ _id: id })

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
    const item = await Transaction.findOneAndUpdate({ _id: id }, {
        ...req.body
    })

    if (!item) {
        return res.status(404).json({ error: "No Such Item Found" })
    }

    res.status(200).json(item)

}



module.exports = {
    getAll,
    getItem,
    createItem,
    deleteItem,
    updateItem,
}



