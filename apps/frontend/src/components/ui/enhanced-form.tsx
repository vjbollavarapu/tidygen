import * as React from "react";
import { useForm, UseFormReturn, FieldValues, Path, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "./enhanced-button";
import { Input } from "./input";
import { Label } from "./label";
import { Textarea } from "./textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Checkbox } from "./checkbox";
import { RadioGroup, RadioGroupItem } from "./radio-group";
import { Switch } from "./switch";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { CalendarIcon, AlertCircle, CheckCircle } from "lucide-react";
import { format } from "date-fns";

// Form Field Props
interface FormFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  control: any;
  render: (props: {
    field: any;
    fieldState: any;
    formState: any;
  }) => React.ReactNode;
}

// Form Item Props
interface FormItemProps {
  className?: string;
  children: React.ReactNode;
}

// Form Label Props
interface FormLabelProps {
  className?: string;
  children: React.ReactNode;
  required?: boolean;
}

// Form Control Props
interface FormControlProps {
  className?: string;
  children: React.ReactNode;
}

// Form Description Props
interface FormDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

// Form Message Props
interface FormMessageProps {
  className?: string;
  children?: React.ReactNode;
}

// Enhanced Form Components
const FormField = <TFieldValues extends FieldValues>({
  name,
  control,
  render,
}: FormFieldProps<TFieldValues>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState, formState }) =>
        render({ field, fieldState, formState })
      }
    />
  );
};

const FormItem = React.forwardRef<HTMLDivElement, FormItemProps>(
  ({ className, children }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-2", className)}>
        {children}
      </div>
    );
  }
);
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ className, children, required, ...props }, ref) => {
    return (
      <Label
        ref={ref}
        className={cn(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          required && "after:content-['*'] after:ml-0.5 after:text-destructive",
          className
        )}
        {...props}
      >
        {children}
      </Label>
    );
  }
);
FormLabel.displayName = "FormLabel";

const FormControl = React.forwardRef<HTMLDivElement, FormControlProps>(
  ({ className, children }, ref) => {
    return (
      <div ref={ref} className={cn("", className)}>
        {children}
      </div>
    );
  }
);
FormControl.displayName = "FormControl";

const FormDescription = React.forwardRef<HTMLParagraphElement, FormDescriptionProps>(
  ({ className, children }, ref) => {
    return (
      <p
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
      >
        {children}
      </p>
    );
  }
);
FormDescription.displayName = "FormDescription";

const FormMessage = React.forwardRef<HTMLParagraphElement, FormMessageProps>(
  ({ className, children }, ref) => {
    return (
      <p
        ref={ref}
        className={cn("text-sm font-medium text-destructive", className)}
      >
        {children}
      </p>
    );
  }
);
FormMessage.displayName = "FormMessage";

// Enhanced Form Hook
interface UseEnhancedFormProps<T extends FieldValues> {
  schema?: z.ZodSchema<T>;
  defaultValues?: Partial<T>;
  onSubmit: (data: T) => void | Promise<void>;
  mode?: "onChange" | "onBlur" | "onSubmit" | "onTouched" | "all";
}

function useEnhancedForm<T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  mode = "onChange",
}: UseEnhancedFormProps<T>) {
  const form = useForm<T>({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues,
    mode,
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  });

  return {
    ...form,
    handleSubmit,
  };
}

// Form Components
interface EnhancedFormProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  onSubmit: (data: T) => void | Promise<void>;
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
  submitText?: string;
  cancelText?: string;
  showCancel?: boolean;
  onCancel?: () => void;
}

const EnhancedForm = <T extends FieldValues>({
  form,
  onSubmit,
  children,
  className,
  loading = false,
  submitText = "Submit",
  cancelText = "Cancel",
  showCancel = false,
  onCancel,
}: EnhancedFormProps<T>) => {
  const { isDark } = useTheme();

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className={cn("space-y-6", className)}
    >
      {children}
      
      <div className="flex items-center justify-end space-x-2">
        {showCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </Button>
        )}
        <Button type="submit" loading={loading}>
          {submitText}
        </Button>
      </div>
    </form>
  );
};

// Input Field Component
interface InputFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  type?: "text" | "email" | "password" | "number" | "tel" | "url";
  disabled?: boolean;
  className?: string;
}

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ name, label, placeholder, description, required, type = "text", disabled, className }, ref) => {
    return (
      <FormItem>
        <FormLabel required={required}>{label}</FormLabel>
        <FormControl>
          <Input
            ref={ref}
            name={name}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            className={className}
          />
        </FormControl>
        {description && <FormDescription>{description}</FormDescription>}
        <FormMessage />
      </FormItem>
    );
  }
);
InputField.displayName = "InputField";

