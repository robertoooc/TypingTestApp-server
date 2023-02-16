import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { dbConnect } from "../models/index.js";
dbConnect();
export const middleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader)
            throw new Error('JWT token is missing');
        const decode = await jwt.verify(authHeader, process.env.JWT_SECRET);
        const foundUser = await User.findOne({ _id: decode.id });
        res.locals.user = foundUser;
        next();
    }
    catch (err) {
        res.locals.user = null;
        next();
    }
};
