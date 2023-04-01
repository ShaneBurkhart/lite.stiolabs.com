import { eventsSince, getProject, runAndSave } from "@/models/project";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { query: { shortcode, expectedVersion } } = req;
	const events = await eventsSince(shortcode, Number(expectedVersion) || 0);

  res.status(200).json(events ? events : []);
}


