export const accessibility = {
	/**
	 * Enhanced A11Y helper: Add keyboard navigation support to any element (A11Y-01).
	 * Ensures the element is focusable and responds to Enter/Space keys.
	 * @param {HTMLElement} element - The element to enhance
	 * @param {Function} callback - The action to perform on activation
	 */
	addKeyboardNavigation(element, callback) {
		if (!element) return;
		element.setAttribute("tabindex", "0");
		element.addEventListener("keydown", (e) => {
			if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
				e.preventDefault();
				if (callback) callback(e);
			}
		});
	},

	/**
	 * A11Y helper: Save the currently focused element's state (A11Y-03).
	 * Uses data attributes to identify the focused element across DOM updates.
	 */
	saveFocusState() {
		const focusedElement = document.activeElement;
		if (focusedElement && focusedElement !== document.body) {
			this._lastFocusedPath = this._getElementPath(focusedElement);
			this.log(4, "A11Y", `Saving focus state: ${this._lastFocusedPath}`);
		}
	},

	/**
	 * A11Y helper: Restore focus to the previously focused element after DOM update (A11Y-03).
	 * Attempts to find the element by its saved path or a sensible fallback.
	 */
	restoreFocusState() {
		if (!this._lastFocusedPath) return;

		setTimeout(() => {
			const elementToFocus = document.querySelector(this._lastFocusedPath);
			if (elementToFocus) {
				elementToFocus.focus();
				this.log(4, "A11Y", `Restored focus to: ${this._lastFocusedPath}`);
			}
			this._lastFocusedPath = null;
		}, 100);
	},

	/**
	 * Private helper: Generate a unique selector path for an element.
	 * @param {HTMLElement} el - The element
	 * @returns {string} The CSS selector path
	 */
	_getElementPath(el) {
		if (!el) return "";
		let path = el.tagName.toLowerCase();
		if (el.id) return `#${el.id}`;
		if (el.className) {
			path += `.${el.className.split(" ").join(".")}`;
		}
		// Add data attributes for better specificity
		if (el.getAttribute("data-league")) {
			path += `[data-league="${el.getAttribute("data-league")}"]`;
		}
		if (el.getAttribute("data-tab")) {
			path += `[data-tab="${el.getAttribute("data-tab")}"]`;
		}
		return path;
	},

	createAriaLiveRegion() {
		if (!this.ariaLiveRegion) {
			this.ariaLiveRegion = document.createElement("div");
			this.ariaLiveRegion.setAttribute("role", "status");
			this.ariaLiveRegion.setAttribute("aria-live", "polite");
			this.ariaLiveRegion.setAttribute("aria-atomic", "true");
			this.ariaLiveRegion.className = "sr-only";
			this.ariaLiveRegion.style.position = "absolute";
			this.ariaLiveRegion.style.left = "-10000px";
			this.ariaLiveRegion.style.width = "1px";
			this.ariaLiveRegion.style.height = "1px";
			this.ariaLiveRegion.style.overflow = "hidden";
			document.body.appendChild(this.ariaLiveRegion);
		}
	},

	announceToScreenReader(message, force = false) {
		if (!message) return;
		const now = Date.now();
		if (!force && now - this.lastAnnouncement < this.announcementThrottle) {
			this.log(4, "CORE", `[A11Y] Throttled announcement: ${message}`);
			return;
		}
		this.lastAnnouncement = now;
		if (!this.ariaLiveRegion) {
			this.createAriaLiveRegion();
		}
		this.ariaLiveRegion.textContent = "";
		setTimeout(() => {
			this.ariaLiveRegion.textContent = message;
			this.log(4, "CORE", `[A11Y] Screen reader announcement: ${message}`);
		}, 100);
	},

	announceDataUpdate(leagueName) {
		const message = `League data updated for ${leagueName}`;
		this.announceToScreenReader(message);
	},

	announceLiveMatch(homeTeam, awayTeam, homeScore, awayScore, status) {
		const message = `Live match: ${homeTeam} ${homeScore} - ${awayScore} ${awayTeam}, ${status}`;
		this.announceToScreenReader(message);
	},

	announceMatchFinished(homeTeam, awayTeam, homeScore, awayScore) {
		const message = `Match finished: Final score ${homeTeam} ${homeScore} - ${awayScore} ${awayTeam}`;
		this.announceToScreenReader(message);
	}
};
