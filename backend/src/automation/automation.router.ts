import { Router } from "express";
import { httpCreateUpKeep, httpGetAllUpKeep } from "./automation.controller";

const automationRouter = Router();

automationRouter.get("/", httpGetAllUpKeep);
automationRouter.post("/create", httpCreateUpKeep);

export default automationRouter;
