import express from "express";
import cookieParser from "cookie-parser";
import cors from 'cors'

const app = express();

const allowedOrigins = [process.env.CORS_ORIGIN];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) {
            // For requests with no origin (like mobile apps or curl requests)
            callback(null, true);
        } else if (allowedOrigins.some(url => origin.startsWith(url))) {
            // Allow origin if it starts with any of the allowed origins
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({
    limit: "16kb"
}));

app.use(express.urlencoded({extended: true, limit: "16kb"}));

app.use(express.static("public"))

app.use(cookieParser())

//routes import 

import userRouter from './src/routes/user.routes.js'
import commentRouter from "./src/routes/comment.routes.js"
import videoRouter from "./src/routes/video.routes.js"
import playlistRouter from "./src/routes/playlist.routes.js"
import likeRouter from "./src/routes/like.routes.js"
import subscriptionRouter from "./src/routes/subscription.routes.js"
import tweetRouter from "./src/routes/tweet.routes.js"
import dashboardRouter from "./src/routes/dashboard.routes.js"
import healthcheckRouter from "./src/routes/healthcheck.routes.js"
//routes declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/dashboard", dashboardRouter)
app.use("/api/v1/healthcheck", healthcheckRouter)
export {app}