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
	 * Get cached data for a league
	 * @param {string} leagueType - League identifier
	 * @returns {object | null} Cached data or null if not found/expired
	 */
	get(leagueType) {
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
		if (!fs.existsSync(cacheFile)) {
			if (this.debug) {
				console.log(
					` CacheManager: Cache MISS for ${leagueType} - file not found`
				);
			}
			return null;
		}

		try {
			const fileContent = fs.readFileSync(cacheFile, "utf8");
			const cacheEntry = JSON.parse(fileContent);

			if (this.isExpired(cacheEntry)) {
				if (this.debug) {
					console.log(` CacheManager: Cache EXPIRED for ${leagueType}`);
				}
				this.delete(leagueType); // Clean up expired cache
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
	 * Save league data to cache
	 * @param {string} leagueType - League identifier
	 * @param {object} data - League data to cache
	 * @param {number} ttl - Time-to-live in milliseconds (optional)
	 * @returns {boolean} Success status
	 */
	set(leagueType, data, ttl = null) {
		try {
			const cacheEntry = {
				leagueType: leagueType,
				timestamp: Date.now(),
				ttl: ttl || this.defaultTTL,
				data: data,
				version: 1 // For future migrations
			};

			const cacheFile = this.getCacheFilePath(leagueType);
			fs.writeFileSync(cacheFile, JSON.stringify(cacheEntry, null, 2), "utf8");
			// Also update memory cache with LRU policy
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
	 * Delete cached data for a league
	 * @param {string} leagueType - League identifier
	 * @returns {boolean} Success status
	 */
	delete(leagueType) {
		try {
			const cacheFile = this.getCacheFilePath(leagueType);
			if (fs.existsSync(cacheFile)) {
				fs.unlinkSync(cacheFile);
				this.memoryCache.delete(leagueType);

				if (this.debug) {
					console.log(` CacheManager: Cache DELETED for ${leagueType}`);
				}
				return true;
			}
			return false;
		} catch (error) {
			console.error(
				` CacheManager: Error deleting cache for ${leagueType}:`,
				error.message
			);
			return false;
		}
	}

	/**
	 * Clear all cache
	 * @returns {number} Number of cache files deleted
	 */
	clearAll() {
		try {
			if (!fs.existsSync(this.cacheDir)) {
				return 0;
			}

			const files = fs.readdirSync(this.cacheDir);
			let deleted = 0;

			for (const file of files) {
				if (file.endsWith(".json")) {
					try {
						fs.unlinkSync(path.join(this.cacheDir, file));
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
	 * Get cache statistics
	 * @returns {object} Cache statistics
	 */
	getStats() {
		try {
			if (!fs.existsSync(this.cacheDir)) {
				return {
					cacheDir: this.cacheDir,
					totalFiles: 0,
					memoryEntries: this.memoryCache.size,
					entries: []
				};
			}

			const files = fs.readdirSync(this.cacheDir);
			const entries = [];

			for (const file of files) {
				if (file.endsWith(".json")) {
					try {
						const filePath = path.join(this.cacheDir, file);
						const stats = fs.statSync(filePath);
						const content = fs.readFileSync(filePath, "utf8");
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
	 * Clean up expired cache entries
	 * @returns {number} Number of expired files deleted
	 */
	cleanupExpired() {
		try {
			if (!fs.existsSync(this.cacheDir)) {
				return 0;
			}

			const files = fs.readdirSync(this.cacheDir);
			let deleted = 0;

			for (const file of files) {
				if (file.endsWith(".json")) {
					try {
						const filePath = path.join(this.cacheDir, file);
						const content = fs.readFileSync(filePath, "utf8");
						const cacheEntry = JSON.parse(content);

						if (this.isExpired(cacheEntry)) {
							fs.unlinkSync(filePath);
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
