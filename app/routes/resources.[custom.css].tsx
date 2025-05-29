import fs from "fs";
import path from "path";
import type { Route } from "./+types/resources.[custom.css]";

export async function loader({ }: Route.LoaderArgs) {
  const cssPath = path.join(process.cwd(), "app/resources/custom.css");
  const css = fs.readFileSync(cssPath, "utf-8");

  return new Response(css, {
    headers: {
      "Content-Type": "text/css",
      "Cache-Control": "public, max-age=31536000",
    },
  });
}; 