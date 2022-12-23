import { Config } from "./config.ts";

export async function getServerStatus(
  config: Config,
): Promise<Record<string, unknown>> {
  const response = await fetch(
    `https://api.ggod.io/api/worlds/${config.valheim.server}`,
    {
      headers: {
        "authorization":
          `Auth-ggod token=undefined password=${config.valheim.password}`,
      },
    },
  );
  if (response.status !== 200) {
    throw Error(`Got status ${response.status}`);
  }
  return response.json();
}
