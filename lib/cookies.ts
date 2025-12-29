import type { SerializeOptions } from "cookie";

export const cookieOptions: SerializeOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};
