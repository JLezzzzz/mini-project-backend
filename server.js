import express from "express"
import dotenv from "dotenv"
import helmet from "helmet";
import cors from "cors";
import { createClient } from "@libsql/client"
import apiRoutes from "./api/routes.js"
import mongoose from "mongoose"
import limiter from "./middleware/rateLimiter.js";
import errorHandler from "./middleware/errorHandling.js"
import cookieParser from "cookie-parser";


//User .env file
dotenv.config()

//app.use(router)
const app = express()
app.use(express.json())


//PORT from ENV
const PORT = process.env.PORT


const db = createClient({
    url: process.env.TURSO_DB_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

// Global middlewares
app.use(helmet());
const corsOptions = {
  origin: ["http://localhost:5173", "https://rag-notes-frontend.vercel.app"], // your frontend domain
  credentials: true, // ✅ allow cookies to be sent
};

app.use(cors(corsOptions));
app.use(limiter);
app.use(express.json());
app.use(cookieParser());
// Centralized routes

(async () => {
// Connect to MongoDB via Mongoose
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to Mongo database ✅");
    } catch (err) {
        console.error(`MongoDB connection error: ${err}`)
        process.exit(1);
    }

    // Ping Turso
    try {
        await db.execute("SELECT 1");
        console.log("Checked successful communication with Turso database ✅");
    } catch (err) {
        console.error("❌ Failed to connect to Turso:", err);
        process.exit(1);
    }

    //Initialize Turso tables (users, notes)

        await db.execute(`
            CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            tags TEXT, --JSON-encode array of strings
            is_pinned INTEGER DEFAULT 0, -- 0 = false, 1 = true
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            user_ID INTEGER
            );
            `)

        await db.execute(`
            CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL
            );
            `)

}
)()


//   Check if the table already exist? if not create the table as the detail


app.use("/",apiRoutes(db))

app.use(errorHandler)

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT} ✅`)
})