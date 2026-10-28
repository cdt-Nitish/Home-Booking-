
const Home = require("../models/home");
const User=require("../models/user")
const path=require('path');
const rootDir=require('../utils/pathUtil');

exports.getIndex = (req, res, next) => {
  Home.find()
    .then((registeredHomes) => {
      res.render("store/index", {
        registeredHomes,
        pageTitle: "airbnb Home",
        currentPage: "index",
        isLoggedIn: req.isLoggedIn,
        user: req.session.user,
      });
    })
    .catch(next);
};

exports.getHomes = (req, res, next) => {
  Home.find()
    .then((registeredHomes) => {
      res.render("store/home-list", {
        registeredHomes,
        pageTitle: "Homes List",
        currentPage: "Home",
        isLoggedIn: req.isLoggedIn,
        user: req.session.user,
      });
    })
    .catch(next);
};

exports.getBookings = (req, res, next) => {
  res.render("store/bookings", {
    pageTitle: "My Bookings",
    currentPage: "bookings",
    isLoggedIn: req.isLoggedIn,
    user: req.session.user,
  });
};
// *Not much better for big data
// exports.getFavouriteList = (req, res, next) => {
//   Favourite.find().then((favouriteId) => {
//     favouriteId = favouriteId.map((fav) => fav.homeId.toString());

//     Home.find().then((registeredHomes) => {
//         // console.log(favouriteId,registeredHomes);

//         const favouriteHomes = registeredHomes.filter((home) =>
//           favouriteId.includes(home._id.toString()),
//         );
        // res.render("store/favourite-list", {
        //   favouriteHomes,
        //   pageTitle: "My Favourites",
        //   currentPage: "favouriteId",
        // });
//       })
//       .catch(next);
//   });
// };

// * A better version 

exports.getFavouriteList= async (req,res,next)=>{
  const userID = req.session.user._id;
  const user= await User.findById(userID).populate('favourites')
    res.render("store/favourite-list", {
      favouriteHomes:user.favourites,
      pageTitle: "My Favourites",
      currentPage: "favouriteId",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });

}

exports.postAddToFavourite = async (req, res, next) => {
  const homeId = req.body.id;
  const userID = req.session.user._id;
  const user = await User.findById(userID);

  if(!user.favourites.includes(homeId)){
    user.favourites.push(homeId);
    await user.save();
  }
  

     res.redirect("/favourites");
};

exports.postRemoveFromFavourite = async (req, res, next) => {
  const homeId = req.params.homeId;
  const userID = req.session.user._id;
  const user = await User.findById(userID);

  if (user.favourites.includes(homeId)) {
    user.favourites = user.favourites.filter(fav=> fav!=homeId);
    await user.save();
    }
    res.redirect("/favourites");
};

exports.getHomeDetails = (req, res, next) => {
  const homeId = req.params.homeId;
  Home.findById(homeId)
    .then((home) => {
      if (!home) {
        return res.redirect("/homes");
      }
      res.render("store/home-detail", {
        home,
        pageTitle: "Home Detail",
        currentPage: "Home",
        isLoggedIn: req.isLoggedIn,
        user: req.session.user,
      });
    })
    .catch(next);
};

exports.getHouseRules = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect("/login");
  }

  const HomeId = req.params.homeId;

  const rulesFileName = "rules.pdf";
  const filePath = path.join(rootDir, "rules", rulesFileName);

  res.download(filePath, "Rules.pdf", (err) => {
    if (err && !res.headersSent) {
      next(err);
    }
  });
};