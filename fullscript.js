function doPost(e) {
    const data = JSON.parse(e.postData.contents);

    // Extract relevant information from the webhook
    const leadName = data.full_name;
    const leadEmail = data.email;
    const businessName = data.company_name || "Default Business Name";
    const personOnPhone = data.first_name || "Contact Person";
    const tag = data.customData.tag || "scaling"; // Default to scaling if no tag is provided
    const pdfLink = "https://drive.google.com/file/d/1wbfs-KkPDEgFsqBtmB0ppBy5P1SoDY3t/view";
    const sheetLink = "https://docs.google.com/spreadsheets/d/17jPEUpPhX1Ouv7CYB1puoSGq-LO_S8woyzDKkWRS5Hc/edit";

    // Initialize date, time, and meetingLink
    let date, time, meetingLink;

    // Check if calendar data is available
    if (data.calendar && data.calendar.startTime) {
        date = new Date(data.calendar.startTime).toLocaleDateString('en-US', { timeZone: data.calendar.selectedTimezone });
        time = new Date(data.calendar.startTime).toLocaleTimeString('en-US', { timeZone: data.calendar.selectedTimezone });
        meetingLink = data.calendar.address;
    }

    // Determine action based on customData
    if (data.customData && data.customData.Remark === "first called booked appointment") {
        const spreadsheet = SpreadsheetApp.openByUrl(sheetLink);
        const sheetName = "Sheet1";
        const sheet = spreadsheet.getSheetByName(sheetName);
        const cell = sheet.getRange("A2");
        const currentValue = cell.getValue();
        cell.setValue(currentValue + 2);
        
        sendFirstCalledBookedAppointmentEmail(leadName, leadEmail, pdfLink, date, time, meetingLink);
    } else if (data.customData && data.customData.Remark === "booked appointment") {
        const spreadsheet = SpreadsheetApp.openByUrl(sheetLink);
        const sheetName = "Sheet1";
        const sheet = spreadsheet.getSheetByName(sheetName);
        const cell = sheet.getRange("A2");
        const currentValue = cell.getValue();
        cell.setValue(currentValue + 2);
        sendBookedAppointmentEmail(leadName, leadEmail, pdfLink, date, time, meetingLink);
    } else if (data.customData && data.customData.Remark === "Intro") {
        const spreadsheet = SpreadsheetApp.openByUrl(sheetLink);
        const sheetName = "Sheet1";
        const sheet = spreadsheet.getSheetByName(sheetName);
        const cell = sheet.getRange("A2");
        const currentValue = cell.getValue();
        cell.setValue(currentValue + 1);
        sendIntroEmail(leadName, leadEmail, pdfLink);
    } else if (data.customData && data.customData.Remark === "Follow Up") {
        const spreadsheet = SpreadsheetApp.openByUrl(sheetLink);
        const sheetName = "Sheet1";
        const sheet = spreadsheet.getSheetByName(sheetName);
        const cell = sheet.getRange("A2");
        const currentValue = cell.getValue();
        cell.setValue(currentValue + 1);
        sendFollowUpEmail(leadName, leadEmail);
    } else if (data.customData && data.customData.Remark === "reminder") {
        sendReminderEmail(leadName, leadEmail, date, time);
    } else if (data.customData && data.customData.Remark === "send proposal") {
        handleSendProposal(leadName, leadEmail, businessName, personOnPhone, tag);
    }
    return ContentService.createTextOutput(JSON.stringify({ result: "success" }))
        .setMimeType(ContentService.MimeType.JSON);
}

