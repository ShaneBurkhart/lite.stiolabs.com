import { getProject, runAndSave } from "@/models/project";

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { query: { shortcode } } = req;

  if (req.method === "POST") {
    const { commands } = req.body;

    if (!commands || !Array.isArray(commands)) {
      res.status(400).json({ error: "Bad request" });
      return;
    }

    await runAndSave(shortcode, commands);
  }

  const project = await getProject(shortcode);
  res.status(200).json(project ? project : {});
}
