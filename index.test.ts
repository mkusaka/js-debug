import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { Logger } from "./index";

// ログの型定義
interface LogEntry {
  level: string;
  message: string;
  context: Record<string, unknown>;
  timestamp: string;
  fileLocation: string;
}

describe("Logger", () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeAll(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  afterEach(() => {
    consoleLogSpy.mockClear();
  });

  it("info メソッドが構造化ログを出力し、fileLocation は 'file:line:col' 形式になる", () => {
    const logger = new Logger({ service: "my-service" });
    logger.info("Hello world", { foo: "bar" });

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    const [loggedStr] = consoleLogSpy.mock.calls[0];

    // JSON をパースして型アサーション
    const parsed = JSON.parse(loggedStr as string) as LogEntry;

    expect(parsed.level).toBe("info");
    expect(parsed.message).toContain("Hello world");
    expect(parsed.context).toEqual({ service: "my-service" });
    expect(parsed.timestamp).toBeDefined();
    expect(parsed.fileLocation).toContain("logger.test.ts");
    expect(parsed.fileLocation).toMatch(/:\d+:\d+$/);
  });

  it("debug メソッドを呼び出すと debug レベルになる", () => {
    const logger = new Logger();
    logger.debug("Debug message");

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    const [loggedStr] = consoleLogSpy.mock.calls[0];
    const parsed = JSON.parse(loggedStr as string) as LogEntry;

    expect(parsed.level).toBe("debug");
    expect(parsed.message).toBe("Debug message");
    expect(parsed.fileLocation).toMatch(/logger.test.ts:\d+:\d+/);
  });

  it("clone したロガーで追加コンテキストを継承して出力できる", () => {
    const parentLogger = new Logger({ service: "my-service" });
    const childLogger = parentLogger.clone({ requestId: "123abc" });

    childLogger.warn("Child logger warn");

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    const [loggedStr] = consoleLogSpy.mock.calls[0];
    const parsed = JSON.parse(loggedStr as string) as LogEntry;

    expect(parsed.level).toBe("warn");
    expect(parsed.context).toEqual({
      service: "my-service",
      requestId: "123abc",
    });
    expect(parsed.message).toBe("Child logger warn");
    expect(parsed.fileLocation).toMatch(/logger.test.ts:\d+:\d+/);
  });

  it("error メソッドがエラーログを出力する", () => {
    const logger = new Logger();
    logger.error("Something went wrong", { code: 500 });

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    const [loggedStr] = consoleLogSpy.mock.calls[0];
    const parsed = JSON.parse(loggedStr as string) as LogEntry;

    expect(parsed.level).toBe("error");
    expect(parsed.message).toContain("Something went wrong");
    expect(parsed.context).toEqual({ code: 500 });
    expect(parsed.fileLocation).toMatch(/logger.test.ts:\d+:\d+/);
  });
});
