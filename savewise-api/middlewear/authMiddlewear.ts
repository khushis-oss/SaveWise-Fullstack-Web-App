import { Request, Response, NextFunction } from "express";
import jsonwebtoken from "jsonwebtoken";
import crypto from "crypto";

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

    if (!actualToken || actualToken === "null" || actualToken === "undefined") {
      return res.status(401).json({ message: "No token provided" });
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

const FIVE_MINUTES_MS = 5 * 60 * 1000;

export const verifyHMAC = (req: Request, res: Response, next: NextFunction) => {
  try {
    const uniqueid = req.headers["uniqueid"] as string;
    const timestamp = req.headers["timestamp"] as string;
    const receivedSignature = req.headers["x-signature"] as string;

    if (!uniqueid || !timestamp || !receivedSignature) {
      return res.status(401).json({ message: "Missing HMAC headers" });
    }

    const requestTime = new Date(timestamp).getTime();
    if (isNaN(requestTime) || Date.now() - requestTime > FIVE_MINUTES_MS) {
      return res.status(401).json({ message: "Request expired or invalid timestamp" });
    }

    const secret = process.env.HMAC_SECRET_KEY;
    if (!secret) {
      return res.status(500).json({ message: "Server misconfiguration" });
    }

    const message = `${uniqueid}\n${timestamp}`;
    const expected = crypto.createHmac("sha256", secret).update(message).digest("base64");

    const isValid = crypto.timingSafeEqual(
      Buffer.from(receivedSignature),
      Buffer.from(expected),
    );

    if (!isValid) {
      return res.status(401).json({ message: "Invalid signature" });
    }

    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "HMAC verification failed" });
  }
};

export const verifyAuthority = (req: Request,
  res: Response,
  next: NextFunction,) =>{
  try {
    if(req.user.role !== "user" ){
      res.status(403).json({
      message: `You do not have access to perform this action your role is ${req.user.role} only user roles have access`
      })
      return;
    }
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({
      message: "server error"
    });
  }
}