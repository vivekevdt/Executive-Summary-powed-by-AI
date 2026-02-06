/*
  Warnings:

  - You are about to drop the column `fileName` on the `report` table. All the data in the column will be lost.
  - You are about to drop the column `filePath` on the `report` table. All the data in the column will be lost.
  - You are about to drop the column `pdfPath` on the `report` table. All the data in the column will be lost.
  - You are about to drop the column `summaryPath` on the `report` table. All the data in the column will be lost.
  - Added the required column `report_json` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `report_pdf` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `report_word` to the `Report` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `report` DROP COLUMN `fileName`,
    DROP COLUMN `filePath`,
    DROP COLUMN `pdfPath`,
    DROP COLUMN `summaryPath`,
    ADD COLUMN `report_json` VARCHAR(191) NOT NULL,
    ADD COLUMN `report_pdf` VARCHAR(191) NOT NULL,
    ADD COLUMN `report_word` VARCHAR(191) NOT NULL;
