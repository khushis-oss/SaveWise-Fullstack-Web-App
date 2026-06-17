import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import connectDB from "./config/db.js";
import multer from "multer";
import { signup } from "./controllers/authController.ts";
import authRoutes from "./routes/authRoutes.ts";
import userRoutes from "./routes/userRoutes.ts";
import dashboardRoutes from "./routes/dashboardRoutes.ts";
import {verifyToken} from "./middlewear/authMiddlewear.ts"
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/assets", express.static(path.join(__dirname, "public", "assets")));

const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,"public/assets");
    },
    filename:(req,file,cb)=>{
        cb(null,file.originalname);
    }
})
const upload = multer({ storage: storage });

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
app.post("/auth/signup", upload.single("image"), signup);
app.use("/auth",authRoutes);
app.use("/user",verifyToken,userRoutes);
app.use("/dashboard",verifyToken,dashboardRoutes);
