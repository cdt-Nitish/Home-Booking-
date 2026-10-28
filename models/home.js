const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const homeSchema = new mongoose.Schema({
  houseName: { type: String, required: true },
  price: { type: Number, require: true },
  location: { type: String, require: true },
  rating: { type: Number, require: true },
  image: { type: String },
  description: { type: String },
});

// homeSchema.pre('findOneAndDelete',async function(next){
//   const homeId=this.getQuery()._id;
//   await favourite.deleteMany({homeId:homeId});
//   // next();
// })

module.exports = mongoose.model("Home", homeSchema);
