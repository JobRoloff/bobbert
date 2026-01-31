import { prisma } from "@/lib/prisma"
import { UpsertJobEmailInput } from "@/lib/validation/JobEmail/JobEmail";

export async function getJobApplicationEmails(limit: number = 50) {
  //   return prisma.jobEmail.findMany({
  //     orderBy: { date: "desc" },
  //     take: limit,
  //   });
}

export async function addJobApplicationEmails(jobsToAdd: UpsertJobEmailInput[]){

}
