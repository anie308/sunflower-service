import User from "../model/user.model";
import Bonus from "../model/bonus.model";
import { Request, Response } from "express";
import Point from "../model/points.model";

const MILLISECONDS_IN_A_DAY = 24 * 60 * 60 * 1000; // One day in milliseconds

export const handleDailyLoginBonus = async (req: Request, res: Response) => {
  const { username } = req.body; // Assuming you pass userId from the frontend

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user already has a LoginBonus record
    const points = await Point.findById(user._id);
    const loginBonus = await Bonus.findById(user._id);

    // If the user doesn't have a record, create a new one
    if (!loginBonus) {
      const newBonus = new Bonus({
        userId: user._id,
        lastLogin: new Date(),
        loginStreak: 1, // Start the streak
        bonusCollected: true, // First bonus collected
      });

      // Optionally, update the user's points or rewards
      points.points += calculateBonus(1); // For day 1
      await user.save();

      await newBonus.save();
      return res.status(200).json({
        status: true,
        message: "Daily bonus awarded for the first login!",
        loginStreak: 1,
        // points: user.points,
      });
    }

    const currentTime = new Date();
    const lastLoginTime = new Date(loginBonus.lastLogin);
    const timeDifference = currentTime.getTime() - lastLoginTime.getTime();

    // Check if the user is eligible for a new bonus (24 hours must have passed)
    if (timeDifference >= MILLISECONDS_IN_A_DAY) {
      // Reset login streak if more than 48 hours (2 days) have passed
      if (timeDifference >= MILLISECONDS_IN_A_DAY * 2) {
        loginBonus.loginStreak = 0; // Reset streak if missed multiple days
      }

      // Award the bonus
      loginBonus.loginStreak += 1;
      loginBonus.bonusCollected = true; // Mark bonus as collected for today
      loginBonus.lastLogin = currentTime; // Update last login time

      // Optionally, update the user's points or rewards
      const bonusPoints = calculateBonus(loginBonus.loginStreak);
      points.points += bonusPoints;
      await user.save();

      await loginBonus.save();

      return res.status(200).json({
        status: true,
        message: "Daily bonus awarded!",
        // loginStreak: loginBonus.loginStreak,
        // points: user.points,
        // bonusPoints,
      });
    } else {
      // If the user already collected the bonus for today
      return res.status(400).json({
        message: "Bonus already collected for today",
        loginStreak: loginBonus.loginStreak,
      });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};

// Example function to calculate bonus based on streak
const calculateBonus = (streak: number): number => {
  // Example bonus logic: Increase bonus with streak
  if (streak <= 5) return 50; // First 5 days, give 50 points
  else if (streak <= 10) return 100; // Next 5 days, give 100 points
  return 150; // After 10 days, give 150 points
};
