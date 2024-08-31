const router = require("express").Router();
import { getReferredUsers, getUser, registerUser } from "../controllers/user.controller";

router.post("/register", registerUser);
router.get("/get-user", getUser);
router.get("/referrals", getReferredUsers);


export default router;
