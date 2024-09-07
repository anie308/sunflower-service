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

export const getLeaderBoard = async (req: Request, res: Response) => {
  try {
    const points = await Point.find().sort({ points: -1 }).limit(10);
    res.json({
      status: true,
      data: points,
      message: "Leaderboard fetched successfully",
    });
  } catch (error) {
    console.log(error);
  }
};
