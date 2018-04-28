import * as path from "path";
import * as express from "express";

import { nodeRouter } from "./web";


process.on("uncaughtException", (err) => {
    console.error("Uncaught exception", err.stack);
});

process.on("unhandledRejection", err => {
    console.error("Unhandled rejection", err.stack);
});

process.on("rejectionHandled", err => {
    console.error("Rejection handled", err.stack);
});

const app = express();
const apiRouter = express.Router();
const staticFilesPath = path.resolve(path.join(__dirname, "dist/assets"));

apiRouter.use("/node", nodeRouter);

app.use("/api", apiRouter);

app.use("/", express.static(staticFilesPath, { index: "index.html" }));

app.use("/vendor", express.static(path.resolve(path.join(__dirname, "dist/vendor"))));

app.listen(3000, () => {
    console.log(`
        Static files directory: ${staticFilesPath}
        Server started at http://localhost:3000/
    `);
});