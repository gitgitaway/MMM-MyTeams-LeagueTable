/**
 * Shared Request Manager
 *
 * Global singleton that coordinates ALL fetch requests across multiple MagicMirror modules
 * to prevent API overload, timeouts, and conflicts.
 *
 * Features:
 * - Global request queue with priority levels
 * - Configurable throttling between requests
 * - Request deduplication (prevents duplicate simultaneous requests)
 * - Automatic retry with exponential backoff
 * - Per-domain rate limiting
 *
 * Usage:
 *   const RequestManager = require('./shared-request-manager.js');
 *   const manager = RequestManager.getInstance();
 *
 *   const result = await manager.queueRequest({
 *     url: 'https://api.example.com/data',
 *     options: { method: 'GET' },
 *     priority: 1,
 *     moduleId: 'MMM-MyModule',
 *     timeout: 10000
 *   });
 */

// Initialize fetch (prefer native Node 18+, fallback to node-fetch v2)
let _fetchImpl = null;
let _fetchType = "unknown";

/**
 *
 */
function initializeFetch() {
	try {
		if (typeof globalThis.fetch === "function") {
			_fetchImpl = globalThis.fetch.bind(globalThis);
			_fetchType = "native";
			return true;
		}
	} catch {
		// Native fetch not available
	}

	try {
		const nodeFetch = require("node-fetch");
		if (typeof nodeFetch === "function") {
			_fetchImpl = nodeFetch;
			_fetchType = "node-fetch-v2";
			return true;
		}
	} catch {
		// node-fetch not available
	}

	console.error(
		"[SharedRequestManager] ERROR: No fetch implementation available. Install node-fetch@2 or use Node.js 18+"
	);
	_fetchImpl = null;
	_fetchType = "none";
	return false;
}

initializeFetch();

class SharedRequestManager {
	constructor() {
		if (SharedRequestManager.instance) {
			return SharedRequestManager.instance;
		}

		this.queue = [];
		this.processing = false;
		this.lastRequestTime = 0;
		this.activeRequests = new Map(); // Track in-flight requests for deduplication
		this.domainLastRequest = new Map(); // Track last request time per domain

		this.userAgents = [
			"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
			"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
			"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
			"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0",
			"Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0",
			"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Edge/121.0.0.0",
			"Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1"
		];

		// Configuration
		this.config = {
			minRequestInterval: 2000, // Minimum 2 seconds between ANY requests
			minDomainInterval: 1000, // Minimum 1 second between requests to same domain
			jitterFactor: 0.2, // 20% random jitter to avoid patterns
			maxRetries: 3, // Maximum retry attempts
			retryDelay: 2000, // Initial retry delay (exponential backoff)
			requestTimeout: 15000, // Default request timeout
			maxConcurrent: 1, // Process requests one at a time
			queueCheckInterval: 500, // Check queue every 500ms
			debug: false // Enable debug logging
		};

		// Start queue processor
		this.startQueueProcessor();

		SharedRequestManager.instance = this;
		this.log("✓ Shared Request Manager initialized");
	}

	static getInstance() {
		if (!SharedRequestManager.instance) {
			SharedRequestManager.instance = new SharedRequestManager();
		}
		return SharedRequestManager.instance;
	}

	log(message, level = "info") {
		if (this.config.debug || level === "error") {
			const prefix = "[SharedRequestManager]";
			if (level === "error") {
				console.error(`${prefix} ERROR:`, message);
			} else {
				console.log(`${prefix}`, message);
			}
		}
	}