function sendIntroEmail(leadName, leadEmail, pdfLink) {
    // Log the input parameters
    Logger.log('Sending Intro Email');
    Logger.log('Lead Name: ' + leadName);
    Logger.log('Lead Email: ' + leadEmail);
    Logger.log('PDF Link: ' + pdfLink);

    const subject = "Skyvolt Solar | Double Your revenue without Lifting a Finger";
    const htmlBody = `
<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Skyvolt Solar | Double Your revenue without Lifting a Finger</title>
        <style>
            body {
                background-color: #FFFFFF;
                padding: 20px;
                font-family: Poppins, sans-serif;
            }
            .container {
                background-color: #FFF7F2;
                padding: 20px;
                border-radius: 15px;
                box-shadow: 0px 4px 15px rgba(0,0,0,0.1);
                width: 600px;
                margin: 0 auto;
            }
            h2 {
                color: #262423;
                margin-bottom: 10px;
            }
            p, ul {
                color: #262423;
                font-size: 18px;
            }
            a {
                color: #FF6100;
            }
            .button {
                display: inline-block;
                background-color: #FF6100;
                color: #FFF7F2 !important;
                padding: 14px 25px;
                font-size: 18px;
                text-decoration: none;
                border-radius: 8px;
                margin: 25px 0;
                font-weight: bold;
                box-shadow: 0px 4px 10px rgba(0,0,0,0.2);
            }
            .footer {
                color: #777;
                font-size: 14px;
                text-align: center;
            }
            .social-icons img {
                width: 30px;
                height: 30px;
                margin: 0 10px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <td align="center">
                        <h2>Welcome to Skyvolt Solar</h2>
                    </td>
                </tr>
                <tr>
                    <td align="center">
                        <img src="https://scontent.fkul3-4.fna.fbcdn.net/v/t39.30808-6/469564647_122149470908299493_297174765885620896_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=cc71e4&_nc_ohc=9uuQ0ynsfRkQ7kNvgGhJDt8&_nc_oc=AdiTkjHcDu8r0KJ2L2UVOh9eEiXfcTxMfhupfuwBNRaVWzwTyMRbeua8cEd81zq0SrLBQdlvHdr-gMHG_Rkg3WKZ&_nc_zt=23&_nc_ht=scontent.fkul3-4.fna&_nc_gid=AGZEbYGInpkETb_N2luhi28&oh=00_AYA3m_HUMyUbEvB0YEv2QmgqVNGNx2feQzJEqdVlOqP6dg&oe=67CC55B5" 
                             alt="Skyvolt Solar Logo" 
                             style="width: 540px; height: auto; margin-bottom: 20px; border-radius: 15px;">
                    </td>
                </tr>
                <tr>
                    <td style="padding: 0 30px;">
                        <p>Hi <b>${leadName}</b>,</p>
                        <p>Thank you for taking the time to speak with us earlier. As promised, here is everything you need to know about our company and how we can help you 10x your leads.</p>
                        <p>We specialize in digital marketing and AI solutions tailored for solar companies, ensuring a steady flow of genuine buyers and keeping interested customers engaged.</p>
                        <p>Let us know if you ever want to explore how we can transform your lead generation process.</p>
                    </td>
                </tr>
                <tr>
                    <td align="center">
                        <a href="${pdfLink}" target="_blank" class="button">
                            View Our Company Profile
                        </a>
                    </td>
                </tr>
                <tr>
                    <td class="footer">
                        <p>Best Regards,<br><strong>Skyvolt Solar Marketing Team</strong></p>
                    </td>
                </tr>
                <tr>
                    <td align="center" class="social-icons">
                        <a href="https://www.facebook.com/people/Skyvolt-Solar/61558984817150/" target="_blank">
                            <img src="https://img.icons8.com/?size=100&id=118468&format=png&color=000000" alt="Facebook Icon">
                        </a>
                        <a href="https://www.instagram.com/skyvolt_solar/" target="_blank">
                            <img src="https://img.icons8.com/?size=100&id=32292&format=png&color=000000" alt="Instagram Icon">
                        </a>
                        <a href="https://www.skyvoltsolar.com" target="_blank">
                            <img src="https://img.icons8.com/?size=100&id=47745&format=png&color=000000" alt="Website Icon">
                        </a>
                    </td>
                </tr>
            </table>
        </div>
    </body>
    </html>
    `;
    
    // Log before sending the email
    Logger.log('Sending email to: ' + leadEmail);
    
    GmailApp.sendEmail(leadEmail, subject, '', { htmlBody: htmlBody });
    
    // Log after sending the email
    Logger.log('Email sent successfully to: ' + leadEmail);
}

