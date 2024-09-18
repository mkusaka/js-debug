import { inspect } from "util";
export function dbg<T>(value: T, { depth }: { depth?: number | null } = {}): T {
  const error = new Error();
  const stack = error.stack?.split("\n")[2];
  const [, filePath, lineNumber, colNumber] = stack?.match(/\((.*):(\d+):(\d+)\)/) || [];

  console.error(`[${filePath}:${lineNumber}:${colNumber}]`, inspect(value, { showHidden: true, depth, colors: true }));
  return value;
}
