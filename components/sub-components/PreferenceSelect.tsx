"use client";

type RecipeFormDataKeys = "ingredients" | "cuisine" | "dietaryRestrictions" | "mealType" | "difficulty" | "cookingTime" | "servingSize" | "additionalNotes";

export default function PreferenceSelect({ 
  label, 
  id, 
  options,
  formData, 
  errors, 
  handleInputChange, 
  disabled 
}: {
  label: string,
  id: RecipeFormDataKeys,
  options: { value: string, label: string }[],
  formData: Record<RecipeFormDataKeys, string | number>,
  errors: Record<RecipeFormDataKeys, string>,
  handleInputChange: (e: React.ChangeEvent<HTMLSelectElement>) => void,
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
        <select
          id={id}
          name={id}
          value={formData[id].toString()}
          onChange={handleInputChange}
          className="w-full rounded-md border border-black/20 dark:border-white/30 bg-white dark:bg-dark-gradient-from px-4 py-2 dark:text-white placeholder-black/60 dark:placeholder-white/60 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          disabled={disabled}
        >
          <option value="">Select {label}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {errors[id] && <p className="text-sm text-red-500">{errors[id]}</p>}
    </div>
  );
} 