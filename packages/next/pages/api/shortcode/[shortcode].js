import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const {
    query: { shortcode },
  } = req;

  const project = await prisma.project.findUnique({
    where: { shortcode },
  });

  res.status(200).json(project ? project.data : {});
}
