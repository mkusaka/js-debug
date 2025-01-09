import { format } from "util";

type LogLevel = "debug" | "info" | "warn" | "error";

interface LoggerContext {
  [key: string]: any;
}

interface LogEntry {
  level: LogLevel;
  timestamp: string;
  message: string;
  context?: LoggerContext;
  fileLocation: string; // filepath:line:col
}

export class Logger {
  private context: LoggerContext;

  constructor(context: LoggerContext = {}) {
    this.context = context;
  }

  /**
   * Returns a new Logger that inherits the current context
   * and merges any additional context.
   */
  public clone(additionalContext: LoggerContext = {}): Logger {
    return new Logger({
      ...this.context,
      ...additionalContext,
    });
  }

  public debug(message: any, ...args: any[]) {
    this.log("debug", message, ...args);
  }

  public info(message: any, ...args: any[]) {
    this.log("info", message, ...args);
  }

  public warn(message: any, ...args: any[]) {
    this.log("warn", message, ...args);
  }

  public error(message: any, ...args: any[]) {
    this.log("error", message, ...args);
  }

  private log(level: LogLevel, message: any, ...args: any[]) {
    // Increase to 3 so the call site points to index.test.ts (the test file),
    // rather than index.ts (this file).
    const { filePath, lineNumber, colNumber } = getCallSite(3);

    // Create "[filepath]:[line]:[col]" for easier code navigation
    const fileLocation = `${filePath}:${lineNumber}:${colNumber}`;

    // Merge any object arguments into the existing context
    let mergedContext = { ...this.context };
    for (const arg of args) {
      if (typeof arg === "object" && arg !== null && !Array.isArray(arg)) {
        mergedContext = { ...mergedContext, ...arg };
      }
    }

    // Format the message
    const formattedMessage =
      typeof message === "string"
        ? format(message, ...args)
        : JSON.stringify(message);

    const logEntry: LogEntry = {
      level,
      timestamp: new Date().toISOString(),
      message: formattedMessage,
      context: mergedContext,
      fileLocation,
    };

    console.log(JSON.stringify(logEntry));
  }
}

/**
 * Retrieves file path, line number, and column number from the call stack.
 * `depth` represents how many levels up the stack we go.
 */
function getCallSite(depth: number = 2) {
  const original = Error.prepareStackTrace;
  Error.prepareStackTrace = (_, stack) => stack;
  const stack = new Error().stack as unknown as NodeJS.CallSite[];
  Error.prepareStackTrace = original;

  const callSite = stack[depth];
  const filePath = callSite?.getFileName() ?? "";
  const lineNumber = callSite?.getLineNumber()?.toString() ?? "";
  const colNumber = callSite?.getColumnNumber()?.toString() ?? "";

  return { filePath, lineNumber, colNumber };
}
