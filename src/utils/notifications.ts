import { toast } from "sonner";

export function showErrorNotification(error: string, autoCloseTime?: number) {
  toast.error(error + "", {
    duration: autoCloseTime ?? 2500,
  });
}

export function showSuccessNotification(
  msg: string,
  options?: Parameters<typeof toast.success>[1],
) {
  toast.success(msg + "", {
    duration: 2500,
    ...options,
  });
}

export function showWarningNotification(msg: string) {
  toast.warning(msg + "", {
    duration: 2500,
  });
}

export function showLoadingNotification(msg: string, icon?: JSX.Element) {
  return toast.loading(msg, {
    icon,
  });
}
