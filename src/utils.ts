export function randomInt(max: number, min: number = 0) {
  max = Math.floor(max);
  min = Math.floor(min);
  return min + Math.floor(Math.random() * (max - min));
}

export function debounce(fn: (...args: any[]) => any, timeout: number) {
  let timeoutId: number | null = null;
  return function (...args: any[]) {
    if (typeof timeoutId === "number") {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => fn(...args), timeout);
  };
}
