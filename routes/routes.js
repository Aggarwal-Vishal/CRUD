const express = require("express");
const router = express.Router();
const User = require("../models/users");
const multer = require("multer");
const fs = require("fs");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});

var upload = multer({
  storage: storage,
}).single("image");

//Insert an user into database route
router.post("/add", upload, (req, res) => {
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    image: req.file.filename,
  });
  user
    .save()
    .then(() => {
      req.session.message = {
        type: "success",
        message: "user added successfully",
      };
      res.redirect("/");
    })
    .catch((err) => {
      res.json({ message: err.message, type: "danger" });
    });
});

// Home route
router.get("/", (req, res) => {
  const message = req.session.message || null;
  req.session.message = null;
  User.find({})
    .then((users) => {
      res.render("index", {
        title: "Home Page",
        users: users,
        message: message,
      });
    })
    .catch((err) => {
      res.status(500).json({ message: err.message });
    });
});

// Add router

router.get("/add", (req, res) => {
  res.render("add_users", { title: "Add Users" });
});

router.get("/edit/:id", (req, res) => {
  let id = req.params.id;
  User.findById(id)
    .then((user) => {
      if (!user) {
        res.redirect("/");
      } else {
        res.render("edit_users", {
          title: "Edit User",
          user: user,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.redirect("/");
    });
});

//Update user route

router.post("/update/:id", upload, async (req, res) => {
  let id = req.params.id;
  let new_image = "";

  if (req.file) {
    new_image = req.file.filename;
    try {
      fs.unlinkSync("./uploads" + req.body.old_image);
    } catch (err) {
      console.log("Error deleting old image", err);
    }
  } else {
    new_image = req.body.old_image;
  }
  try {
    await User.findByIdAndUpdate(id, {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      image: new_image,
    });

    req.session.message = {
      type: "success",
      message: "User updated successfully",
    };
    res.redirect("/");
  } catch (err) {
    res.json({ message: err.message, type: "danger" });
  }
});

// Delete user route

router.get("/delete/:id", async (req, res) => {
  let id = req.params.id;

  try {
    const result = await User.findByIdAndDelete(id);

    if (result.image != "") {
      try {
        fs.unlinkSync("./uploads/" + result.image);
      } catch (err) {
        console.log("Error deleting image", err);
      }
    }
    req.session,
      (message = {
        type: "info",
        message: "User deleted successfully",
      });
    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.join({ message: err.message });
  }
});

module.exports = router;
