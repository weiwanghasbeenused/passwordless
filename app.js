const cors = require("cors");
const express = require("express");
const nodeMailer = require("nodemailer");
const jwt = require('jsonwebtoken');
let multer = require('multer');
let upload = multer();
require('dotenv').config()

// Set up email
const transport = nodeMailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
  }
});

// Make email template for magic link
const emailTemplate = ({ username, link }) => `
  <h2>Hey ${username}</h2>
  <p>Here's the login link you just requested:</p>
  <p>${link}</p>
`
// Generate token
const makeToken = (email) => {
  const expirationDate = new Date();
  expirationDate.setHours(new Date().getHours() + 1);
  return jwt.sign({ email, expirationDate }, process.env.JWT_SECRET_KEY);
};
const PORT = process.env.PORT || 4000;
const site_url = process.env.SITE_URL || 'http://localhost';
const app = express();
app.use(express.static(__dirname + "/public"));
// app.use(bodyParser.urlencoded({ extended: false }))
// app.use(bodyParser.urlencoded({ extended: false }));
// Set up middleware
app.use(cors());
app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

// Login endpoint
app.post("/login", upload.none(), (req, res) => {
    const { email } = req.body;
    console.log(req.body);
    console.log(req.body.email);
    if (!email) {
      res.status(404);
      res.send({
        message: "You didn't enter a valid email address.",
      });
    }
    const token = makeToken(email);
    const mailOptions = {
        from: "You Know",
        html: emailTemplate({
          email,
          link: `${site_url}:${PORT}/account?token=${token}`,
        }),
        subject: "Your Magic Link",
        to: email,
    };
    return transport.sendMail(mailOptions, (error) => {
        if (error) {
          res.status(404);
          res.send("Can't send email.");
        } else {
          res.status(200);
          res.send(`Magic link sent. : ${site_url}:${PORT}/account?token=${token}`);
        }
    });
});

const isAuthenticated = (req, res) => {  const { token } = req.query
  if (!token) {
    res.status(403)
    res.send("Can't verify user.")
    return
  }
  let decoded
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
  }
  catch {
    res.status(403)
    res.send("Invalid auth credentials.")
    return
  }
  if (!decoded.hasOwnProperty("email") || !decoded.hasOwnProperty("expirationDate")) {
    res.status(403)
    res.send("Invalid auth credentials.")
    return
  }
  const { expirationDate } = decoded
  if (expirationDate < new Date()) {
    res.status(403)
    res.send("Token has expired.")
    return
  }
  res.status(200)
  res.send("User has been validated.")
}

app.get("/account", (req, res) => {
    isAuthenticated(req, res)
});

// Start up the server on the port defined in the environment
const server = app.listen(PORT, () => {
  console.info("Server running on port " + PORT)
})

// export default server