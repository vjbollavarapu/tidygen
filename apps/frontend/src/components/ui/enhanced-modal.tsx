import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "./enhanced-button";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => {
  const { isDark } = useTheme();
  
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn(
        "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        isDark && "bg-black/90",
        className
      )}
      {...props}
    />
  );
});
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    showCloseButton?: boolean;
    loading?: boolean;
  }
>(({ className, children, showCloseButton = true, loading = false, ...props }, ref) => {
  const { isDark } = useTheme();
  
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
          isDark && "border-gray-700 shadow-2xl",
          className
        )}
        {...props}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading...</span>
            </div>
          </div>
        )}
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

// Enhanced Modal Components
interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  loading?: boolean;
  showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  open,
  onOpenChange,
  children,
  size = "md",
  loading = false,
  showCloseButton = true,
}) => {
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-[95vw] max-h-[95vh]",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={sizeClasses[size]}
        loading={loading}
        showCloseButton={showCloseButton}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
};

// Confirmation Modal
interface ConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel?: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive" | "warning";
  loading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  loading = false,
}) => {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} loading={loading}>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" onClick={handleCancel}>
          {cancelText}
        </Button>
        <Button
          variant={variant === "destructive" ? "destructive" : variant === "warning" ? "warning" : "default"}
          onClick={handleConfirm}
          loading={loading}
        >
          {confirmText}
        </Button>
      </DialogFooter>
    </Modal>
  );
};

// Form Modal
interface FormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  submitText?: string;
  cancelText?: string;
  loading?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

const FormModal: React.FC<FormModalProps> = ({
  open,
  onOpenChange,
  onSubmit,
  title,
  description,
  children,
  submitText = "Save",
  cancelText = "Cancel",
  loading = false,
  size = "md",
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    onSubmit(data);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} loading={loading} size={size}>
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="py-4">
          {children}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {cancelText}
          </Button>
          <Button type="submit" loading={loading}>
            {submitText}
          </Button>
        </DialogFooter>
      </form>
    </Modal>
  );
};

// Multi-step Modal
interface Step {
  id: string;
  title: string;
  description?: string;
  content: React.ReactNode;
}

interface MultiStepModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  steps: Step[];
  currentStep: number;
  onStepChange: (step: number) => void;
  onComplete: () => void;
  title: string;
  loading?: boolean;
}

const MultiStepModal: React.FC<MultiStepModalProps> = ({
  open,
  onOpenChange,
  steps,
  currentStep,
  onStepChange,
  onComplete,
  title,
  loading = false,
}) => {
  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      onStepChange(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      onStepChange(currentStep - 1);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} loading={loading} size="lg">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>
          Step {currentStep + 1} of {steps.length}: {currentStepData.title}
        </DialogDescription>
      </DialogHeader>
      
      <div className="py-4">
        {/* Progress indicator */}
        <div className="flex items-center space-x-2 mb-6">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  index <= currentStep
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {index + 1}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "w-12 h-0.5 mx-2",
                    index < currentStep ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="min-h-[300px]">
          {currentStepData.content}
        </div>
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          Previous
        </Button>
        <Button onClick={handleNext} loading={loading}>
          {isLastStep ? "Complete" : "Next"}
        </Button>
      </DialogFooter>
    </Modal>
  );
};

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  Modal,
  ConfirmationModal,
  FormModal,
  MultiStepModal,
};
