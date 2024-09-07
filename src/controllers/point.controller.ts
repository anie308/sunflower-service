import User from "../model/user.model";
import Point from "../model/points.model";
import { PointsTypes } from "../types";
import { Request, Response } from "express";

export const addPoints = async (message: PointsTypes) => {
  const { points, username } = message;

  try {
    const user = await User.findOne({ username });
    const userPoints = await Point.findOne({ userId: user._id });
    console.log({ points, username });
    if (userPoints) {
      const currentPoints = userPoints.points;
      const pointsToAdd = Number(points) - Number(currentPoints);
      userPoints.points += pointsToAdd;
      await userPoints.save();
    } else {
      const userId = user._id;
      console.log(userId);
      const newPoints = new Point({ points, userId });
      await newPoints.save();
    }
    console.log("Points updated successfully");
  } catch (error) {
    console.log(error);
  }
};

export const saveTimeStamps = async (message) => {
  const { username, timestamp } = message;

  try {
    const user = await User.findOne({ username });
    const points = await Point.findOne({ userId: user._id });
    points.energyStamp = timestamp;
    await points.save();
  } catch (error) {
    console.log(error);
  }
};

// export const getLeaderBoard = async (req: Request, res: Response) => {
//   try {
//     const points = await Point.find().sort({ points: -1 }).limit(10);
//     const users = await User.find();
//     res.json({
//       status: true,
//       data: points,
//       message: "Leaderboard fetched successfully",
//     });
//   } catch (error) {
//     console.log(error);
//   }
// };

export const getLeaderBoard = async (req: Request, res: Response) => {
  try {
    // Get the top 50 users with the highest points
    const leaderboard = await Point.find()
      .sort({ points: -1 }) // Sort by points in descending order
      .limit(50) // Limit to top 50
      .populate("userId", "username profilePicture level")
      .lean();
    // Populate user details (replace 'name email' with actual fields from User model)
    const result = leaderboard.map((entry) => ({
      user: entry.userId, // This will contain the populated user details
      points: entry.points, // The user's points
    }));

    res.json({
      status: true,
      data: result,
      message: "Leaderboard fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({
      status: false,
      message: "An error occurred while fetching the leaderboard",
    });
  }
};
