// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { updateProjectWithRetry } from "@/models/project";

export default async function handler(req, res) {
  const shortcode = req.params.shortcode;
  const data = req.body;

  try {
    const project = await updateProjectWithRetry(shortcode, data);
    res.status(200).json({ shortcode, data, project });
  } catch (err) {
    res.status(500).send(err.message);
    console.error(err);
    return;
  }
}
