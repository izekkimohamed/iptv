import { Xtream } from "@iptv/xtream-api";

export function createXtreamClient(
  url: string,
  username: string,
  password: string
) {
  return new Xtream({ url, username, password, preferredFormat: "m3u8" });
}
