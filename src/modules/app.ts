import express from "express";
import type { Express } from "express";

const expressApplication = ():Express => {
    const app = express();

    app.use("/health", (req,res) => {
        res.status(200).json({success : true, message : "welcome to my server"});
        return
    })

    return app;
}

export default expressApplication