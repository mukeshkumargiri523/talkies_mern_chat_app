const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to DB " + conn.connection.host);
  } catch (err) {
    console.log("Error in MongoDb " + err);
    process.exit();
  }
};

module.exports = { connectDB };
