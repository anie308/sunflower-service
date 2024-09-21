import mongoose from "mongoose";

const bonusSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
      unique: true, // Ensures one bonus entry per user
    },
    lastLogin: {
      type: Date,
      default: Date.now, // Set the default to the current time
      required: true,
    },
    loginStreak: {
      type: Number,
      default: 0, // Default streak starts at 0
    },
    bonusCollected: {
      type: Boolean,
      default: false, // Default bonus collected is false
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
  }
);

const Bonuses = mongoose.model("Bonus", bonusSchema);

export default Bonuses;
