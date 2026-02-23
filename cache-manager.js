/**
 * Cache Manager for MMM-MyTeams-LeagueTable
 *
 * Handles persistent disk caching of league data with:
 * - TTL (Time-To-Live) expiration
 * - Automatic cache updates after successful fetches
 * - Graceful fallback to cached data on network failures
 * - Memory cache for frequently accessed data
 */

const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");

class CacheManager {
	constructor(modulePath) {
		this.modulePath = modulePath;
		this.cacheDir = path.join(modulePath, ".cache");
		this.memoryCache = new Map(); // In-memory cache for speed
		this.maxMemoryEntries = 20; // Maximum number of entries to keep in memory (LRU)
		this.defaultTTL = 24 * 60 * 60 * 1000; // 24 hours default
		this.maxCacheAge = 7 * 24 * 60 * 60 * 1000; // 7 days max before deletion
		this.debug = false;

		// Ensure cache directory exists
		this.ensureCacheDir();
	}

	/**
	 * Ensure cache directory exists
	 */
	ensureCacheDir() {
		if (!fs.existsSync(this.cacheDir)) {
			try {
				fs.mkdirSync(this.cacheDir, { recursive: true });
				if (this.debug) {
					console.log(
						` CacheManager: Created cache directory at ${this.cacheDir}`
					);
				}
			} catch (error) {
				console.error(
					" CacheManager: Failed to create cache directory:",
					error
				);
			}
		}
	}

	/**
	 * Get cache file path for a league
	 * @param {string} leagueType - League identifier (e.g., "SCOTLAND_PREMIERSHIP")
	 * @returns {string} Path to cache file
	 */
	getCacheFilePath(leagueType) {
		const sanitized = leagueType.toLowerCase().replace(/[^a-z0-9_]/g, "_");
		return path.join(this.cacheDir, `${sanitized}.json`);
	}

	/**
	 * Get cached data for a league (async)
	 * @param {string} leagueType - League identifier
	 * @returns {Promise<object | null>} Cached data or null if not found/expired
	 */
	async get(leagueType) {
		// Check memory cache first
		const memCacheEntry = this.memoryCache.get(leagueType);
		if (memCacheEntry && !this.isExpired(memCacheEntry)) {
			if (this.debug) {
				console.log(` CacheManager: Cache HIT (memory) for ${leagueType}`);
			}
			// LRU: Refresh entry position in Map
			this.memoryCache.delete(leagueType);
			this.memoryCache.set(leagueType, memCacheEntry);
			return memCacheEntry.data;
		}

		// Check disk cache
		const cacheFile = this.getCacheFilePath(leagueType);
		try {
			await fsPromises.access(cacheFile);
		} catch {
			if (this.debug) {
				console.log(
					` CacheManager: Cache MISS for ${leagueType} - file not found`
				);
			}
			return null;
		}

		try {
			const fileContent = await fsPromises.readFile(cacheFile, "utf8");
			const cacheEntry = JSON.parse(fileContent);

			if (this.isExpired(cacheEntry)) {
				if (this.debug) {
					console.log(` CacheManager: Cache EXPIRED for ${leagueType}`);
				}
				await this.delete(leagueType); // Clean up expired cache
				return null;
			}

			if (this.debug) {
				const age = Math.round((Date.now() - cacheEntry.timestamp) / 1000);
				console.log(
					` CacheManager: Cache HIT (disk) for ${leagueType} - Age: ${age}s`
				);
			}

			// Store in memory cache for next time
			this.memoryCache.set(leagueType, cacheEntry);
			return cacheEntry.data;
		} catch (error) {
			console.error(
				` CacheManager: Error reading cache for ${leagueType}:`,
				error.message
			);
			return null;
		}
	}

	/**
	 * Save league data to cache (async, non-blocking)
	 * @param {string} leagueType - League identifier
	 * @param {object} data - League data to cache
	 * @param {number} ttl - Time-to-live in milliseconds (optional)
	 * @returns {Promise<boolean>} Success status
	 */
	async set(leagueType, data, ttl = null) {
		try {
			const cacheEntry = {
				leagueType: leagueType,
				timestamp: Date.now(),
				ttl: ttl || this.defaultTTL,
				data: data,
				version: 1 // For future migrations
			};

			const cacheFile = this.getCacheFilePath(leagueType);
			
			// Update memory cache immediately (synchronous for instant availability)
			if (this.memoryCache.has(leagueType)) {
				this.memoryCache.delete(leagueType);
			} else if (this.memoryCache.size >= this.maxMemoryEntries) {
				// Remove oldest entry (first in Map)
				const oldestKey = this.memoryCache.keys().next().value;
				this.memoryCache.delete(oldestKey);
				if (this.debug) {
					console.log(` CacheManager: Memory cache full, evicted ${oldestKey}`);
				}
			}
			this.memoryCache.set(leagueType, cacheEntry);

			// Write to disk asynchronously (non-blocking)
			await fsPromises.writeFile(cacheFile, JSON.stringify(cacheEntry, null, 2), "utf8");

			if (this.debug) {
				console.log(
					` CacheManager: Cache SET for ${leagueType} (${data.teams?.length || 0} teams)`
				);
			}

			return true;
		} catch (error) {
			console.error(
				` CacheManager: Error writing cache for ${leagueType}:`,
				error.message
			);
			return false;
		}
	}

