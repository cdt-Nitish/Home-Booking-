// Core Module
const path = require('path');
require("dotenv").config();

// External Module
const express = require('express');
const session=require('express-session')
const mongoDBStore=require('connect-mongodb-session')(session);
const { default: mongoose } = require('mongoose');
const multer=require('multer');
//Local Module
const storeRouter = require("./routes/storeRouter")
const hostRouter = require("./routes/hostRouter")
const authRouter=require("./routes/authRouter")
const rootDir = require("./utils/pathUtil");
const errorsController = require("./controllers/errors");

// const { collection } = require('./models/favourite');


const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const DB_Path = process.env.Mongo_DB;

const store = mongoDBStore({
  uri: DB_Path,
  collection: "session",
});

//* Public files 
app.use(express.static(path.join(rootDir, "public")));
app.use("/uploads",express.static(path.join(rootDir,'uploads')))
app.use("/host/uploads", express.static(path.join(rootDir, "uploads")));
app.use("/homes/uploads", express.static(path.join(rootDir, "uploads")));
app.use("/upload", express.static(path.join(rootDir, "uploads")));
app.use("/host/upload", express.static(path.join(rootDir, "uploads")));
app.use("/homes/upload", express.static(path.join(rootDir, "uploads")));
app.use(express.urlencoded({extended:true}));

// * Random string
 const randomString=(length)=>{
  const char='qwertyuiopsdfghjklzxcvbnm';
  let result='';
  for(let i=0;i<length;i++){
    result+=char.charAt(Math.floor(Math.random()*char.length))
  }
  return result;
 }
//* Multer 
const storage=multer.diskStorage({
  destination:(req,file,cb)=>{
    cb(null,'uploads/');
  },
  filename:(req,file,cb)=>{
    cb(null,randomString(10)+'-'+file.originalname);
  }
})

//* file filter
const fileFilter=(req,file,cb)=>{
  if(file.mimetype==='image/jpg' || file.mimetype==='image/png' || file.mimetype==='image/jpeg'){
    cb(null,true);
  }else{
    cb(null,false);
  }
}

const multerOption={
  // dest :"uploads/"
  storage,
  fileFilter:fileFilter
}

app.use(multer(multerOption).single('image'));




//* Session 
app.use(session({
  secret:"secret_key",
  resave:false,
  saveUninitialized:false,
  store:store
}))


//* Reading Cookies 
app.use((req,res,next)=>{
  req.isLoggedIn = Boolean(req.session.isLoggedIn);
  res.locals.isLoggedIn = req.isLoggedIn;
  res.locals.user = req.session.user || null;
  next();
})

app.use("/host", (req, res, next) => {
  if (!req.isLoggedIn) {
    return res.redirect("/login");
  }

  if (req.session.user?.userType !== "host") {
    return res.redirect("/");
  }

  next();
});

app.use(authRouter);
app.use(storeRouter);

app.use("/host", hostRouter);


app.use(errorsController.pageNotFound);

const PORT = 7000;


mongoose.connect(DB_Path).then(()=>{
  console.log('Connected to mongo'); 
  app.listen(PORT,()=>{
    console.log(`Server running on address http://localhost:${PORT}`)});
  }).catch((err)=>{
    console.log('Error while connection to mongoDB',err);
  
})