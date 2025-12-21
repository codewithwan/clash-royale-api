import { Elysia } from "elysia";
import { playerRoutesV1 } from "./player.routes";

export const apiV1 = new Elysia({ prefix: "/api/v1" }).use(playerRoutesV1);
