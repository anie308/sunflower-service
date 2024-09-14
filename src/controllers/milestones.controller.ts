import Point from "../model/points.model";
import Milestone from "../model/milestones.model";
import User from "../model/user.model";
import { Request, Response } from "express";

export const createMilestone = async (req: Request, res: Response) => {
  try {
    const { count, points } = req.body;

    if (!count || !points) {
      res.status(400).json({
        status: false,
        message: "Count and Points are required.",
      });
    } else {
      const milestone = new Milestone({ count, points });

      await milestone.save();
      res.status(201).json({
        message: "Milestone created successfully",
        status: true,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error, status: false });
  }
};

export const getUserMileStones = async (req: Request, res: Response) => {
  const { username } = req.params;
  try {
    // Fetch the user and populate completed milestones
    const user = await User.findOne({ username })
      .populate("milestonesCompleted")
      .lean();

    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    // Safely handle the case when milestonesCompleted might be undefined
    const completedMilestones = user.milestonesCompleted || [];
    const completedMilestoneIds = completedMilestones.map(
      (milestone: any) => milestone._id
    );

    // Fetch all milestones
    const allMilestones = await Milestone.find().lean();

    // Ensure that allMilestones is an array
    if (!Array.isArray(allMilestones) || allMilestones.length === 0) {
      return res
        .status(404)
        .json({ status: false, message: "No milestones found" });
    }

    // Map through all milestones and determine if each is claimed
    const milestonesWithStatus = allMilestones.map((milestone: any) => ({
      ...milestone,
      claimed: completedMilestoneIds.includes(milestone._id),
    }));

    return res.status(200).json({
      status: true,
      milestones: milestonesWithStatus,
    });
  } catch (error) {
    console.error("Error fetching user milestones:", error);
    return res
      .status(500)
      .json({ status: false, error: "Internal server error" });
  }
};

export const completeMilestone = async (req: Request, res: Response) => {
  try {
    const { username, milestoneId } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }
    const points = await Point.findOne({ userId: user._id });
    const milestone = await Milestone.findById(milestoneId);
    if (!milestone) {
      return res
        .status(404)
        .json({ status: false, message: "Milestone not found" });
    }
    user.milestonesCompleted.push(milestone._id);
    const reward = milestone.points;
    const currentPoints = points.points;
    const updatedPoints = currentPoints + reward;
    await Point.findByIdAndUpdate(points._id, { points: updatedPoints });
    await user.save();
    res.status(200).json({
      status: true,
      message: "Milestone completed successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error, status: false });
  }
};
