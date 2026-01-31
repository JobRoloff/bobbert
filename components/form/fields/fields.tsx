import type {
  FieldValues,
  Path,
  UseFormRegister,
  UseFormRegisterReturn,
  RegisterOptions,
} from "react-hook-form"


export function TextField({
  label,
  error,
  ...props
}: React.ComponentProps<"input"> & { label: string; error?: string }) {
  return (
    <div className="flex between items-center gap-2">
      <label>{label}</label>
      <input className="outline" {...props} />
      {error && <p>{error}</p>}
    </div>
  )
}

type ProtectedFieldProps<T extends FieldValues> =
  Omit<React.ComponentProps<"input">, "name"> & {
    label: string
    error?: string
    name: Path<T>
    register: UseFormRegister<T>
    options?: RegisterOptions<T, Path<T>>
  }

export function ProtectedField({
  label,
  error,
  registration,
  type = "password",
  ...props
}: Omit<React.ComponentProps<"input">, "name"> & {
  label: string
  error?: string
  registration: UseFormRegisterReturn
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="min-w-40">{label}</label>
      <input
        type={type}
        className="outline"
        {...registration}
        {...props}
      />
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
    </div>
  )
}