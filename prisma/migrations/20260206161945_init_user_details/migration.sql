-- CreateEnum
CREATE TYPE "UserDefaultTone" AS ENUM ('short', 'enthusiastic', 'assertive', 'neutral');

-- CreateTable
CREATE TABLE "user_details" (
    "id" UUID NOT NULL,
    "firstName" VARCHAR(200) NOT NULL,
    "lastName" VARCHAR(200) NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "location" VARCHAR(200),
    "headline" VARCHAR(200),
    "portfolioUrl" VARCHAR(2048),
    "linkedinUrl" VARCHAR(2048),
    "githubUrl" VARCHAR(2048),
    "defaultTone" "UserDefaultTone",
    "defaultSignOff" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_details_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_details_email_key" ON "user_details"("email");
