export const MAPBOX_STYLE_URL = "mapbox://styles/mapbox/standard";
export const MAPBOX_INITIAL_CENTER: [number, number] = [-120.5, 45.8];
export const MAPBOX_INITIAL_ZOOM = 5;

export type MapboxTokenResult =
  | { token: string; error: null }
  | { token: null; error: string };

export function getMapboxPublicToken(): MapboxTokenResult {
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN?.trim();

  if (!token) {
    return {
      token: null,
      error: "Mapbox public token is not configured.",
    };
  }

  if (!token.startsWith("pk.")) {
    return {
      token: null,
      error: "Only a Mapbox public token beginning with pk. may be used in the browser.",
    };
  }

  return { token, error: null };
}
