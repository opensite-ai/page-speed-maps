import "@testing-library/jest-dom";

// JSDOM doesn't provide ResizeObserver by default; mock a minimal implementation
class ResizeObserverMock {
	callback: ResizeObserverCallback;

	constructor(callback: ResizeObserverCallback) {
		this.callback = callback;
	}

	observe() {
		// No-op for tests; could invoke callback immediately if needed
	}

	unobserve() {
		// No-op
	}

	disconnect() {
		// No-op
	}
}

// @ts-ignore
global.ResizeObserver = ResizeObserverMock;

