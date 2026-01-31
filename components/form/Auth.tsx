import { useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { authFormSchema, type AuthFormData } from "@/lib/validation/Auth/AuthForm"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock } from "lucide-react"
import { ProtectedField } from "@/components/form/fields/fields"
import { useFormLocalStoragePersistence } from "@/hooks/useLocalStorage"

const STORAGE_AUTH = "rcs_dispatch.demo_token"

export default function AuthForm() {
  const authForm = useForm<AuthFormData>({
    resolver: zodResolver(authFormSchema),
    defaultValues: {
      demoToken: "", // Better to start empty so placeholder shows
    },
    mode: "onSubmit",
  })

  const { register, handleSubmit, formState, reset, getValues, watch } = authForm
  const { isSubmitting } = formState

  useFormLocalStoragePersistence(authForm, STORAGE_AUTH)

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


          <Button type="submit" disabled={isSubmitting}>
            Submit
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
