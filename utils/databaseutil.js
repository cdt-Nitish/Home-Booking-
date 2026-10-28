const mongo=require("mongodb");

const MongoClient =mongo.MongoClient;

const url =
  "mongodb://airbnb-1:neeraj15ab@ac-tomysuj-shard-00-00.txrf0w9.mongodb.net:27017,ac-tomysuj-shard-00-01.txrf0w9.mongodb.net:27017,ac-tomysuj-shard-00-02.txrf0w9.mongodb.net:27017/?ssl=true&replicaSet=atlas-12jxjk-shard-0&authSource=admin&appName=Cluster0";

let _db;


  const mongoConnect=(callback)=>{
    MongoClient.connect(url)
    .then(client=>{
        callback();
        _db=client.db('airbnb-1')
    }).catch(err=>{
        console.log('Error while connecting to mongo',err);
        
    })
  }

const getDB=()=>{
  if(!_db){
    throw new Error('mango not connected');
  }
  return _db;
}

  exports.mongoConnect= mongoConnect;
  exports.getDB=getDB;