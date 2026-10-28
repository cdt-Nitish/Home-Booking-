const { check, validationResult } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcryptjs");

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    pageTitle: "Add Home to airbnb",
    currentPage: "login",
    isLoggedIn: req.isLoggedIn,    
    oldInput: { email: "", password: "" },
    errors: [],
    user: req.session.user,
  });
};

//* for checking the user after sign up


exports.postLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const loginError = () =>
      res.status(422).render("auth/login", {
        pageTitle: "Login",
        currentPage: "login",
        isLoggedIn: false,
        errors: ["Invalid email or password"],
        oldInput: { email },
        user: {},
      });

    // 1. Find the user in MongoDB
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    // 2. Check whether the user exists
    if (!user) {
      return loginError();
    }

    // 3. Compare the entered password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return loginError();
    }

    // 4. Set the login session
    req.session.isLoggedIn = true;
    req.session.user = {
      _id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      userType: user.userType,
    };

    // 5. Save the session before redirecting
    await new Promise((resolve, reject) => {
      req.session.save((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    return res.redirect("/");
  } catch (err) {
    return next(err);
  }
};


exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
};

exports.getSignUp = (req, res, next) => {
  res.render("auth/signup", {
    pageTitle: "Create your account",
    currentPage: "signup",
    isLoggedIn: req.isLoggedIn,
    errors: [],
    oldInput: { firstName: "", lastName: "", email: "",  },
    user: req.session.user,
  });
}
exports.postSignUp = [
  check("firstName")
    .trim()
    .isLength({ min: 2 })
    .withMessage("First name should be atleast 2 characters long")
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("first name should be contain only alphabet"),

  check("lastName")
    .matches(/^[A-Za-z\s]*$/)
    .withMessage("last name should be contain only alphabet"),

  check("email")
    .isEmail()
    .withMessage("Please enter valid email"),
  
  check("password")
    .isLength({min:6})
    .withMessage("Password should be atleast 6 character long.")
    .matches(/[A-Z]/)
    .withMessage("Password should contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password should contain at least one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password should contain at least one number")
    .matches(/[\W_]/)
    .withMessage("Password should contain at least one special character")
    .trim(),

  check("confirmPassword")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    })
    .withMessage("Passwords do not match")
    .trim(),  

  check("userType")
    .notEmpty()
    .withMessage("Please select a user type")
    .isIn(["host", "guest"])
    .withMessage("Invalid user type selected"),

  check("terms")
    .notEmpty()
    .withMessage("Please agree to the terms and conditions"),


  (req, res, next) => {
    const {firstName,lastName,email,password,userType,terms}=req.body;
    const errors=validationResult(req);
    
    if(!errors.isEmpty()){
      return res.status(422).render("auth/signup", {
        pageTitle: "Signup",
        currentPage: "signup",
        isLoggedIn: req.isLoggedIn,
        errors: errors.array().map((err) => err.msg),
        oldInput: { firstName, lastName, email, password, userType },
        user: req.session.user,
      });
    }

    //* Pass Hashing 

      bcrypt.hash(password,12).then(hashedPassword=>{
        const user=new User({firstName,lastName,email: email.trim().toLowerCase(),password:hashedPassword,userType});
        return user.save();
      }).then(()=>{
        res.redirect('/login');
      }).catch(err=>{
          return res.status(422).render("auth/signup", {
            pageTitle: "Signup",
            currentPage: "signup",
            isLoggedIn: req.isLoggedIn,
            errors:[err.message],
            oldInput: { firstName, lastName, email, password, userType },
            user: req.session.user
          })
  })

  },
];
