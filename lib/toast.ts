type Toast = { id: number; message: string };

let toast: Toast | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function showToast(message: string) {
  toast = { id: Date.now(), message };
  emit();
  clearTimeout(timer);
  timer = setTimeout(() => {
    toast = null;
    emit();
  }, 2500);
}

export function subscribeToast(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getToast() {
  return toast;
}

export function getNoToast() {
  return null;
}
