import { getProject, runAndSave } from "@/models/project";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { query: { shortcode } } = req;

	const { commands } = req.body;

	if (!commands || !Array.isArray(commands)) {
		res.status(400).json({ error: "Bad request" });
		return;
	}

	commands.forEach(cmd => console.log(cmd.command))
	await runAndSave(shortcode, commands);

  res.status(200).json({ success: true });
}

