import mongoose from "mongoose";

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Database Connected"))
  .catch((err) => console.log("db connection failed:", err.message || err));
