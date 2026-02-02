// app/(pages)/job-applications/JobApplicationTable.tsx
"use client"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontalIcon } from "lucide-react"
import type { JobEmail } from "@/lib/validation/JobEmail/JobEmail"

function toDate(value: Date | string): Date {
  return typeof value === "string" ? new Date(value) : value
}

function formatDateApplied(date: Date | string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    toDate(date)
  )
}

export function JobApplicationsTable({
  emails,
  onView,
}: {
  emails: JobEmail[]
  onView: (email: JobEmail) => void
}) {
  return (
    <Table className="w-fit mx-auto bg-[--md-sys-color-primary]">
      <TableHeader>
        <TableRow>
          <TableHead>Company Name</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Date Applied</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">View / Edit</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {emails.map((email) => (
          <TableRow key={email.id ?? email.gmailMessageId}>
            <TableCell className="font-medium">{email.companyName}</TableCell>
            <TableCell className="font-medium">{email.roleTitle}</TableCell>
            <TableCell title={toDate(email.createdAt).toISOString()}>
              {formatDateApplied(email.createdAt)}
            </TableCell>
            <TableCell className="font-medium">{email.status}</TableCell>

            <TableCell className="text-right">
              <Button onClick={()=> onView(email)}>Details</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
