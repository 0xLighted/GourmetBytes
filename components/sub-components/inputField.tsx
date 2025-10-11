"use client";

type FormDataKeys = "email" | "password" | "confirmPassword" | "geminiKey" | "name";

export default function InputField({ label, id, type, placeholder, children, formData, errors, handleInputChange, disabled }: {
  label: string,
  id: FormDataKeys,
  type: React.HTMLInputTypeAttribute,
  placeholder: string,
  children?: React.ReactNode,
  formData: Record<FormDataKeys, string>,
  errors: Record<FormDataKeys, string>,
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  disabled: boolean
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-black dark:text-white"
        >
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          id={id}
          name={id}
          value={formData[id]}
          onChange={handleInputChange}
          className="w-full rounded-md border border-black/20 dark:border-white/30 bg-white dark:bg-dark-gradient-from px-4 py-2 dark:text-white placeholder-black/60 dark:placeholder-white/60 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          placeholder={placeholder}
          disabled={disabled}
        />
        {children}
      </div>
      {errors[id] && <p className="text-sm text-red-500">{errors[id]}</p>}
    </div>
  )
}
