import sendEmail from "./sendMail.js";

const sendEmailToAddedUsers = async (req, res, next) => {
  const { emails, copyUrl, selectedFile } = req.body;
  console.log("selected file", selectedFile);
  console.log("copy url", copyUrl);

  const subject = `File invitations`;

  const html = `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f7f6;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          }
          h1 {
            color: #0073e6;
            font-size: 24px;
            text-align: center;
          }
          p {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 15px;
          }
          .highlight {
            font-weight: bold;
            color: #0073e6;
          }
          .button {
            display: inline-block;
            background-color: #0073e6;
            color: #ffffff;
            padding: 12px 20px;
            text-align: center;
            text-decoration: none;
            border-radius: 4px;
            font-size: 16px;
            margin-top: 20px;
          }
          .footer {
            text-align: center;
            font-size: 12px;
            color: #777;
            margin-top: 30px;
          }
          .footer a {
            color: #0073e6;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Access Granted</h1>
          <p>You have been granted access to the file <span class="highlight">${selectedFile.name}</span>.</p>
          <p>You can view or download the file from the following link:</p>
          <p><a href="${copyUrl}" class="button">Access File</a></p>
          <p>Thank you for using our service!</p>
          <div class="footer">
            <p>If you have any questions, feel free to <a href="mailto:sadibwrites@gmail.com">contact us</a>.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const data = { subject, html };

  try {
    console.log("Sending emails to: ", emails);

    await Promise.all(
      emails.map(email => sendEmail(email, data, res))
    );

    res.status(200).json({ message: "Emails sent successfully" });
  } catch (error) {
    console.error("Error sending emails:", error);
    res.status(500).json({ message: "Failed to send some or all emails", error });
  }
};

export default sendEmailToAddedUsers;
