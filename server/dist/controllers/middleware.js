import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { dbConnect } from "../models/index.js";
dbConnect();
export const middleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader)
            throw new Error('JWT token is missing');
        console.log(authHeader, "🍓🍓🍓🍓");
        const decode = await jwt.verify(authHeader, process.env.JWT_SECRET);
        const foundUser = await User.findById(decode);
        res.locals.user = foundUser;
        console.log(foundUser);
        next();
    }
    catch (err) {
        console.log(err);
        res.locals.user = null;
        next();
    }
};
