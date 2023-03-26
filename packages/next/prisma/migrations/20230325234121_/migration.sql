/*
  Warnings:

  - A unique constraint covering the columns `[shortcode]` on the table `Project` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Project_shortcode_key" ON "Project"("shortcode");
