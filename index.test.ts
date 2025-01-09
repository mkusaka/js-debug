import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  afterEach,
  vi,
} from "vitest";
import { Logger } from "./index";

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
    // Mock console.log
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterAll(() => {
    // Restore console.log
    consoleLogSpy.mockRestore();
  });

  afterEach(() => {
    // Clear call history after each test
    consoleLogSpy.mockClear();
  });

  it("info method outputs structured JSON logs with 'file:line:col' format", () => {
    const logger = new Logger({ service: "my-service" });
    logger.info("Hello world", { foo: "bar" });

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);

    const [loggedStr] = consoleLogSpy.mock.calls[0];
    const parsed = JSON.parse(loggedStr as string) as LogEntry;

    expect(parsed.level).toBe("info");
    expect(parsed.message).toContain("Hello world");
    expect(parsed.context).toEqual({ service: "my-service", foo: "bar" });
    expect(parsed.timestamp).toBeDefined();

    // Now we expect to see "index.test.ts" in the file path,
    // because getCallSite(3) points to the test file.
    expect(parsed.fileLocation).toContain("index.test.ts");
    expect(parsed.fileLocation).toMatch(/:\d+:\d+$/);
  });

  it("debug method logs at debug level", () => {
    const logger = new Logger();
    logger.debug("Debug message");

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);

    const [loggedStr] = consoleLogSpy.mock.calls[0];
    const parsed = JSON.parse(loggedStr as string) as LogEntry;

    expect(parsed.level).toBe("debug");
    expect(parsed.message).toBe("Debug message");
    expect(parsed.fileLocation).toContain("index.test.ts");
    expect(parsed.fileLocation).toMatch(/:\d+:\d+$/);
  });

  it("clone merges additional context", () => {
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
    expect(parsed.fileLocation).toContain("index.test.ts");
    expect(parsed.fileLocation).toMatch(/:\d+:\d+$/);
  });

  it("error method logs an error-level message and merges context", () => {
    const logger = new Logger();
    logger.error("Something went wrong", { code: 500 });

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);

    const [loggedStr] = consoleLogSpy.mock.calls[0];
    const parsed = JSON.parse(loggedStr as string) as LogEntry;

    expect(parsed.level).toBe("error");
    expect(parsed.message).toContain("Something went wrong");
    expect(parsed.context).toEqual({ code: 500 });
    expect(parsed.fileLocation).toContain("index.test.ts");
    expect(parsed.fileLocation).toMatch(/:\d+:\d+$/);
  });
});
