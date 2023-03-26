
export async function updateProjectWithRetry(shortcode, newData) {
  for (let i = 0; i < 10; i++) {
    try {
      let latestProject = await prisma.project.findFirst({
        where: { shortcode },
        orderBy: { version: 'desc' },
        select: { version: true },
      });

      if (!latestProject) {
        return prisma.project.create({ shortcode, data: newData });
      }

      const prevVersion = latestProject.version;
      const newVersion = prevVersion + 1;

      const result = await prisma.$executeRaw(`
        UPDATE Project p
        SET data = '${JSON.stringify(newData)}',
            version = ${newVersion}
        WHERE p.shortcode = '${shortcode}'
          AND p.version = ${prevVersion}
          AND ${newVersion} = p.version + 1;
      `);

      if (result.affectedRows === 1) {
        const updatedProject = await prisma.project.findUnique({ where: { shortcode } });
        return updatedProject;
      }
    } catch (err) {
      console.error(err);
    }
  }

  throw new Error(`Failed to update project with shortcode '${shortcode}' after 10 attempts`);
}
