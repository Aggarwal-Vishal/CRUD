require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 4002;

mongoose
  .connect(process.env.DB_URI, {})
  .then(() => console.log("Connected to database"))
  .catch((err) => console.log("Mongo connection error", err));

const db = mongoose.connection;

db.on("error", (error) => console.log(error));
db.once("open", () => console.log("Connected"));

//middleware

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("uploads"));

// session middleware
app.use(
  session({
    secret: "mysecret",
    saveUninitialized: true,
    resave: false,
  })
);

app.use((req, res, next) => {
  if (req.session.message) {
    res.locals.message = req.session.message;
    delete req.session.message;
  }
  next();
});

// setting ejs file

app.set("view engine", "ejs");

//route setting

app.use("", require("./routes/routes"));

app.listen(PORT, () => {
  console.log(`server started at htttp://localhost:${PORT}`);
});
