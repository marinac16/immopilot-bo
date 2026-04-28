import { setupServer } from "msw/node";
import { usersHandlers } from "./handlers/users.handlers";
import { featuresHandlers } from "./handlers/features.handlers";
import { brandingHandlers } from "./handlers/branding.handlers";

export const server = setupServer(
  ...usersHandlers,
  ...featuresHandlers,
  ...brandingHandlers
);