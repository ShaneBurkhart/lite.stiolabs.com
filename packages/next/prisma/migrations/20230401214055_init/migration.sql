-- CreateTable
CREATE TABLE "ProjectEvent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shortcode" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventData" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1
);

-- CreateTable
CREATE TABLE "ProjectSnapshot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shortcode" TEXT NOT NULL,
    "snapshot" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectEvent_shortcode_version_key" ON "ProjectEvent"("shortcode", "version");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectSnapshot_shortcode_key" ON "ProjectSnapshot"("shortcode");
