"use client";

import { getJobEmails } from "@/app/actions/gmail/job-emails";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function SyncButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function handleSync() {
    setIsLoading(true);
    try {
      const emails = await getJobEmails();
      setResult(emails);
      console.log("Fetched emails:", emails);
    } catch (error) {
      console.error("Error fetching emails:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <Button onClick={handleSync} disabled={isLoading}>
        {isLoading ? "Loading..." : "Fetch from Gmail"}
      </Button>
      {result && (
        <p className="mt-2 text-sm text-muted-foreground">
          Fetched {Array.isArray(result) ? result.length : 0} emails
        </p>
      )}
    </div>
  );
}