	/**
	 * Queue a request for processing
	 * @param {object} request - Request configuration
	 * @param {string} request.url - URL to fetch
	 * @param {object} request.options - Fetch options (method, headers, etc.)
	 * @param {number} request.priority - Priority (0=highest, 1=normal, 2=low)
	 * @param {string} request.moduleId - Module identifier for logging
	 * @param {number} request.timeout - Request timeout in ms
	 * @param {boolean} request.deduplicate - Enable request deduplication (default: true)
	 * @returns {Promise} - Resolves with response data or rejects with error
	 */
	queueRequest(request) {
		const requestId = this.generateRequestId(request);
		const priority = request.priority || 1;
		const moduleId = request.moduleId || "unknown";
		const deduplicate = request.deduplicate !== false;

		// Check for duplicate in-flight request
		if (deduplicate && this.activeRequests.has(requestId)) {
			this.log(`Deduplicating request from ${moduleId}: ${request.url}`);
			// Return the existing promise
			return this.activeRequests.get(requestId).promise;
		}

		// Create a new promise for this request
		const promise = new Promise((resolve, reject) => {
			const queuedRequest = {
				id: requestId,
				url: request.url,
				options: request.options || {},
				priority: priority,
				moduleId: moduleId,
				timeout: request.timeout || this.config.requestTimeout,
				retries: 0,
				maxRetries: request.maxRetries || this.config.maxRetries,
				resolve: resolve,
				reject: reject,
				queuedAt: Date.now()
			};

			// Add to queue (sorted by priority)
			this.queue.push(queuedRequest);
			this.queue.sort((a, b) => a.priority - b.priority);

			this.log(
				`Queued request from ${moduleId} (priority: ${priority}, queue size: ${this.queue.length}): ${request.url}`
			);

			// Start processing if not already running
			this.processQueue();
		});

		// Track active request for deduplication
		if (deduplicate) {
			this.activeRequests.set(requestId, { promise });
		}

		return promise;
	}

	/**
	 * Generate unique request ID for deduplication
	 * @param request
	 */
	generateRequestId(request) {
		const url = request.url;
		const method = request.options?.method || "GET";
		const body = request.options?.body || "";
		return `${method}:${url}:${body}`;
	}

	/**
	 * Extract domain from URL
	 * @param url
	 */
	getDomain(url) {
		try {
			const urlObj = new URL(url);
			return urlObj.hostname;
		} catch {
			return "unknown";
		}
	}

	/**
	 * Start the queue processor
	 */
	startQueueProcessor() {
		setInterval(() => {
			if (!this.processing && this.queue.length > 0) {
				this.processNextRequest();
			}
		}, this.config.queueCheckInterval);
	}

	/**
	 * Manually trigger queue processing (non-blocking)
	 */
	processQueue() {
		// Trigger immediate processing if not already processing
		if (!this.processing && this.queue.length > 0) {
			// Use setImmediate to avoid blocking the caller
			setImmediate(() => this.processNextRequest());
		}
	}

	/**
	 * Process the next request in the queue
	 */
	async processNextRequest() {
		if (this.processing || this.queue.length === 0) {
			return;
		}

		this.processing = true;

		try {
			const request = this.queue.shift();
			const now = Date.now();
			const domain = this.getDomain(request.url);

			// Enforce global rate limiting
			const timeSinceLastRequest = now - this.lastRequestTime;
			if (timeSinceLastRequest < this.config.minRequestInterval) {
				const baseDelay = this.config.minRequestInterval - timeSinceLastRequest;
				const jitter = baseDelay * this.config.jitterFactor * Math.random();
				const delay = Math.round(baseDelay + jitter);
				this.log(
					`Global throttle: waiting ${delay}ms (including ${Math.round(jitter)}ms jitter) before processing request from ${request.moduleId}`
				);
				await this.sleep(delay);
			}

			// Enforce per-domain rate limiting
			const domainLastRequest = this.domainLastRequest.get(domain) || 0;
			const timeSinceDomainRequest = Date.now() - domainLastRequest;
			if (timeSinceDomainRequest < this.config.minDomainInterval) {
				const baseDelay = this.config.minDomainInterval - timeSinceDomainRequest;
				const jitter = baseDelay * this.config.jitterFactor * Math.random();
				const delay = Math.round(baseDelay + jitter);
				this.log(`Domain throttle (${domain}): waiting ${delay}ms (including ${Math.round(jitter)}ms jitter)`);
				await this.sleep(delay);
			}

			// Execute the request
			this.log(`Processing request from ${request.moduleId}: ${request.url}`);
			const result = await this.executeRequest(request);

			// Update timing
			this.lastRequestTime = Date.now();
			this.domainLastRequest.set(domain, this.lastRequestTime);

			// Remove from active requests
			this.activeRequests.delete(request.id);

			// Resolve the promise
			request.resolve(result);
		} catch (error) {
			this.log(`Request processing error: ${error.message}`, "error");
		} finally {
			this.processing = false;
		}
	}