function sendBookedAppointmentEmail(leadName, leadEmail, date, time, meetingLink) {
    const subject = "Skyvolt Solar | Booked Appointment";
    const htmlBody = `
    <p>Hi ${leadName},</p>
    <p>We are excited to inform you that your appointment has been successfully booked.</p>
    <p>Please find the details below:</p>
    <ul>
        <li>Date: ${date}</li>
        <li>Time: ${time}</li>
        <li>Meeting Link: <a href="${meetingLink}" target="_blank">${meetingLink}</a></li>
    </ul>

    <p>We look forward to seeing you at the appointment.</p>
    <p>Best regards,<br>Skyvolt Solar Marketing Team</p>
    `;

    try {
        // Log the file ID being used
        // Logger.log('Retrieving PDF file with ID: ' + pdfLink);

        // // Retrieve the PDF file from Google Drive
        // const pdfFile = DriveApp.getFileById(pdfLink);

        // // Log before sending the email
        Logger.log('Sending email to: ' + leadEmail);

        // Send the email with the PDF attachment
        GmailApp.sendEmail(leadEmail, subject, '', {
            htmlBody: htmlBody,
            // attachments: [pdfFile.getAs(MimeType.PDF)]
        });

        // Log after sending the email
        Logger.log('Email sent successfully to: ' + leadEmail);
    } catch (error) {
        // Log the error message
        Logger.log('Error retrieving file or sending email: ' + error.message);
    }
}

