export function dbg<T>(value: T) {
  const error = new Error();
  const stack = error.stack.split('\n')[2];
  const [, filePath, lineNumber] = stack.match(/\((.*):(\d+):\d+\)/) || [];

  console.error(`[${filePath}:${lineNumber}]`, value);
  return value;
}
