const router = require("express").Router();
import { getLeaderBoard } from "controllers/point.controller";
import { getReferredUsers, getUser, registerUser } from "../controllers/user.controller";

router.post("/register", registerUser);
router.get("/get-user", getUser);
router.get("/referrals", getReferredUsers);
router.get("/leaderboard", getLeaderBoard);


export default router;
