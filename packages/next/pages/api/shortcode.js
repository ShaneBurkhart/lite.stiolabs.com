import prisma from '@/lib/prisma';
import { runAndSave } from '@/models/project';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Generate a short code
    let shortcode;
    let existingProject;

    // If the short code exists, generate a new one
    let doWhile = true;
    while (doWhile || existingProject) {
      doWhile = false;
      const newShortCode = generateShortCode();
      existingProject = await prisma.projectEvent.findUnique({
        where: { shortcode_version: { shortcode: newShortCode, version: 1 } },
      });
      shortcode = newShortCode;
      if (existingProject) continue;
      
      try {
        // try to create
        await runAndSave(shortcode, [{ command: 'createProject' }])
      } catch (e) {
        // if it fails, set existingProject to true
        console.log(e);
        existingProject = true;
      }
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
