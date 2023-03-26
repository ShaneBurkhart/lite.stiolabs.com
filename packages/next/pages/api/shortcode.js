import prisma from '../../lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Generate a short code
    let shortcode = generateShortCode();

    // Check if the short code exists in the Prisma Projects table
    let existingProject = await prisma.project.findUnique({
      where: { shortcode },
    });

    // If the short code exists, generate a new one
    while (existingProject) {
      const newShortCode = generateShortCode();
      existingProject = await prisma.project.findUnique({
        where: { shortcode: newShortCode },
      });
      shortCode = newShortCode;
    }

    res.status(200).json({ shortcode });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

// Generate a random 6-character string
function generateShortCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let shortCode = '';
  for (let i = 0; i < 6; i++) {
    shortCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return shortCode;
}
