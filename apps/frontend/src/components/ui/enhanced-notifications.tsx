import * as React from "react";
import { createContext, useContext } from "react";
import { toast as sonnerToast } from "sonner";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "./enhanced-button";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, Bell } from "lucide-react";

// Notification Types
export type NotificationType = "success" | "error" | "warning" | "info" | "loading";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  persistent?: boolean;
}

// Notification Context
interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id">) => string;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  toast: {
    success: (title: string, description?: string, options?: Partial<Notification>) => void;
    error: (title: string, description?: string, options?: Partial<Notification>) => void;
    warning: (title: string, description?: string, options?: Partial<Notification>) => void;
    info: (title: string, description?: string, options?: Partial<Notification>) => void;
    loading: (title: string, description?: string, options?: Partial<Notification>) => void;
  };
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Notification Provider
interface NotificationProviderProps {
  children: React.ReactNode;
  maxNotifications?: number;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}

export function NotificationProvider({
  children,
  maxNotifications = 5,
  position = "top-right",
}: NotificationProviderProps) {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const { isDark } = useTheme();

  const addNotification = React.useCallback((notification: Omit<Notification, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      id,
      duration: 5000,
      dismissible: true,
      persistent: false,
      ...notification,
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      return updated.slice(0, maxNotifications);
    });

    // Auto-remove notification after duration
    if (newNotification.duration && !newNotification.persistent) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, [maxNotifications]);

  const removeNotification = React.useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAll = React.useCallback(() => {
    setNotifications([]);
  }, []);

  const toast = React.useMemo(() => ({
    success: (title: string, description?: string, options?: Partial<Notification>) => {
      addNotification({ type: "success", title, description, ...options });
    },
    error: (title: string, description?: string, options?: Partial<Notification>) => {
      addNotification({ type: "error", title, description, ...options });
    },
    warning: (title: string, description?: string, options?: Partial<Notification>) => {
      addNotification({ type: "warning", title, description, ...options });
    },
    info: (title: string, description?: string, options?: Partial<Notification>) => {
      addNotification({ type: "info", title, description, ...options });
    },
    loading: (title: string, description?: string, options?: Partial<Notification>) => {
      addNotification({ type: "loading", title, description, persistent: true, ...options });
    },
  }), [addNotification]);

  const contextValue: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    toast,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <NotificationContainer position={position} />
    </NotificationContext.Provider>
  );
}

// Notification Container
interface NotificationContainerProps {
  position: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}

const NotificationContainer: React.FC<NotificationContainerProps> = ({ position }) => {
  const { notifications, removeNotification } = useNotifications();
  const { isDark } = useTheme();

  const positionClasses = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
  };

  if (notifications.length === 0) return null;

  return (
    <div className={cn(
      "fixed z-50 flex flex-col space-y-2 max-w-sm w-full",
      positionClasses[position]
    )}>
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

// Notification Item
interface NotificationItemProps {
  notification: Notification;
  onRemove: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onRemove }) => {
  const { isDark } = useTheme();
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(onRemove, 300);
  };

  const getIcon = () => {
    switch (notification.type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-success" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case "info":
        return <Info className="h-5 w-5 text-primary" />;
      case "loading":
        return (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        );
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case "success":
        return "bg-success/10 border-success/20";
      case "error":
        return "bg-destructive/10 border-destructive/20";
      case "warning":
        return "bg-warning/10 border-warning/20";
      case "info":
        return "bg-primary/10 border-primary/20";
      case "loading":
        return "bg-muted/50 border-border";
      default:
        return "bg-background border-border";
    }
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border p-4 shadow-lg transition-all duration-300",
        getBackgroundColor(),
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
        isDark && "shadow-2xl"
      )}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-foreground">
            {notification.title}
          </h4>
          {notification.description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {notification.description}
            </p>
          )}
          {notification.action && (
            <div className="mt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={notification.action.onClick}
              >
                {notification.action.label}
              </Button>
            </div>
          )}
        </div>
        {notification.dismissible && (
          <div className="flex-shrink-0">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRemove}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// Hook to use notifications
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}

// Enhanced Toast Functions
export const toast = {
  success: (title: string, description?: string) => {
    sonnerToast.success(title, { description });
  },
  error: (title: string, description?: string) => {
    sonnerToast.error(title, { description });
  },
  warning: (title: string, description?: string) => {
    sonnerToast.warning(title, { description });
  },
  info: (title: string, description?: string) => {
    sonnerToast.info(title, { description });
  },
  loading: (title: string, description?: string) => {
    sonnerToast.loading(title, { description });
  },
  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading,
      success,
      error,
    });
  },
};

// Notification Badge Component
interface NotificationBadgeProps {
  count: number;
  max?: number;
  className?: string;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  max = 99,
  className,
}) => {
  if (count === 0) return null;

  const displayCount = count > max ? `${max}+` : count.toString();

  return (
    <span
      className={cn(
        "absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs font-medium flex items-center justify-center",
        className
      )}
    >
      {displayCount}
    </span>
  );
};

// Notification Bell Component
interface NotificationBellProps {
  count?: number;
  onClick?: () => void;
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  count = 0,
  onClick,
  className,
}) => {
  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={onClick}
        className={className}
      >
        <Bell className="h-5 w-5" />
        <NotificationBadge count={count} />
      </Button>
    </div>
  );
};

