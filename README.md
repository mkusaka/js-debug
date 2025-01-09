# @mkusaka/js-debug

A simple yet powerful TypeScript logger that outputs structured JSON logs, including caller file location in the format `filepath:line:col`. It also supports context inheritance via a `clone()` method, allowing you to maintain common logging metadata across your application.

## Features

- **Structured JSON logs**: Outputs logs as JSON, including timestamp, level, message, context, and file location.
- **Caller file location**: Includes the calling file path and position (`filepath:line:col`), making it easier to jump to code in many editors/terminals.
- **Context inheritance**: Use `clone()` to create a new logger that merges parent context with additional context (e.g., request ID).
- **Log levels**: Supports `debug`, `info`, `warn`, and `error`.
- **TypeScript**: Fully written in TypeScript for type safety.

## Installation

```bash
npm install --save @mkusaka/js-debug
```

## Usage

```ts
// logger.ts
import { Logger } from "@mkusaka/js-debug";

// 1. Create a logger with optional context
const logger = new Logger({ service: "my-service" });

// 2. Log messages
logger.info("Hello from our service", { foo: "bar" });
logger.error("Something went wrong", { code: 500 });

// 3. Clone the logger to add more context
const childLogger = logger.clone({ requestId: "123abc" });
childLogger.debug("This is a child logger message");

```

### Sample Output

When calling `logger.info("Hello from our service", { foo: "bar" })`, you might see something like:

```json
{
  "level": "info",
  "timestamp": "2025-01-09T12:00:00.000Z",
  "message": "Hello from our service",
  "context": {
    "service": "my-service",
    "foo": "bar"
  },
  "fileLocation": "/path/to/your/project/example.ts:10:12"
}

```

Depending on your environment (e.g., VSCode integrated terminal), you can often click the `fileLocation` (`/path/to/your/project/example.ts:10:12`) to jump straight to the relevant line and column.

## API

### `class Logger`

```ts
constructor(context: LoggerContext = {})
```

- Creates a new logger with the given `context` object.
- `LoggerContext` is just a map: `{ [key: string]: any }`.

### `logger.clone(additionalContext: LoggerContext = {}): Logger`

- Returns a new `Logger` instance that merges the parent context with `additionalContext`.

### `logger.debug(message: any, ...args: any[]): void`

Logs a debug-level message with optional arguments.

### `logger.info(message: any, ...args: any[]): void`

Logs an info-level message with optional arguments.

### `logger.warn(message: any, ...args: any[]): void`

Logs a warn-level message with optional arguments.

### `logger.error(message: any, ...args: any[]): void`

Logs an error-level message with optional arguments.

## Configuration

- **Log output**: The default sample logs to `console.log`. Adjust to your preferred output (e.g., files, log aggregation service) if needed.
- **Call stack depth**: The library uses `getCallSite(2)` by default to obtain the file location from two levels above the call (i.e., `user code -> logger method -> internal log function`). If you wrap logger methods further, you may need to adjust the depth.

## Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/my-new-feature`).
3. Commit your changes (`git commit -m 'Add my new feature'`).
4. Push to the branch (`git push origin feature/my-new-feature`).
5. Open a pull request.

## License

This project is licensed under the MIT License.

Feel free to modify and distribute it as per the license terms.
