export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastConfig {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  position?: ToastPosition;
  icon?: string;
  action?: ToastAction;
}

export interface ToastAction {
  text: string;
  onPress: () => void;
}

export type ToastPosition = 'top' | 'bottom' | 'center';

export interface ToastContextType {
  showToast: (config: Omit<ToastConfig, 'id'>) => void;
  hideToast: (id: string) => void;
  hideAllToasts: () => void;
}