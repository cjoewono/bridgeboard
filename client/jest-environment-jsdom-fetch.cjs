// Custom Jest environment that extends jsdom with Node 24's native fetch globals.
// MSW v2 requires Request/Response/Headers/fetch to exist as globals — jsdom
// does not implement the Fetch API, so we bridge them in from the Node runtime
// during environment setup (before jsdom global scope is locked in).
const { TestEnvironment } = require('jest-environment-jsdom');

class JSDOMWithFetch extends TestEnvironment {
  async setup() {
    await super.setup();
    // These are Node 24 native globals — available here in the Node runtime
    // context before jsdom takes ownership of globalThis.
    this.global.fetch = fetch;
    this.global.Request = Request;
    this.global.Response = Response;
    this.global.Headers = Headers;
    this.global.ReadableStream = ReadableStream;
    this.global.WritableStream = WritableStream;
    this.global.TransformStream = TransformStream;
    this.global.TextEncoder = TextEncoder;
    this.global.TextDecoder = TextDecoder;
    this.global.BroadcastChannel = BroadcastChannel;
  }
}

module.exports = JSDOMWithFetch;
