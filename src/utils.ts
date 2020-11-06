export function randomInt(max: number, min: number = 0) {
  max = Math.floor(max);
  min = Math.floor(min);
  return min + Math.floor(Math.random() * (max - min));
}

export function debounce<Context extends { [key: string]: any }>(
  fn: (...args: any[]) => any,
  timeout: number
) {
  let timeoutId: number | null = null;
  let context: Context = {} as Context;
  return function (...args: any[]) {
    if (typeof timeoutId === "number") {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => fn(context, ...args), timeout);
  };
}
