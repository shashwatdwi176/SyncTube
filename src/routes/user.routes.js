import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"

const router = Router();

router.route("/register").post(
    upload.fields([ //this is to send images
        {
            name: "avatar", //this name i.e. avatar should be same in frontend also
            maxCount : 1 //how many avatar want to take
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser);

export default router;