function sendFirstCalledBookedAppointmentEmail(leadName, leadEmail, pdfLink, date, time, meetingLink) {
    const subject = "Skyvolt Solar | Welcome and Appointment Details";
    const htmlBody = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Skyvolt Solar | Welcome and Appointment Details</title>
        <style>
            body {
                background-color: #FFFFFF;
                padding: 20px;
                font-family: Poppins, sans-serif;
            }
            .container {
                background-color: #FFF7F2;
                padding: 20px;
                border-radius: 15px;
                box-shadow: 0px 4px 15px rgba(0,0,0,0.1);
                width: 600px;
                margin: 0 auto;
            }
            h2 {
                color: #262423;
                margin-bottom: 10px;
            }
            p, ul {
                color: #262423;
                font-size: 18px;
            }
            a {
                color: #FF6100;
            }
            .button {
                display: inline-block;
                background-color: #FF6100;
                color: #FFF7F2 !important;
                padding: 14px 25px;
                font-size: 18px;
                text-decoration: none;
                border-radius: 8px;
                margin: 25px 0;
                font-weight: bold;
                box-shadow: 0px 4px 10px rgba(0,0,0,0.2);
            }
            .footer {
                color: #777;
                font-size: 14px;
                text-align: center;
            }
            .social-icons img {
                width: 30px;
                height: 30px;
                margin: 0 10px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <td align="center">
                        <h2>Welcome to Skyvolt Solar</h2>
                    </td>
                </tr>
                <tr>
                    <td align="center">
                        <img src="https://scontent.fkul3-4.fna.fbcdn.net/v/t39.30808-6/469564647_122149470908299493_297174765885620896_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=cc71e4&_nc_ohc=9uuQ0ynsfRkQ7kNvgGhJDt8&_nc_oc=AdiTkjHcDu8r0KJ2L2UVOh9eEiXfcTxMfhupfuwBNRaVWzwTyMRbeua8cEd81zq0SrLBQdlvHdr-gMHG_Rkg3WKZ&_nc_zt=23&_nc_ht=scontent.fkul3-4.fna&_nc_gid=AGZEbYGInpkETb_N2luhi28&oh=00_AYA3m_HUMyUbEvB0YEv2QmgqVNGNx2feQzJEqdVlOqP6dg&oe=67CC55B5" 
                             alt="Skyvolt Solar Logo" 
                             style="width: 540px; height: auto; margin-bottom: 20px; border-radius: 15px;">
                    </td>
                </tr>
                <tr>
                    <td style="padding: 0 30px;">
                        <p>Hi <b>${leadName}</b>,</p>
                        <p>Thanks for taking the time to speak with us earlier. I've booked an appointment for you at the date and time below. Please use the meeting link to join the session.</p>
                        <ul>
                            <li>Date: ${date}</li>
                            <li>Time: ${time}</li>
                            <li>Meeting Link: <a href="${meetingLink}" target="_blank">${meetingLink}</a></li>
                        </ul>
                        <p>As mentioned, we specialize in digital marketing and AI solutions tailored for solar companies. You can learn more by visiting <a href="https://www.skyvoltsolar.com" target="_blank">skyvoltsolar.com</a> or by checking out our company profile attached to this email.</p>
                        <p>Looking forward to seeing you soon!</p>
                    </td>
                </tr>
                <tr>
                    <td align="center">
                        <a href="${pdfLink}" target="_blank" class="button">
                            View Our Company Profile
                        </a>
                    </td>
                </tr>
                <tr>
                    <td class="footer">
                        <p>Best Regards,<br><strong>Skyvolt Solar Marketing Team</strong></p>
                    </td>
                </tr>
                <tr>
                    <td align="center" class="social-icons">
                        <a href="https://www.facebook.com/people/Skyvolt-Solar/61558984817150/" target="_blank">
                            <img src="https://img.icons8.com/?size=100&id=118468&format=png&color=000000" alt="Facebook Icon">
                        </a>
                        <a href="https://www.instagram.com/skyvolt_solar/" target="_blank">
                            <img src="https://img.icons8.com/?size=100&id=32292&format=png&color=000000" alt="Instagram Icon">
                        </a>
                        <a href="https://www.skyvoltsolar.com" target="_blank">
                            <img src="https://img.icons8.com/?size=100&id=47745&format=png&color=000000" alt="Website Icon">
                        </a>
                    </td>
                </tr>
            </table>
        </div>
    </body>
    </html>
    `;

    const fileId = '1wbfs-KkPDEgFsqBtmB0ppBy5P1SoDY3t';

    try {
        // Retrieve the PDF file from Google Drive
        const pdfFile = DriveApp.getFileById(fileId);

        // Send the email with the PDF attachment
        GmailApp.sendEmail(leadEmail, subject, '', {
            htmlBody: htmlBody,
            attachments: [pdfFile.getAs(MimeType.PDF)]
        });

        // Log after sending the email
        Logger.log('Email sent successfully to: ' + leadEmail);
    } catch (error) {
        Logger.log('Error retrieving file or sending email: ' + error.message);
    }
}

function testingSendBookedAppointmentEmail() {
    const leadName = "John Doe";
    const leadEmail = "thamkingjoe9@gmail.com";
    const documentId = '1wv7YVqWJ8WXXbvcrbKEeyU-0DHzitPun3kCjcGCU94Y'; // Original document ID
    const presentationFileId = '1iqB0NvqFZ87P5-Orm_DUAhSFihQc4tag';

    const subject = "Skyvolt Solar | Your Custom Proposal";
    const htmlBody = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Skyvolt Solar | Your Custom Proposal</title>
        <style>
            body {
                background-color: #FFFFFF;
                padding: 20px;
                font-family: Poppins, sans-serif;
            }
            .container {
                background-color: #FFF7F2;
                padding: 20px;
                border-radius: 15px;
                box-shadow: 0px 4px 15px rgba(0,0,0,0.1);
                width: 600px;
                margin: 0 auto;
            }
            h2 {
                color: #262423;
                margin-bottom: 10px;
            }
            p, ul {
                color: #262423;
                font-size: 18px;
            }
            a {
                color: #FF6100;
            }
            .button {
                display: inline-block;
                background-color: #FF6100;
                color: #FFF7F2 !important;
                padding: 14px 25px;
                font-size: 18px;
                text-decoration: none;
                border-radius: 8px;
                margin: 25px 0;
                font-weight: bold;
                box-shadow: 0px 4px 10px rgba(0,0,0,0.2);
            }
            .footer {
                color: #777;
                font-size: 14px;
                text-align: center;
            }
            .social-icons img {
                width: 30px;
                height: 30px;
                margin: 0 10px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Thank You for Joining Our Meeting</h2>
            <p>Hi <b>${leadName}</b>,</p>
            <p>Thank you for joining our meeting. Based on the pain points you mentioned, we have created a proposal for you. This proposal is automatically generated and is not finalized. If you think there are any changes that should be made, please let us know.</p>
            <p>If the proposal below meets your expectations, you may sign it, and we can proceed to payment and start with an onboarding call to gather all necessary details.</p>
            <p>Attached, you will find a video and our sales presentation slides for your reference.</p>
            <p>You can view the sales presentation <a href="https://drive.google.com/file/d/1AQJ0mE5i2vXCkcZ7ynkGdWtKzYMtM6QL/view?usp=sharing" target="_blank">here</a>.</p>
            <p>Looking forward to your feedback!</p>
            <p>Best Regards,<br><strong>Skyvolt Solar Marketing Team</strong></p>
        </div>
    </body>
    </html>
    `;

    try {
        // Copy the original document
        const originalFile = DriveApp.getFileById(documentId);
        const copiedFile = originalFile.makeCopy(`Proposal for ${leadName}`);

        // Open the copied document and replace placeholders
        const copiedDoc = DocumentApp.openById(copiedFile.getId());
        const body = copiedDoc.getBody();
        body.replaceText('\\$\\{leadName\\}', leadName);
        copiedDoc.saveAndClose();

        // Retrieve the updated document and presentation files
        const documentFile = DriveApp.getFileById(copiedFile.getId());
        const presentationFile = DriveApp.getFileById(presentationFileId);

        // Send the email with the updated document and presentation as attachments
        GmailApp.sendEmail(leadEmail, subject, '', {
            htmlBody: htmlBody,
            attachments: [
                documentFile.getAs(MimeType.PDF),
                presentationFile.getBlob()
            ]
        });

        // Log after sending the email
        Logger.log('Proposal email sent successfully to: ' + leadEmail);
    } catch (error) {
        Logger.log('Error retrieving files or sending email: ' + error.message);
    }
}

function sendReminderEmail(leadName, leadEmail, date, time) {
    const subject = "Skyvolt Solar | Appointment Reminder";
    const body = `
    Hi ${leadName},

    Just a friendly reminder that your appointment is scheduled for today at ${time}. We hope you're ready!

    Best regards,
    Skyvolt Solar Marketing Team
    `;

    try {
        // Log before sending the email
        Logger.log('Sending reminder email to: ' + leadEmail);

        // Send the reminder email
        GmailApp.sendEmail(leadEmail, subject, body);

        // Log after sending the email
        Logger.log('Reminder email sent successfully to: ' + leadEmail);
    } catch (error) {
        // Log the error message
        Logger.log('Error sending reminder email: ' + error.message);
    }
}

function sendProposalEmail(leadName, leadEmail, pdfFile) {
    const subject = "Skyvolt Solar | Your Custom Proposal";
    const htmlBody = `
    <p>Hi ${leadName},</p>
    <p>Thank you for joining our meeting. Based on the pain points you mentioned, we have created a proposal for you. This proposal is automatically generated and is not finalized. If you think there are any changes that should be made, please let us know.</p>
    <p>Looking forward to your feedback!</p>
    <p>Best Regards,<br><strong>Skyvolt Solar Marketing Team</strong></p>
    `;

    GmailApp.sendEmail(leadEmail, subject, '', {
        htmlBody: htmlBody,
        attachments: [pdfFile]
    });

    Logger.log('Proposal email sent successfully to: ' + leadEmail);
}

function sendFollowUpEmail(leadName, leadEmail) {
    const documentId = '1AsG8afLfr_NU-ZlqVoY2thW1hpF-z7iAF01WmV5a_K4'; // Replace with your Google Document ID

    try {
        // Retrieve the document content
        const doc = DocumentApp.openById(documentId);
        const body = doc.getBody().getText();

        // Replace placeholders with actual values
        const emailBody = body.replace('${leadName}', leadName);

        const subject = "Skyvolt Solar | Follow Up";

        // Log before sending the email
        Logger.log('Sending follow-up email to: ' + leadEmail);

        // Send the follow-up email
        GmailApp.sendEmail(leadEmail, subject, '', { htmlBody: emailBody });

        // Log after sending the email
        Logger.log('Follow-up email sent successfully to: ' + leadEmail);
    } catch (error) {
        // Log the error message
        Logger.log('Error retrieving document or sending email: ' + error.message);
    }
}

  //  function testWebhook() {
  //    var url = "https://proposal-automation.vercel.app/webhook";
  //    var payload = {
  //      key: "value" // Replace with your actual data
  //    };
     
  //    var options = {
  //      method: "post",
  //      contentType: "application/json",
  //      payload: JSON.stringify(payload)
  //    };
     
  //    try {
  //      var response = UrlFetchApp.fetch(url, options);
  //      Logger.log(response.getContentText());
  //    } catch (e) {
  //      Logger.log("Error: " + e.toString());
  //    }
  //  }


function findTranscript(leadName) {
  const folder = DriveApp.getFoldersByName("Meeting Recordings").next();
  const files = folder.getFiles();
  while (files.hasNext()) {
    const file = files.next();
    if (file.getName().includes(leadName)) {
      return file.getBlob().getDataAsString();
    }
  }
  throw new Error("Transcript not found");
}

function test() {
  const folders = DriveApp.getFoldersByName("Meet Recordings");
  if (folders.hasNext()) {
    const folder = folders.next();
    Logger.log('Folder found: ' + folder.getName());
    // Proceed with your logic here
  } else {
    Logger.log('Folder not found');
  }
}
function testfindTranscript() {
    try {
        const folders = DriveApp.getFoldersByName("Meet Recordings");
        if (!folders.hasNext()) {
            throw new Error("Meet Recordings folder not found");
        }
        
        const folder = folders.next();
        const files = folder.getFiles();
        let fileId = null;

        while (files.hasNext()) {
            const file = files.next();
            if (file.getName().includes("jut-vxmj-cjw") && file.getMimeType() === MimeType.GOOGLE_DOCS) {
                fileId = file.getId();
                Logger.log("Found Google Doc with ID: " + fileId);
                break;
            }
        }

        if (fileId) {
            const document = DocumentApp.openById(fileId);
            const transcript = document.getBody().getText();
            sendTranscriptToGemini(transcript);
        } else {
            Logger.log("No Google Doc found with 'jut-vxmj-cjw' in the name.");
        }
    } catch (error) {
        Logger.log('Error: ' + error.message);
    }
}

function sendTranscriptToGemini(transcript) {
    try {
        const response = UrlFetchApp.fetch("https://proposal-automation.vercel.app/webhook", {
            method: "post",
            contentType: "application/json",
            payload: JSON.stringify({ transcript: transcript })
        });

        const summarizedInformation = JSON.parse(response.getContentText()).summary;
        Logger.log('Transcript sent successfully. Received summary: ' + summarizedInformation);

        parseInformationToGoogleDoc(summarizedInformation);
    } catch (error) {
        Logger.log('Error sending transcript: ' + error.message);
        throw new Error("Failed to send transcript to Gemini");
    }
}

function parseInformationToGoogleDoc(executiveSummary) {
    try {
        const fileId = '1AtBw07UvWvvledalCt7iJfHA4aLZWxltnI2w-7JGyjc'; // Use the specific file ID
        const doc = DocumentApp.openById(fileId);
        const body = doc.getBody();
        
        // Hardcoded information for testing
        const businessName = "Skyvolt Solar";
        const personOnPhone = "John Doe";

        // Replace placeholder fields
        body.replaceText('{{Business Name}}', businessName);
        body.replaceText('{{Person On Phone}}', personOnPhone);
        body.replaceText('{{Executive Summary}}', executiveSummary);

        Logger.log('Information successfully added to the document.');
    } catch (error) {
        Logger.log('Error updating document: ' + error.message);
        throw new Error("Failed to update Google Document");
    }
}

function handleSendProposal(leadName, leadEmail, businessName, personOnPhone, tag) {
    const transcript = findTranscriptWithRetry(leadName);
    if (transcript) {
        const executiveSummary = generateExecutiveSummary(transcript);
        generateProposal(leadName, leadEmail, businessName, personOnPhone, executiveSummary, tag);
    } else {
        Logger.log("Transcript not found after retries.");
    }
}

function findTranscriptWithRetry(leadName) {
    let attempts = 0;
    const maxAttempts = 3;
    const waitTime = 15 * 60 * 1000; // 15 minutes

    while (attempts < maxAttempts) {
        const transcript = findTranscript(leadName);
        if (transcript) {
            return transcript;
        }
        Utilities.sleep(waitTime);
        attempts++;
    }
    return null;
}

function findTranscript(leadName) {
    const folders = DriveApp.getFoldersByName("Meet Recordings");
    if (!folders.hasNext()) {
        Logger.log("Meet Recordings folder not found");
        return null;
    }

    const folder = folders.next();
    const files = folder.getFiles();
    while (files.hasNext()) {
        const file = files.next();
        if (file.getName().includes(leadName) && file.getMimeType() === MimeType.GOOGLE_DOCS) {
            const document = DocumentApp.openById(file.getId());
            return document.getBody().getText();
        }
    }
    return null;
}

function generateExecutiveSummary(transcript) {
    // Use AI model to generate executive summary from transcript
    // Placeholder for AI integration
    return "Generated Executive Summary based on transcript.";
}

function generateProposal(leadName, leadEmail, businessName, personOnPhone, executiveSummary, tag) {
    const docId = getProposalIdByTag(tag);
    const doc = DocumentApp.openById(docId);
    const body = doc.getBody();

    // Replace placeholder fields
    body.replaceText('{{Business Name}}', businessName);
    body.replaceText('{{Person On Phone}}', personOnPhone);
    body.replaceText('{{Executive Summary}}', executiveSummary);

    // Add additional information based on tag
    addTagSpecificContent(body, tag);

    doc.saveAndClose();

    // Convert to PDF and send email
    const pdfFile = DriveApp.getFileById(docId).getAs(MimeType.PDF);
    sendProposalEmail(leadName, leadEmail, pdfFile);
}

function getProposalIdByTag(tag) {
    const proposalIds = {
        "scaling": "1AtBw07UvWvvledalCt7iJfHA4aLZWxltnI2w-7JGyjc",
        "lead_generation": "ID_FOR_LEAD_GENERATION",
        "automation": "ID_FOR_AUTOMATION",
        "follow_up": "ID_FOR_FOLLOW_UP",
        "ai": "ID_FOR_AI"
    };
    return proposalIds[tag] || proposalIds["scaling"];
}

function addTagSpecificContent(body, tag) {
    // Add content specific to the tag
    if (tag === "lead_generation") {
        body.appendParagraph("Lead Generation Specific Content");
    } else if (tag === "automation") {
        body.appendParagraph("Automation Specific Content");
    }
    // Add more conditions as needed
}

// Example usage

