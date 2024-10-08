import express from "express";
require("dotenv").config();
import cors from "cors";
import http from "http";
import morgan from "morgan";
import "./db";
import bot from "./bot";
import WebSocketService from "./ws";
const app = express();
const port = process.env.PORT || 4000;
import userRoute from "./routes/user.route";
import taskRouter from "./routes/task.route";
import pingRouter from "./routes/ping.route";
import milestoneRouter from './routes/milestones.route'
import boostRouter from './routes/boosts.route'
import bonusRouter from './routes/bonus.route'
// import cabalRouter from "./routes/cabal.route";

//express app
app.use(cors({ origin: true }));
app.use(express.json());
app.use(morgan("dev"));

app.use((req, res, next) => {
  const allowedOrigins = [
    "https://sunflower-flame.vercel.app/",
    "https://23d8-102-90-65-72.ngrok-free.app",
    "localhost:5173",
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/api/user", userRoute);
app.use("/api/task", taskRouter);
app.use("/api/ping", pingRouter);
app.use("/api/milestone", milestoneRouter);
app.use("/api/boost", boostRouter);
app.use("/api/bonus", bonusRouter);
// app.use("/api/cabal", cabalRouter);

const server = http.createServer(app);
WebSocketService(server);

server.listen(port, () => {
  console.log(`Server listening on port localhost:${port}`);
  bot.launch();
});
