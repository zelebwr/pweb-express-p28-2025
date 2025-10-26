/*
  Warnings:

  - You are about to drop the column `total` on the `orders` table. All the data in the column will be lost.

*/

/* 
  Changed the column `total` to `totalPrice` and added a new column `totalAmount` to the `orders` table.
 */
-- AlterTable
ALTER TABLE "orders" RENAME COLUMN "total" TO "totalPrice";
ALTER TABLE "orders" ADD COLUMN "totalAmount" INTEGER NOT NULL DEFAULT 0;