	/**
	 * Execute a single request with timeout and retry logic
	 * @param request
	 */
	async executeRequest(request) {
		if (!_fetchImpl) {
			throw new Error(`Fetch not available (${_fetchType})`);
		}

		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), request.timeout);

		// Build options object
		const options = {
			...request.options,
			signal: controller.signal
		};

		// Inject random User-Agent if not already present
		if (!options.headers) options.headers = {};
		if (!options.headers["User-Agent"]) {
			const randomUA = this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
			options.headers["User-Agent"] = randomUA;
		}

		// Native fetch doesn't support 'agent' option - switch to node-fetch if agent is needed
		let fetchToUse = _fetchImpl;
		let fetchTypeUsed = _fetchType;

		if (_fetchType === "native" && "agent" in options) {
			// If agent is provided (even if undefined), try to use node-fetch instead
			try {
				const nodeFetch = require("node-fetch");
				if (typeof nodeFetch === "function") {
					fetchToUse = nodeFetch;
					fetchTypeUsed = "node-fetch-v2";
					if (options.agent) {
						this.log(
							`Switching to node-fetch for ${request.moduleId} to support custom agent (SSL handling)`
						);
					}
				} else {
					// node-fetch not available, remove agent option
					this.log(
						`Warning: Native fetch doesn't support 'agent' option. Removing it for ${request.moduleId}`,
						"warn"
					);
					delete options.agent;
				}
			} catch {
				// node-fetch not available, remove agent option
				this.log(
					`Warning: Native fetch doesn't support 'agent' option and node-fetch not available. Removing agent for ${request.moduleId}`,
					"warn"
				);
				delete options.agent;
			}
		}

		try {
			const response = await fetchToUse(request.url, options);
			clearTimeout(timeoutId);

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			// Try to parse as JSON, fallback to text
			const contentType = response.headers.get("content-type");
			let data;
			if (contentType && contentType.includes("application/json")) {
				data = await response.json();
			} else {
				data = await response.text();
			}

			this.log(`✓ Request completed from ${request.moduleId}: ${request.url}`);
			return { success: true, data: data, status: response.status };
		} catch (error) {
			clearTimeout(timeoutId);

			// Enhanced error logging for debugging
			this.log(`Fetch error details for ${request.moduleId}:`, "error");
			this.log(`  URL: ${request.url}`, "error");
			this.log(`  Error name: ${error.name}`, "error");
			this.log(`  Error message: ${error.message}`, "error");
			this.log(
				`  Error cause: ${error.cause ? JSON.stringify(error.cause) : "none"}`,
				"error"
			);
			this.log(`  Fetch type used: ${fetchTypeUsed}`, "error");
			this.log(
				`  Options passed: ${JSON.stringify(Object.keys(options))}`,
				"error"
			);

			// Handle retries
			if (request.retries < request.maxRetries && this.shouldRetry(error)) {
				request.retries++;
				const retryDelay =
					this.config.retryDelay * Math.pow(2, request.retries - 1);
				this.log(
					`Retry ${request.retries}/${request.maxRetries} for ${request.moduleId} after ${retryDelay}ms: ${error.message}`
				);

				await this.sleep(retryDelay);

				// Re-queue the request
				this.queue.unshift(request);
				return this.executeRequest(request);
			}

			// Max retries exceeded or non-retryable error
			this.log(
				`Request failed from ${request.moduleId}: ${error.message}`,
				"error"
			);
			this.activeRequests.delete(request.id);
			request.reject(error);
			throw error;
		}
	}

	/**
	 * Determine if an error is retryable
	 * @param error
	 */
	shouldRetry(error) {
		// Retry on network errors, timeouts, and 5xx errors
		if (error.name === "AbortError") return true;
		if (error.message.includes("ETIMEDOUT")) return true;
		if (error.message.includes("ECONNRESET")) return true;
		if (error.message.includes("HTTP 5")) return true;
		return false;
	}

	/**
	 * Sleep utility
	 * @param ms
	 */
	sleep(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	/**
	 * Get queue statistics
	 */
	getStats() {
		return {
			queueSize: this.queue.length,
			activeRequests: this.activeRequests.size,
			processing: this.processing,
			lastRequestTime: this.lastRequestTime
		};
	}

	/**
	 * Update configuration
	 * @param newConfig
	 */
	updateConfig(newConfig) {
		this.config = { ...this.config, ...newConfig };
		this.log(`Configuration updated: ${JSON.stringify(newConfig)}`);
	}

	/**
	 * Enable debug mode
	 */
	enableDebug() {
		this.config.debug = true;
		this.log("Debug mode enabled");
	}

	/**
	 * Disable debug mode
	 */
	disableDebug() {
		this.config.debug = false;
	}
}

// Export singleton instance
module.exports = SharedRequestManager;
