import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cron from "node-cron";
import { deleteExpiredTrashedFiles } from "./controllers/trashCntroller.js";
import helmet from "helmet";
import cors from "cors";
import route from "./routes/index.js";
import error from "./middleware/error.js";
import multer from "multer";
import http from "http";
import { Server } from "socket.io";

const port = process.env.PORT || 8800;

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.BASE_URL,
    credentials: true,
  },
});

let videoState = { isPlaying: false, currentTime: 0 };
let audioCallState = { isCallStarted: false, isMuted: false };

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  //Voice

  socket.emit("audioCallState", audioCallState);

  // Handle the audio call start
  socket.on("startAudioCall", () => {
    audioCallState.isCallStarted = true;
    io.emit("audioCallState", audioCallState);
  });

  // Handle the audio call end
  socket.on("stopAudioCall", () => {
    audioCallState.isCallStarted = false;
    io.emit("audioCallState", audioCallState);
  });

  // Handle the mute toggle
  socket.on("toggleMute", () => {
    audioCallState.isMuted = !audioCallState.isMuted;
    io.emit("audioCallState", audioCallState);
  });

  socket.on("offer", (data) => socket.broadcast.emit("offer", data));
  socket.on("answer", (data) => socket.broadcast.emit("answer", data));
  socket.on("ice-candidate", (data) =>
    socket.broadcast.emit("ice-candidate", data)
  );
  //Video Setting
  socket.emit("videoState", videoState);

  socket.on("togglePlay", ({ state, currentTime , videoId}) => {
    videoState = { isPlaying: state === "play", currentTime , videoId};
    io.emit("videoState", videoState);
  });
  socket.on("syncTime", (currentTime) => {
    videoState.currentTime = currentTime;
    io.emit("videoState", videoState);
  });

  socket.on("seekVideo", (currentTime, videoId) => {
    videoState.currentTime = currentTime;
    io.emit("videoState", videoState);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const upload = multer();
app.use(upload.none());
app.use(cookieParser());
app.use(helmet());
app.use(
  cors({
    origin: process.env.BASE_URL,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    exposedHeaders: ["X-Auth-Token", "Authorization"],
  })
);

cron.schedule("0 0 * * *", async () => {
  console.log("Running scheduled task to delete expired trashed files...");
  try {
    await deleteExpiredTrashedFiles();
    console.log("Expired trashed files deleted successfully.");
  } catch (error) {
    console.error("Error deleting expired trashed files:", error.message);
  }
});

app.use("/", route);

app.get("/", (req, res) => {
  res.send("Hello from server");
});

app.use(error);

server.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});
