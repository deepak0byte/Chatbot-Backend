import express from "express";
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv'
import projectRouter from "./routes/projectRoute.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

app.use('/', projectRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});