import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" })); //setting middlewares
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//routes import

import userRouter from "./routes/user.routes.js";

//routes declaration
app.use("/api/v1/users", userRouter); //url formed: http://localhost:8000/api/v1/users/register

//in app.use("/user" , userRouter) /user become the prefix and the route written in userRouter become suffix thats why url become http://localhost:8000/<prefix i.e api/v1/users>/<suffix i.e. register>

export { app };
