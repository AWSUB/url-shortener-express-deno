import cors from "cors";
import express, { Router } from "express";
import helmet from "helmet";
import { errorHandler } from "./middleware/error-handler.ts";
import { notFound } from "./middleware/not-found.ts";
import miscRouter from "./modules/misc/routes.ts";
import urlsRouter from "./modules/url-entries/routes.ts";
import usersRouter from "./modules/users/routes.ts";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

const api = Router();

api.use(miscRouter);
api.use(usersRouter);
api.use(urlsRouter);

app.use("/api", api);

app.use(notFound);
app.use(errorHandler);
