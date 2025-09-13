import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg hover:-translate-y-0.5",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md hover:shadow-lg hover:-translate-y-0.5",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm hover:shadow-md",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow-md",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // ERP-specific variants
        enterprise: "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl hover:-translate-y-0.5",
        success: "bg-success text-success-foreground hover:bg-success/90 shadow-md hover:shadow-lg hover:-translate-y-0.5",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90 shadow-md hover:shadow-lg hover:-translate-y-0.5",
        info: "bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg hover:-translate-y-0.5",
        // Module-specific variants
        dashboard: "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5",
        inventory: "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5",
        finance: "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5",
        hr: "bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5",
        scheduling: "bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5",
        analytics: "bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 rounded-lg px-10 text-base",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
      loading: {
        true: "cursor-not-allowed",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      loading: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    loading = false,
    loadingText,
    leftIcon,
    rightIcon,
    fullWidth = false,
    children,
    disabled,
    ...props 
  }, ref) => {
    const { isDark } = useTheme();
    const Comp = asChild ? Slot : "button";
    
    const isDisabled = disabled || loading;

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, loading, className }),
          fullWidth && "w-full",
          isDark && "shadow-lg"
        )}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="mr-2 h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {loadingText || "Loading..."}
          </>
        ) : (
          <>
            {leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2">{rightIcon}</span>}
          </>
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

// Button Group Component
interface ButtonGroupProps {
  children: React.ReactNode;
  orientation?: "horizontal" | "vertical";
  spacing?: "sm" | "md" | "lg";
  className?: string;
}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ children, orientation = "horizontal", spacing = "md", className }, ref) => {
    const spacingClasses = {
      sm: orientation === "horizontal" ? "space-x-1" : "space-y-1",
      md: orientation === "horizontal" ? "space-x-2" : "space-y-2",
      lg: orientation === "horizontal" ? "space-x-4" : "space-y-4",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex",
          orientation === "vertical" && "flex-col",
          spacingClasses[spacing],
          className
        )}
      >
        {children}
      </div>
    );
  }
);
ButtonGroup.displayName = "ButtonGroup";

// Icon Button Component
interface IconButtonProps extends Omit<ButtonProps, "leftIcon" | "rightIcon" | "children"> {
  icon: React.ReactNode;
  "aria-label": string;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, className, size = "icon", ...props }, ref) => {
    return (
      <Button
        ref={ref}
        size={size}
        className={cn("p-0", className)}
        {...props}
      >
        {icon}
      </Button>
    );
  }
);
IconButton.displayName = "IconButton";

// Floating Action Button
interface FloatingActionButtonProps extends Omit<ButtonProps, "size"> {
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  size?: "sm" | "md" | "lg";
}

const FloatingActionButton = React.forwardRef<HTMLButtonElement, FloatingActionButtonProps>(
  ({ position = "bottom-right", size = "md", className, ...props }, ref) => {
    const positionClasses = {
      "bottom-right": "fixed bottom-6 right-6",
      "bottom-left": "fixed bottom-6 left-6",
      "top-right": "fixed top-6 right-6",
      "top-left": "fixed top-6 left-6",
    };

    const sizeClasses = {
      sm: "h-12 w-12",
      md: "h-14 w-14",
      lg: "h-16 w-16",
    };

    return (
      <Button
        ref={ref}
        size="icon"
        className={cn(
          positionClasses[position],
          sizeClasses[size],
          "rounded-full shadow-xl hover:shadow-2xl z-50",
          className
        )}
        {...props}
      />
    );
  }
);
FloatingActionButton.displayName = "FloatingActionButton";

export { 
  Button, 
  ButtonGroup, 
  IconButton, 
  FloatingActionButton, 
  buttonVariants 
};
