import { Request, Response, NextFunction } from "express";
import jsonwebtoken from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let actualToken = req.headers.authorization;
    if (actualToken?.startsWith("Bearer")) {
      actualToken = actualToken.split(" ")[1];
    }

    const decoded = jsonwebtoken.verify(actualToken, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({
      message: "Invalid token",
    });
  }
};

export const VerifyAccess = () =>{

}