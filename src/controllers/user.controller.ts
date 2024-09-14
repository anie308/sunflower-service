import { generateReferralCode } from "../utils";
import User from "../model/user.model";
import { Request, Response } from "express";
import Point from "../model/points.model";

export const registerUser = async (req: Request, res: Response) => {
  const { username, referralCode, premium, profilePicture } = req.body;

  try {
    // Check if the username already exists
    const alreadyExists = (await User.findOne({ username })) as string;
    if (alreadyExists) {
      return res.status(200).json({ message: "Username already exists" });
    }

    // Generate a new referral code for the new user
    const newReferralId = generateReferralCode();

    // Create a new user
    const newUser = new User({
      username,
      referralCode: newReferralId,
      premium,
      profilePicture,
    });

    // Save the new user
    await newUser.save();

    const initialPoints = 30000;
    const additionalPoints = 500;
    const newPoints = new Point({
      userId: newUser._id,
      points: initialPoints + additionalPoints,
    });

    await newPoints.save();

    // If there is a referral code, find the referring user and update their referrals
    if (referralCode) {
      const referredBy = await User.findOne({ referralCode });
      if (referredBy) {
        referredBy.referrals.push(newUser._id);
        const referredPoint = Point.findOne({ userId: referredBy._id });
        if (referredPoint) {
          (await referredPoint).points += additionalPoints; // Add 100,000 points to the referrer
        }
        await referredBy.save();
        console.log(
          `Updated referrals for ${referredBy.username}: ${referredBy.referrals}`
        );
      }
    }

    return res.status(201).json({
      statusCode: 201,
      message: "User registered successfully",
      status: true,
    });
  } catch (error) {
    console.log("Error registering user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getUser = async (req: Request, res: Response) => {
  const { username } = req.query;
  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    } else {
      return res.status(200).json({
        data: user,
        message: "User Fetched Successfully",
        status: true,
      });
    }
  } catch (error) {
    // console.error("Error authenticating user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getReferredUsers = async (req: Request, res: Response) => {
  const { username } = req.query;

  try {
    const user = await User.findOne({ username }).populate(
      "referrals",
      "username profilePicture premium"
    ); // Populate the referred users with only the required fields
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    } else {
      const referrals = user.referrals;
      const referralsWithPoints = await Promise.all(
        referrals.map(async (referral: any) => {
          const userPoints = await Point.findOne({ userId: referral._id });
          return {
            ...referral._doc,
            points: userPoints ? userPoints.points : 20000, // If no points found, default to 0
          };
        })
      );
      // Return the referred users in the response
      return res.status(200).json({
        data: referralsWithPoints,
        message: "Referrals Fetched Successfully",
        status: true,
      });
    }
  } catch (error) {
    console.log("Error getting referred users:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const saveOnboarding = async (req: Request, res: Response) => {
  const { username } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ status: false, error: "User not found" });
    } else {
      user.onboarding = true;
      await user.save();
      return res
        .status(200)
        .json({
          status: true,
          message: "Onboarding status updated successfully",
        });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, error: "Internal server error" });
  }
};

// export const updateUser = async (req: Request, res: Response) => {
//   const { username,  level } = req.body;

//   try {
//     const user = await User.findOne({ username });

//     if (!user) {
//       return res.status(400).json({ error: "User not found" });
//     }

//     if (level !== undefined) user.level = level;

//   } catch (error) {
//     res.json({
//       error: error||  "Internal server error",
//       status: false,
//     })
//   }
// }
