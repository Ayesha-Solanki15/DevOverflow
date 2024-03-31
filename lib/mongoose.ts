import mongoose from "mongoose";

let isConnected: boolean = false;

export const connectToDatabase = async () => {
  mongoose.set("strictQuery", true);
  // this will help us to avoid field queries
  if (!process.env.MONGODB_URL) {
    return console.log("Missing MONGODB_URL");
  }
  if (isConnected) {
    return console.log("mongoDB already connected");
  }
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      dbName: "devoverflow",
    });
    isConnected = true;
    console.log("Connected to database");
  } catch (error) {
    console.log("Error connecting to database");
  }
};
