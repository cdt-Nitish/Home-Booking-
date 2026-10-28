const Home = require("../models/home");
const fs=require('fs');
exports.getAddHome = (req, res, next) => {
  res.render("host/edit-home", {
    pageTitle: "Add Home to airbnb",
    currentPage: "addHome",
    editing: false,
    isLoggedIn: req.isLoggedIn,
    user: req.session.user,
  });
};

exports.getEditHome = (req, res, next) => {
  const homeId = req.params.homeId;
  const editing = req.query.editing === "true";

  Home.findById(homeId)
    .then((home) => {
      if (!home) {
        return res.redirect("/host/host-home-list");
      }
      res.render("host/edit-home", {
        home,
        pageTitle: "Edit your Home",
        currentPage: "host-homes",
        editing,
        isLoggedIn: req.isLoggedIn,
        user: req.session.user,
      });
    })
    .catch(next);
};

exports.getHostHomes = (req, res, next) => {
  Home.find()
    .then((registeredHomes) => {
      res.render("host/host-home-list", {
        registeredHomes,
        pageTitle: "Host Homes List",
        currentPage: "host-homes",
        isLoggedIn: req.isLoggedIn,
        user: req.session.user,
      });
    })
    .catch(next);
};

exports.postAddHome = (req, res, next) => {


  const { houseName, price, location, rating, description } = req.body;

  console.log(req.file);

if (!req.file) {
  console.log("No image provided or image type not matched");
  return res.status(422).redirect("/host/add-home");
  // return res.status(422).send("No image type not matched")
}

// const photoUrl = req.file.path.replace(/\\/g, "/");
const photoUrl = "uploads/"+req.file.filename;

console.log(photoUrl);


  const home = new Home({
    houseName,
    price,
    location,
    rating,
    image:photoUrl,
    description,
  });
  home
    .save()
    .then(() => res.redirect("/host/host-home-list"))
    .catch(next);
};

exports.postEditHome = (req, res, next) => {
  const { id, houseName, price, location, rating, description } =
    req.body;

  // const photoUrl = req.file.path;

  Home.findById(id)
    .then((home) => {
      home.houseName = houseName;
      home.price = price;
      home.location = location;
      home.rating = rating;
      // home.image = image;
      home.description = description;

      if(req.file){
        fs.unlink(home.image,(err)=>{//*Deleting previous file
          if(err){
            console.log("Error while deleting image",err);
          }
        })
        home.image= "uploads/"+req.file.filename;
      }

      home
        .save()
        .then((result) => {
          console.log("Home Updated", result);
        })
        .catch((err) => {
          console.log("Error while updating", err);
        });
      res.redirect("/host/host-home-list");
    })
    .catch((err) => {
      console.log("error while finding home", err);
    });
};

exports.postDeleteHome = (req, res, next) => {
  const homeId = req.params.homeId;
  Home.findByIdAndDelete(homeId)
    .then(() => res.redirect("/host/host-home-list"))
    .catch(next);
};
