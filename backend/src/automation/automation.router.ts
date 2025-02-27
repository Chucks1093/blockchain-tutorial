import { Router } from "express";
import { httpCreateUpKeep } from "./automation.controller";

const automationRouter = Router();

automationRouter.post("/create", httpCreateUpKeep);

export default automationRouter;
