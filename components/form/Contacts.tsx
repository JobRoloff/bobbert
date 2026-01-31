/**
 * This form is for curd operations on our list of contacts which our application could use to send messages to
 *
 * We'll need a couple of things:
 *
 * 1. A shape to describe our contacts (check out the /lib/validation directory)
 * 2. A way to persist our contacts (check out the /hooks/useLocalStorage hook)
 * 3. Some Form UI (check out )
 *
 */

import { useFormLocalStoragePersistence } from "@/hooks/useLocalStorage"
import { Custo, custoSchema } from "@/lib/validation/Custo"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "../ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card"
import { TextField } from "./fields/fields"
import { Lock } from "lucide-react"

const STORAGE_CONTACTS = "rcs_dispatch.contacts"

/**
 *
 * @returns
 */
export default function ContactsForm() {
  const contactsForm = useForm<Custo>({
    resolver: zodResolver(custoSchema),
    defaultValues: {
      phone: "",
      name: "", // Better to start empty so placeholder shows
    },
    mode: "onSubmit",
  })

  const { register, handleSubmit, formState, reset, getValues, watch } = contactsForm
  const { isSubmitting } = formState

  useFormLocalStoragePersistence(contactsForm, STORAGE_CONTACTS)
  return (
    <Card className="w-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Auth Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          // FIX: Add error handler to debug validation
          onSubmit={handleSubmit(
            async (values) => {
              console.log("Submitting:", values)
              // Your API call here
            },
            (errors) => {
              console.error("Validation failed:", errors)
            }
          )}
          className="flex flex-col gap-4"
        >
          <TextField
            label="Name"
            {...register("name")}
            // Pass error explicitly if your custom component supports it
            error={formState.errors.name?.message}
          />
          <TextField
            label="Phone"
            {...register("phone")}
            // Pass error explicitly if your custom component supports it
            error={formState.errors.name?.message}
          />

          <Button type="submit" disabled={isSubmitting}>
            Submit
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