// Textarea Field Component
interface TextareaFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  rows?: number;
  disabled?: boolean;
  className?: string;
}

const TextareaField = React.forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ name, label, placeholder, description, required, rows = 3, disabled, className }, ref) => {
    return (
      <FormItem>
        <FormLabel required={required}>{label}</FormLabel>
        <FormControl>
          <Textarea
            ref={ref}
            name={name}
            placeholder={placeholder}
            rows={rows}
            disabled={disabled}
            className={className}
          />
        </FormControl>
        {description && <FormDescription>{description}</FormDescription>}
        <FormMessage />
      </FormItem>
    );
  }
);
TextareaField.displayName = "TextareaField";

// Select Field Component
interface SelectFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  disabled?: boolean;
  className?: string;
}

const SelectField = React.forwardRef<HTMLButtonElement, SelectFieldProps>(
  ({ name, label, placeholder, description, required, options, disabled, className }, ref) => {
    return (
      <FormItem>
        <FormLabel required={required}>{label}</FormLabel>
        <FormControl>
          <Select name={name} disabled={disabled}>
            <SelectTrigger ref={ref} className={className}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormControl>
        {description && <FormDescription>{description}</FormDescription>}
        <FormMessage />
      </FormItem>
    );
  }
);
SelectField.displayName = "SelectField";

// Checkbox Field Component
interface CheckboxFieldProps {
  name: string;
  label: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

const CheckboxField = React.forwardRef<HTMLButtonElement, CheckboxFieldProps>(
  ({ name, label, description, disabled, className }, ref) => {
    return (
      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
        <FormControl>
          <Checkbox name={name} disabled={disabled} ref={ref} />
        </FormControl>
        <div className="space-y-1 leading-none">
          <FormLabel className={className}>{label}</FormLabel>
          {description && <FormDescription>{description}</FormDescription>}
        </div>
        <FormMessage />
      </FormItem>
    );
  }
);
CheckboxField.displayName = "CheckboxField";

// Radio Group Field Component
interface RadioGroupFieldProps {
  name: string;
  label: string;
  description?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  disabled?: boolean;
  className?: string;
}

const RadioGroupField = React.forwardRef<HTMLDivElement, RadioGroupFieldProps>(
  ({ name, label, description, options, disabled, className }, ref) => {
    return (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <RadioGroup name={name} disabled={disabled} ref={ref} className={className}>
            {options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option.value}
                  id={`${name}-${option.value}`}
                  disabled={option.disabled}
                />
                <Label htmlFor={`${name}-${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </FormControl>
        {description && <FormDescription>{description}</FormDescription>}
        <FormMessage />
      </FormItem>
    );
  }
);
RadioGroupField.displayName = "RadioGroupField";

// Switch Field Component
interface SwitchFieldProps {
  name: string;
  label: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

const SwitchField = React.forwardRef<HTMLButtonElement, SwitchFieldProps>(
  ({ name, label, description, disabled, className }, ref) => {
    return (
      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <FormLabel className={className}>{label}</FormLabel>
          {description && <FormDescription>{description}</FormDescription>}
        </div>
        <FormControl>
          <Switch name={name} disabled={disabled} ref={ref} />
        </FormControl>
        <FormMessage />
      </FormItem>
    );
  }
);
SwitchField.displayName = "SwitchField";

// Date Field Component
interface DateFieldProps {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const DateField = React.forwardRef<HTMLButtonElement, DateFieldProps>(
  ({ name, label, description, required, disabled, className }, ref) => {
    const [date, setDate] = React.useState<Date>();

    return (
      <FormItem>
        <FormLabel required={required}>{label}</FormLabel>
        <FormControl>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                ref={ref}
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground",
                  className
                )}
                disabled={disabled}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) =>
                  date > new Date() || date < new Date("1900-01-01")
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </FormControl>
        {description && <FormDescription>{description}</FormDescription>}
        <FormMessage />
      </FormItem>
    );
  }
);
DateField.displayName = "DateField";

// Form Validation Status Component
interface FormValidationStatusProps {
  isValid: boolean;
  message?: string;
  className?: string;
}

const FormValidationStatus: React.FC<FormValidationStatusProps> = ({
  isValid,
  message,
  className,
}) => {
  if (!message) return null;

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {isValid ? (
        <CheckCircle className="h-4 w-4 text-success" />
      ) : (
        <AlertCircle className="h-4 w-4 text-destructive" />
      )}
      <span className={cn(
        "text-sm",
        isValid ? "text-success" : "text-destructive"
      )}>
        {message}
      </span>
    </div>
  );
};

export {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  useEnhancedForm,
  EnhancedForm,
  InputField,
  TextareaField,
  SelectField,
  CheckboxField,
  RadioGroupField,
  SwitchField,
  DateField,
  FormValidationStatus,
};
