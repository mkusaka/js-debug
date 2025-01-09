// logger.ts
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
  fileLocation: string; // filepath:lineNumber:colNumber
}

export class Logger {
  private context: LoggerContext;

  constructor(context: LoggerContext = {}) {
    this.context = context;
  }

  /**
   * 親ロガーの context を継承した新しい Logger を返す
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
    // 2階層上の呼び出し元情報を取得 (this.log -> debug/info/... -> 呼び出し元)
    const { filePath, lineNumber, colNumber } = getCallSite(2);

    // クリックなどでコードジャンプしやすい "[filepath]:[line]:[col]" 形式を作成
    const fileLocation = `${filePath}:${lineNumber}:${colNumber}`;

    const formattedMessage =
      typeof message === "string"
        ? format(message, ...args)
        : JSON.stringify(message);

    const logEntry: LogEntry = {
      level,
      timestamp: new Date().toISOString(),
      message: formattedMessage,
      context: this.context,
      fileLocation,
    };

    // console.log で構造化ログ（JSON）を出力
    console.log(JSON.stringify(logEntry));
  }
}

/**
 * 呼び出し元のスタック情報からファイルパス・行番号・カラム番号を取得
 * depth は呼び出し階層を表す (this.log() -> debug()等 -> ユーザーコードなら2)
 */
function getCallSite(depth: number = 2) {
  // prepareStackTrace を一時的に上書きし、NodeJS.CallSite[] を取得
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
