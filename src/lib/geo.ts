import { z } from "zod";

const geoSchema = z.object({
  as: z.string(),
  city: z.string(),
  country: z.string(),
  countryCode: z.string(),
  isp: z.string(),
  lat: z.number(),
  lon: z.number(),
  org: z.string(),
  query: z.string(),
  region: z.string(),
  regionName: z.string(),
  status: z.string(),
  timezone: z.string(),
  zip: z.string(),
});

export async function geo(ip: string) {
  const res = await fetch(`http://ip-api.com/json/${ip}`);

  if (!res.ok) {
    console.error(`An error occurred fetching geo data for ${ip}`);

    return null;
  }

  const json = await res.json();
  const { success, error, data } = geoSchema.safeParse(json);

  if (!success) {
    console.error(`Invalid geo response\n${JSON.stringify(error)}`);

    return null;
  }

  return data;
}