	/**
	 * Delete cached data for a league (async)
	 * @param {string} leagueType - League identifier
	 * @returns {Promise<boolean>} Success status
	 */
	async delete(leagueType) {
		try {
			const cacheFile = this.getCacheFilePath(leagueType);
			try {
				await fsPromises.access(cacheFile);
				await fsPromises.unlink(cacheFile);
				this.memoryCache.delete(leagueType);

				if (this.debug) {
					console.log(` CacheManager: Cache DELETED for ${leagueType}`);
				}
				return true;
			} catch {
				return false;
			}
		} catch (error) {
			console.error(
				` CacheManager: Error deleting cache for ${leagueType}:`,
				error.message
			);
			return false;
		}
	}

	/**
	 * Clear all cache (async)
	 * @returns {Promise<number>} Number of cache files deleted
	 */
	async clearAll() {
		try {
			try {
				await fsPromises.access(this.cacheDir);
			} catch {
				return 0;
			}

			const files = await fsPromises.readdir(this.cacheDir);
			let deleted = 0;

			for (const file of files) {
				if (file.endsWith(".json")) {
					try {
						await fsPromises.unlink(path.join(this.cacheDir, file));
						deleted++;
					} catch (error) {
						console.error(
							` CacheManager: Error deleting ${file}:`,
							error.message
						);
					}
				}
			}

			this.memoryCache.clear();

			if (this.debug) {
				console.log(
					` CacheManager: Cleared all cache (${deleted} files deleted)`
				);
			}

			return deleted;
		} catch (error) {
			console.error(" CacheManager: Error clearing cache:", error.message);
			return 0;
		}
	}

	/**
	 * Check if cache entry is expired
	 * @param cacheEntry
	 * @private
	 */
	isExpired(cacheEntry) {
		const age = Date.now() - cacheEntry.timestamp;
		const ttl = cacheEntry.ttl || this.defaultTTL;
		return age > ttl;
	}

	/**
	 * Get cache statistics (async)
	 * @returns {Promise<object>} Cache statistics
	 */
	async getStats() {
		try {
			try {
				await fsPromises.access(this.cacheDir);
			} catch {
				return {
					cacheDir: this.cacheDir,
					totalFiles: 0,
					memoryEntries: this.memoryCache.size,
					entries: []
				};
			}

			const files = await fsPromises.readdir(this.cacheDir);
			const entries = [];

			for (const file of files) {
				if (file.endsWith(".json")) {
					try {
						const filePath = path.join(this.cacheDir, file);
						const stats = await fsPromises.stat(filePath);
						const content = await fsPromises.readFile(filePath, "utf8");
						const cacheEntry = JSON.parse(content);

						const age = Date.now() - cacheEntry.timestamp;
						const ttl = cacheEntry.ttl || this.defaultTTL;
						const isExpired = age > ttl;
						const expiresIn = Math.max(0, ttl - age);

						entries.push({
							leagueType: cacheEntry.leagueType,
							fileName: file,
							teams: cacheEntry.data?.teams?.length || 0,
							fileSize: stats.size,
							cacheAge: Math.round(age / 1000), // seconds
							expiresIn: Math.round(expiresIn / 1000), // seconds
							isExpired: isExpired,
							timestamp: new Date(cacheEntry.timestamp).toISOString()
						});
					} catch (error) {
						console.error(
							` CacheManager: Error reading stats for ${file}:`,
							error.message
						);
					}
				}
			}

			return {
				cacheDir: this.cacheDir,
				totalFiles: files.filter((f) => f.endsWith(".json")).length,
				memoryEntries: this.memoryCache.size,
				entries: entries.sort((a, b) =>
					a.leagueType.localeCompare(b.leagueType)
				)
			};
		} catch (error) {
			console.error(" CacheManager: Error getting stats:", error.message);
			return null;
		}
	}

	/**
	 * Clean up expired cache entries (async)
	 * @returns {Promise<number>} Number of expired files deleted
	 */
	async cleanupExpired() {
		try {
			try {
				await fsPromises.access(this.cacheDir);
			} catch {
				return 0;
			}

			const files = await fsPromises.readdir(this.cacheDir);
			let deleted = 0;

			for (const file of files) {
				if (file.endsWith(".json")) {
					try {
						const filePath = path.join(this.cacheDir, file);
						const content = await fsPromises.readFile(filePath, "utf8");
						const cacheEntry = JSON.parse(content);

						if (this.isExpired(cacheEntry)) {
							await fsPromises.unlink(filePath);
							this.memoryCache.delete(cacheEntry.leagueType);
							deleted++;
						}
					} catch (error) {
						console.error(
							` CacheManager: Error checking ${file}:`,
							error.message
						);
					}
				}
			}

			if (this.debug && deleted > 0) {
				console.log(
					` CacheManager: Cleaned up ${deleted} expired cache entries`
				);
			}

			return deleted;
		} catch (error) {
			console.error(" CacheManager: Error during cleanup:", error.message);
			return 0;
		}
	}

	/**
	 * Set debug mode
	 * @param {boolean} enabled - Enable debug logging
	 */
	setDebug(enabled) {
		this.debug = enabled;
	}
}

module.exports = CacheManager;
