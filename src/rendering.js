import { LEAGUE_TABS, LEAGUE_HEADERS, EUROPEAN_LEAGUES } from './constants';

export const rendering = {
	// Return the list of CSS files to load for this module
	getStyles() {
		return ["MMM-MyTeams-LeagueTable.min.css"];
	},

	// Get translations
	getTranslations() {
		return {
			af: "translations/af.json",
			ar: "translations/ar.json",
			de: "translations/de.json",
			en: "translations/en.json",
			es: "translations/es.json",
			fa: "translations/fa.json",
			fr: "translations/fr.json",
			ga: "translations/ga.json",
			gd: "translations/gd.json",
			hr: "translations/hr.json",
			ht: "translations/ht.json",
			it: "translations/it.json",
			ja: "translations/ja.json", ko: "translations/ko.json", mi: "translations/mi.json",
			nl: "translations/nl.json", no: "translations/no.json", pt: "translations/pt.json",
			uz: "translations/uz.json", cy: "translations/cy.json", sv: "translations/sv.json",
			pl: "translations/pl.json", tr: "translations/tr.json", hu: "translations/hu.json",
			uk: "translations/uk.json", el: "translations/el.json", da: "translations/da.json",
			cs: "translations/cs.json", fi: "translations/fi.json", ro: "translations/ro.json",
			sk: "translations/sk.json", sl: "translations/sl.json", sq: "translations/sq.json",
			sr: "translations/sr.json"
		};
	},

	// Helper to translate team names
	translateTeamName(name) {
		if (!name) return "";
		const key = name.toUpperCase().replace(/\s+/g, "_");
		const translated = this.translate(key);
		return translated === key ? name : translated;
	},

	// -----------------------------
	// Theme & Layout Overrides
	// -----------------------------
	_applyThemeOverrides() {
		const styleId = "mmm-myteams-leaguetable-theme-override";
		let styleEl = document.getElementById(styleId);

		if (
			this.config.darkMode === null &&
			this.config.fontColorOverride === null &&
			this.config.opacityOverride === null &&
			this.config.firstPlaceColor === "rgba(255, 255, 255, 0.1)" &&
			this.config.highlightedColor === "rgba(255, 255, 255, 0.1)"
		) {
			if (styleEl) styleEl.remove();
			return;
		}

		if (!styleEl) {
			styleEl = document.createElement("style");
			styleEl.id = styleId;
			document.head.appendChild(styleEl);
		}

		let css = "";
		if (this.config.darkMode === true) {
			css += ".spfl-league-table { background-color: #111 !important; color: #fff !important; }\n";
		} else if (this.config.darkMode === false) {
			css += ".spfl-league-table { background-color: #f5f5f5 !important; color: #000 !important; }\n";
		}

		if (this.config.fontColorOverride && this.isValidColor(this.config.fontColorOverride)) {
			css += `.spfl-league-table * { color: ${this.config.fontColorOverride} !important; }\n`;
		}

		if (this.config.opacityOverride !== null && this.config.opacityOverride !== undefined) {
			let opacity = parseFloat(this.config.opacityOverride);
			if (!isNaN(opacity)) {
				opacity = Math.min(Math.max(opacity, 0), 1);
				css += `.spfl-league-table * { opacity: ${opacity} !important; }\n`;
				css += ".spfl-league-table .back-to-top-controls { opacity: 0 !important; }\n";
				css += ".spfl-league-table .back-to-top-controls.visible { opacity: 1 !important; }\n";
			}
		}

		if (this.config.firstPlaceColor && this.isValidColor(this.config.firstPlaceColor)) {
			css += `.spfl-league-table .team-row:first-child { background-color: ${this.config.firstPlaceColor} !important; }\n`;
			css += `.spfl-league-table .team-row:first-child .pos-cell { background: ${this.config.firstPlaceColor} !important; }\n`;
		}
		if (this.config.highlightedColor && this.isValidColor(this.config.highlightedColor)) {
			css += `.spfl-league-table .team-row.highlighted { background-color: ${this.config.highlightedColor} !important; }\n`;
		}

		if (this.config.customTeamColors && typeof this.config.customTeamColors === "object") {
			Object.entries(this.config.customTeamColors).forEach(([teamName, color]) => {
				if (this.isValidColor(color)) {
					const escapedName = teamName.replace(/"/g, '\\"');
					css += `.spfl-league-table .team-row[data-team-name="${escapedName}"] { background-color: ${color} !important; }\n`;
					css += `.spfl-league-table .team-row[data-team-name="${escapedName}"] .pos-cell { background: ${color} !important; }\n`;
				}
			});
		}
		styleEl.textContent = css;
	},

	// -----------------------------
	// Navigation & UI Elements
	// -----------------------------
	_createHeaderMetaInfo() {
		const meta = document.createElement("div");
		meta.className = "league-meta-info";

		const data = this.leagueData[this.currentLeague];
		const source = (data && (data.source || data.provider)) || "";
		const sourceText = source ? ` (${source})` : "";

		const refreshBtn = document.createElement("button");
		refreshBtn.className = "refresh-btn bright";
		refreshBtn.title = "Refresh Data";
		refreshBtn.appendChild(this.createIcon("fa fa-refresh"));
		refreshBtn.onclick = (e) => {
			e.stopPropagation();
			this.sendSocketNotification("FETCH_LEAGUE_DATA", { leagueCode: this.currentLeague, force: true });
			const icon = refreshBtn.querySelector("i");
			if (icon) {
				icon.classList.add("fa-spin");
				setTimeout(() => icon.classList.remove("fa-spin"), 2000);
			}
		};
		meta.appendChild(refreshBtn);

		const clearBtn = document.createElement("button");
		clearBtn.className = "clear-cache-btn bright";
		clearBtn.title = "Clear Cache";
		clearBtn.appendChild(this.createIcon("fa fa-eraser"));
		clearBtn.onclick = (e) => {
			e.stopPropagation();
			this.sendSocketNotification("CACHE_CLEAR_ALL", {});
			const icon = clearBtn.querySelector("i");
			if (icon) {
				icon.classList.add("fa-spin");
				setTimeout(() => icon.classList.remove("fa-spin"), 1000);
			}
		};
		meta.appendChild(clearBtn);

		const pinBtn = document.createElement("button");
		pinBtn.className = "pin-btn bright" + (this._pinned ? " active" : "");
		pinBtn.title = this._pinned ? "Unpin (Resume cycling)" : "Pin (Pause cycling)";
		pinBtn.appendChild(this.createIcon("fa fa-map-pin"));
		pinBtn.onclick = (e) => {
			e.stopPropagation();
			this._pinned = !this._pinned;
			this.scheduleCycling();
			this.updateDom();
		};
		meta.appendChild(pinBtn);

		const lastUpdate = document.createElement("div");
		lastUpdate.className = "last-updated-badge";
		const date = new Date();
		// Use 24-hour format HH:mm
		const timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
		lastUpdate.textContent = timeStr + sourceText;
		meta.appendChild(lastUpdate);
		
		// Move toggle icon here (far right of title/meta line)
		meta.appendChild(this._createToggleIcon());

		return meta;
	},

	_createToggleIcon() {
		const toggleIcon = document.createElement("button");
		toggleIcon.className = "LeagueTable-toggle-icon visible";
		toggleIcon.title = this.isContentHidden ? this.translate("SHOW_LEAGUE_TABLE") : this.translate("HIDE_LEAGUE_TABLE");
		toggleIcon.setAttribute("aria-label", toggleIcon.title);
		toggleIcon.setAttribute("aria-expanded", !this.isContentHidden);

		toggleIcon.appendChild(document.createTextNode(this.isContentHidden ? "▲" : "▼"));

		toggleIcon.onclick = (e) => {
			e.stopPropagation();
			this.isContentHidden = !this.isContentHidden;
			this.updateDom();
		};
		return toggleIcon;
	},

	_addHorizontalScrollIndicators(container, parent) {
		if (!container || !parent) return;
		const wrapper = document.createElement("div");
		wrapper.className = "league-tabs-wrapper";

		const prevBtn = document.createElement("button");
		prevBtn.className = "tab-scroll-btn prev";
		prevBtn.appendChild(this.createIcon("fa fa-chevron-left"));
		prevBtn.setAttribute("aria-label", "Scroll tabs left");

		const nextBtn = document.createElement("button");
		nextBtn.className = "tab-scroll-btn next";
		nextBtn.appendChild(this.createIcon("fa fa-chevron-right"));
		nextBtn.setAttribute("aria-label", "Scroll tabs right");

		const updateArrows = () => {
			if (!container) return;
			const { scrollLeft, scrollWidth, clientWidth } = container;
			if (scrollLeft > 5) prevBtn.classList.add("visible");
			else prevBtn.classList.remove("visible");
			if (scrollLeft < scrollWidth - clientWidth - 5 && scrollWidth > clientWidth) nextBtn.classList.add("visible");
			else nextBtn.classList.remove("visible");
		};

		prevBtn.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); container.scrollBy({ left: -120, behavior: "smooth" }); });
		nextBtn.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); container.scrollBy({ left: 120, behavior: "smooth" }); });
		container.addEventListener("scroll", updateArrows);

		if (window.ResizeObserver) {
			const resizeObserver = new ResizeObserver(() => updateArrows());
			resizeObserver.observe(container);
			this._tabResizeObserver = resizeObserver;
		} else {
			window.addEventListener("resize", updateArrows);
		}

		setTimeout(updateArrows, 300);
		wrapper.appendChild(prevBtn);
		wrapper.appendChild(container);
		wrapper.appendChild(nextBtn);
		parent.appendChild(wrapper);
	},

	createIcon(iconClass) {
		const icon = document.createElement("i");
		icon.className = iconClass;
		return icon;
	},

	createOfflineIndicator() {
		if (this.isOnline) return null;
		const offlineIndicator = document.createElement("div");
		offlineIndicator.className = "offline-indicator";
		offlineIndicator.setAttribute("role", "status");
		offlineIndicator.setAttribute("aria-live", "polite");
		offlineIndicator.appendChild(this.createIcon("fa fa-wifi"));
		offlineIndicator.appendChild(document.createTextNode(" Offline Mode - Showing Cached Data"));
		return offlineIndicator;
	},

	// -----------------------------
	// Sorting & Countdown
	// -----------------------------
	_sortTableByColumn(column, header) {
		const currentSort = header.getAttribute("aria-sort") || "none";
		const newSort = currentSort === "descending" ? "ascending" : "descending";
		
		const allHeaders = header.parentNode.querySelectorAll("th");
		allHeaders.forEach(h => { if (h !== header) h.setAttribute("aria-sort", "none"); });
		
		header.setAttribute("aria-sort", newSort);
		this._currentSortColumn = column;
		this._currentSortOrder = newSort;
		this._lastRenderedKey = null;
		this.debouncedUpdateDom();
	},

	_renderNextMatchCountdown() {
		if (!this.config.highlightTeams || this.config.highlightTeams.length === 0) return null;
		let allFixtures = [];
		Object.values(this.leagueData).forEach(data => { if (data && data.fixtures) allFixtures = allFixtures.concat(data.fixtures); });
		if (allFixtures.length === 0) return null;
		
		const now = Date.now();
		const highlightedTeams = this.config.highlightTeams;
		const upcomingMatches = allFixtures.filter(f => {
			const isHighlighted = highlightedTeams.includes(f.homeTeam) || highlightedTeams.includes(f.awayTeam);
			return isHighlighted && f.timestamp && f.timestamp > now;
		});
		
		if (upcomingMatches.length === 0) return null;
		upcomingMatches.sort((a, b) => a.timestamp - b.timestamp);
		const nextMatch = upcomingMatches[0];
		
		const widget = document.createElement("div");
		widget.className = "next-match-countdown";
		
		const header = document.createElement("div");
		header.className = "countdown-header";
		header.textContent = "Next Highlighted Match";
		widget.appendChild(header);
		
		const teams = document.createElement("div");
		teams.className = "countdown-teams";
		teams.textContent = `${nextMatch.homeTeam} vs ${nextMatch.awayTeam}`;
		widget.appendChild(teams);
		
		const timer = document.createElement("div");
		timer.className = "countdown-timer";
		
		const updateTimer = () => {
			const diff = nextMatch.timestamp - Date.now();
			if (diff <= 0) { timer.textContent = "Kicked off!"; return; }
			const days = Math.floor(diff / (1000 * 60 * 60 * 24));
			const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
			const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
			const seconds = Math.floor((diff % (1000 * 60)) / 1000);
			let timeStr = days > 0 ? `${days}d ` : "";
			timeStr += `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
			timer.textContent = timeStr;
		};
		
		updateTimer();
		const interval = setInterval(updateTimer, 1000);
		if (!this._countdownIntervals) this._countdownIntervals = [];
		this._countdownIntervals.push(interval);
		
		widget.appendChild(timer);
		if (nextMatch.venue) {
			const venue = document.createElement("div");
			venue.className = "countdown-venue";
			venue.textContent = nextMatch.venue;
			widget.appendChild(venue);
		}
		return widget;
	},

	// -----------------------------
	// Table Construction Helpers
	// -----------------------------
	createTableHeader(text, className) {
		const th = document.createElement("th");
		th.textContent = text;
		th.className = className;
		th.setAttribute("role", "columnheader");
		th.setAttribute("scope", "col");
		
		const sortKeyMap = { "#": "position", "Team": "name", "P": "played", "W": "won", "D": "drawn", "L": "lost", "F": "gf", "A": "ga", "GD": "gd", "Pts": "points" };
		const sortKey = sortKeyMap[text];
		if (sortKey) {
			th.setAttribute("aria-sort", this._currentSortColumn === sortKey ? this._currentSortOrder : "none");
			th.addEventListener("click", () => this._sortTableByColumn(sortKey, th));
		} else {
			th.setAttribute("aria-sort", "none");
		}
		return th;
	},

	createTableCell(content = "", className = "") {
		const td = document.createElement("td");
		if (content !== undefined && content !== null && content !== "") {
			td.textContent = content;
		} else if (content === 0 || content === "0") {
			td.textContent = "0";
		}
		if (className) td.className = className;
		td.setAttribute("role", "cell");
		return td;
	},

	createFormIndicator(form) {
		const container = document.createElement("div");
		container.className = "form-tokens";
		
		if (!form || !Array.isArray(form)) return container;
		
		const maxGames = this.config.formMaxGames || 5;
		const displayForm = form.slice(0, maxGames);
		
		displayForm.forEach(item => {
			const token = document.createElement("span");
			const result = (typeof item === "string") ? item : (item.result || "");
			const details = (typeof item === "object" && item.details) ? item.details : "";
			
			token.textContent = result;
			token.className = "form-token";
			
			if (result === "W") token.classList.add("form-win");
			else if (result === "D") token.classList.add("form-draw");
			else if (result === "L") token.classList.add("form-loss");
			
			if (details) {
				token.classList.add("has-tooltip");
				token.setAttribute("data-tooltip", details);
				token.setAttribute("aria-label", details);
			} else {
				const labelMap = { "W": "Win", "D": "Draw", "L": "Loss" };
				token.setAttribute("aria-label", labelMap[result] || result);
			}
			
			container.appendChild(token);
		});
		
		return container;
	},

	updateTeamNameColumnWidth() {
		const root = document.getElementById(`mtlt-${this.identifier}`);
		if (!root) return;
		const cacheKey = `${this.currentLeague}_${this.currentSubTab || "table"}`;
		if (!this._teamNameWidthCache) this._teamNameWidthCache = {};
		if (this._teamNameWidthCache[cacheKey]) {
			root.style.setProperty("--team-name-width", `${this._teamNameWidthCache[cacheKey]}px`);
			return;
		}
		const names = root.querySelectorAll(".team-cell .team-name");
		if (!names || names.length === 0) return;
		const measurer = document.createElement("span");
		const cs = window.getComputedStyle(names[0]);
		measurer.style.cssText = `position:absolute;visibility:hidden;white-space:nowrap;left:-9999px;font-family:${cs.fontFamily};font-size:${cs.fontSize};font-weight:${cs.fontWeight};font-style:${cs.fontStyle}`;
		document.body.appendChild(measurer);
		let max = 0;
		names.forEach((n) => { measurer.textContent = n.textContent || ""; max = Math.max(max, measurer.offsetWidth); });
		measurer.remove();
		const width = Math.ceil(max + 10);
		this._teamNameWidthCache[cacheKey] = width;
		root.style.setProperty("--team-name-width", `${width}px`);
	},

	handleBackToTopClick() {
		const root = document.getElementById(`mtlt-${this.identifier}`);
		const tableContainer = root ? root.querySelector(".league-body-scroll") || root.querySelector(".league-content-container") : null;
		const uefaScrollContainers = root ? root.querySelectorAll(".uefa-section-scroll") : null;

		if (tableContainer) tableContainer.scrollTo({ top: 0, behavior: "smooth" });
		else if (uefaScrollContainers) uefaScrollContainers.forEach(c => c.scrollTo({ top: 0, behavior: "smooth" }));
		setTimeout(() => this.updateScrollButtons(), 500);
	},

	updateScrollButtons() {
		const root = document.getElementById(`mtlt-${this.identifier}`);
		const tableContainer = root ? root.querySelector(".league-body-scroll") || root.querySelector(".league-content-container") || root.querySelector(".uefa-section-scroll") : null;
		const backToTopControls = root ? root.querySelector(".back-to-top-controls") : null;

		if (tableContainer && backToTopControls) {
			if (tableContainer.scrollTop > 0) {
				backToTopControls.classList.add("visible");
			} else {
				backToTopControls.classList.remove("visible");
			}
		}
	},

	// -----------------------------
	// Main Rendering Engine
	// -----------------------------
	getDom() {
		if (this._shouldSkipRender && this._shouldSkipRender()) {
			if (this.log) this.log(4, "RENDER", "Skipping getDom - Data and state unchanged");
			return this._lastDom;
		}

		this._applyThemeOverrides();
		const wrapper = document.createElement("div");
		wrapper.className = `spfl-league-table mmm-myteams-leaguetable-root density-${this.config.tableDensity || "normal"}`;
		wrapper.id = `mtlt-${this.identifier}`;

		// Add mode-specific classes for CSS refinements
		const uefaLeagues = ["UEFA_CHAMPIONS_LEAGUE", "UEFA_EUROPA_LEAGUE", "UEFA_EUROPA_CONFERENCE_LEAGUE", "UCL", "UEL", "ECL"];
		if (this.currentLeague === "WORLD_CUP_2026") {
			wrapper.classList.add("league-mode-wc");
		} else if (uefaLeagues.includes(this.currentLeague)) {
			wrapper.classList.add("league-mode-uefa");
		} else {
			wrapper.classList.add("league-mode-national");
		}

		if (this.config.maxHeight) wrapper.style.maxHeight = this.config.maxHeight;
		if (this.config.maxWidth) wrapper.style.maxWidth = this.config.maxWidth;

		const offlineIndicator = this.createOfflineIndicator();
		if (offlineIndicator) wrapper.appendChild(offlineIndicator);

		const header = document.createElement("div");
		header.className = "league-header-container";
		
		const title = document.createElement("header");
		title.className = "league-title";
		const headerText = this.config.leagueHeaders[this.currentLeague] || LEAGUE_HEADERS[this.currentLeague] || this.currentLeague;
		title.textContent = headerText;
		header.appendChild(title);

		header.appendChild(this._createHeaderMetaInfo());
		wrapper.appendChild(header);

		if (this.isContentHidden) {
			this._lastDom = wrapper;
			return wrapper;
		}

		if (this.enabledLeagueCodes.length > 1 && this.config.showLeagueButtons !== false) {
			const tabContainer = document.createElement("div");
			tabContainer.className = "league-buttons-container";
			tabContainer.setAttribute("role", "tablist");
			tabContainer.setAttribute("aria-label", "League selection");

			this.enabledLeagueCodes.forEach((leagueCode) => {
				const tab = document.createElement("button");
				tab.className = "league-tab league-btn" + (this.currentLeague === leagueCode ? " active" : "");
				tab.setAttribute("data-league", leagueCode);
				tab.setAttribute("role", "tab");
				tab.setAttribute("aria-selected", this.currentLeague === leagueCode);
				
				const flagUrl = this.getLeagueFlag(leagueCode);
				if (flagUrl) {
					const flagImg = document.createElement("img");
					flagImg.className = "flag-image";
					flagImg.src = flagUrl;
					flagImg.alt = "";
					flagImg.onerror = () => {
						flagImg.style.display = "none";
					};
					tab.appendChild(flagImg);
				}

				if (this.config.showLeagueLabel === true) {
					const span = document.createElement("span");
					span.className = "league-abbr";
					span.textContent = LEAGUE_TABS[leagueCode] || leagueCode;
					tab.appendChild(span);
				}

				tab.onclick = () => {
					this.currentLeague = leagueCode;
					this.currentSubTab = null;
					this._lastRenderedKey = null;
					this.updateDom();
				};
				tabContainer.appendChild(tab);
			});
			this._addHorizontalScrollIndicators(tabContainer, wrapper);
		}

		const contentContainer = document.createElement("div");
		contentContainer.className = "league-content-container";

		if (!this.loaded[this.currentLeague]) {
			const loading = document.createElement("div");
			loading.className = "loading-message small dimmed";
			loading.innerHTML = this.translate("LOADING") + " " + (LEAGUE_HEADERS[this.currentLeague] || this.currentLeague) + " ";
			contentContainer.appendChild(loading);
			wrapper.appendChild(contentContainer);
			this._lastDom = wrapper;
			return wrapper;
		}

		const data = this.leagueData[this.currentLeague];
		const hasStandings = data && data.standings && (Object.keys(data.standings).length > 0 || Array.isArray(data.standings));
		const hasTeams = data && data.teams && Array.isArray(data.teams) && data.teams.length > 0;
		const hasGroups = data && data.groups && Object.keys(data.groups).length > 0;
		const hasFixtures = data && data.fixtures && data.fixtures.length > 0;

		if (!data || (!hasStandings && !hasTeams && !hasGroups && !hasFixtures)) {
			const noData = document.createElement("div");
			noData.className = "no-data-message small dimmed";
			noData.textContent = this.translate("NO_DATA_AVAILABLE");
			contentContainer.appendChild(noData);
		} else {
			if (this.currentLeague === "WORLD_CUP_2026") {
				contentContainer.appendChild(this._createWC2026View(data));
			} else if (EUROPEAN_LEAGUES.includes(this.currentLeague)) {
				contentContainer.appendChild(this.createUEFAView(data));
			} else if (data.splitGroups && data.splitGroups.length > 0) {
				data.splitGroups.forEach(group => {
					if (group.teams && group.teams.length > 0) {
						const groupLabel = document.createElement("div");
						groupLabel.className = "league-split-separator";
						groupLabel.textContent = group.label;
						contentContainer.appendChild(groupLabel);
						contentContainer.appendChild(this.createTable({ teams: group.teams }));
					}
				});
			} else {
				contentContainer.appendChild(this.createTable(data));
			}
		}

		wrapper.appendChild(contentContainer);
		wrapper.appendChild(this._renderFooterControls());
		
		const countdown = this._renderNextMatchCountdown();
		if (countdown) wrapper.appendChild(countdown);

		this._lastDom = wrapper;
		setTimeout(() => {
			this.updateTeamNameColumnWidth();
			this.updateScrollButtons();
			const root = document.getElementById(`mtlt-${this.identifier}`);
			const scrollEl = root ? root.querySelector(".league-body-scroll") || root.querySelector(".league-content-container") || root.querySelector(".uefa-section-scroll") : null;
			if (scrollEl && !scrollEl._mtltScrollListenerAttached) {
				scrollEl.addEventListener("scroll", () => this.updateScrollButtons());
				scrollEl._mtltScrollListenerAttached = true;
			}
		}, 50);
		
		return wrapper;
	},

	createTable(data) {
		const table = document.createElement("table");
		table.className = "spfl-table small";
		table.setAttribute("role", "table");
		table.setAttribute("aria-label", `${this.currentLeague} standings`);

		const thead = document.createElement("thead");
		const headerRow = document.createElement("tr");
		headerRow.appendChild(this.createTableHeader("#", "pos-cell"));
		headerRow.appendChild(this.createTableHeader("Team", "team-cell"));
		headerRow.appendChild(this.createTableHeader("P", "played-cell"));
		headerRow.appendChild(this.createTableHeader("W", "won-cell"));
		headerRow.appendChild(this.createTableHeader("D", "drawn-cell"));
		headerRow.appendChild(this.createTableHeader("L", "lost-cell"));
		headerRow.appendChild(this.createTableHeader("F", "gf-cell"));
		headerRow.appendChild(this.createTableHeader("A", "ga-cell"));
		headerRow.appendChild(this.createTableHeader("GD", "gd-cell"));
		headerRow.appendChild(this.createTableHeader("Pts", "points-cell"));
		if (this.config.showForm) {
			headerRow.appendChild(this.createTableHeader("Form", "form-cell"));
		}
		thead.appendChild(headerRow);
		table.appendChild(thead);

		const tbody = document.createElement("tbody");
		const standings = data.standings && data.standings.table ? data.standings.table : (Array.isArray(data.standings) ? data.standings : (data.teams || []));
		
		standings.forEach((team, idx) => {
			const tr = document.createElement("tr");
			tr.className = "team-row";
			tr.setAttribute("role", "row");
			tr.setAttribute("aria-rowindex", idx + 1);
			tr.setAttribute("data-team-name", team.name);

			if (this.config.highlightTeams && this.config.highlightTeams.includes(team.name)) {
				tr.classList.add("highlighted");
			}

			tr.appendChild(this.createTableCell(team.position, "pos-cell"));
			
			const teamCell = this.createTableCell("", "team-cell");
			
			// Use logo from data (resolved on server) or fallback to client-side lookup
			let logoUrl = team.logo || this.getTeamLogoMapping(team.name);
			
			// Ensure path is absolute for MagicMirror
			if (logoUrl && logoUrl.indexOf("http") !== 0 && logoUrl.indexOf("/") !== 0 && !logoUrl.startsWith("modules/")) {
				logoUrl = this.file(`images/${logoUrl}`);
			}

			if (logoUrl && this.config.showTeamLogos) {
				const img = document.createElement("img");
				img.className = "team-logo";
				img.alt = "";
				this.setupImageLazyLoading(img, logoUrl);
				teamCell.appendChild(img);
			}
			const nameSpan = document.createElement("span");
			nameSpan.className = "team-name";
			nameSpan.textContent = this.translateTeamName(team.name);
			teamCell.appendChild(nameSpan);
			tr.appendChild(teamCell);

			tr.appendChild(this.createTableCell(team.played, "played-cell"));
			tr.appendChild(this.createTableCell(team.won, "won-cell"));
			tr.appendChild(this.createTableCell(team.drawn, "drawn-cell"));
			tr.appendChild(this.createTableCell(team.lost, "lost-cell"));
			tr.appendChild(this.createTableCell(team.gf || team.goalsFor, "gf-cell"));
			tr.appendChild(this.createTableCell(team.ga || team.goalsAgainst, "ga-cell"));
			tr.appendChild(this.createTableCell(team.gd || team.goalDifference, "gd-cell"));
			tr.appendChild(this.createTableCell(team.points, "points-cell highlight"));

			if (this.config.showForm) {
				const formCell = this.createTableCell("", "form-cell");
				formCell.appendChild(this.createFormIndicator(team.form));
				tr.appendChild(formCell);
			}

			tbody.appendChild(tr);
		});

		table.appendChild(tbody);
		
		const tableWrapper = document.createElement("div");
		tableWrapper.className = "league-body-scroll";
		tableWrapper.appendChild(table);
		return tableWrapper;
	},

	_renderFooterControls() {
		const footer = document.createElement("div");
		footer.className = "back-to-top-controls";
		
		const lastUpdate = document.createElement("div");
		lastUpdate.className = "last-updated xsmall dimmed";
		const date = new Date();
		const data = this.leagueData[this.currentLeague];
		const source = (data && (data.source || data.provider)) || "";
		const sourceText = source ? ` (${source})` : "";
		const timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
		lastUpdate.textContent = this.translate("LAST_UPDATED") + ": " + timeStr + sourceText;
		footer.appendChild(lastUpdate);

		const controls = document.createElement("div");
		controls.className = "footer-buttons";
		
		const btt = document.createElement("button");
		btt.className = "back-to-top-btn";
		btt.title = "Back to Top";
		btt.appendChild(this.createIcon("fa fa-arrow-up"));
		const bttLabel = document.createElement("span");
		bttLabel.textContent = "Back To Top";
		btt.appendChild(bttLabel);
		btt.onclick = () => this.handleBackToTopClick();
		controls.appendChild(btt);

		footer.appendChild(controls);
		return footer;
	},

	createUEFAView(data) {
		const wrapper = document.createElement("div");
		wrapper.className = "uefa-view";
		
		// UEFA specific subtabs (Standings, Fixtures, Results)
		const subTabNav = document.createElement("div");
		subTabNav.className = "sub-tab-navigation";
		const tabs = ["Table", "Fixtures", "Results"];
		
		tabs.forEach(tab => {
			const btn = document.createElement("button");
			btn.className = "sub-tab-btn" + (this.currentSubTab === tab || (!this.currentSubTab && tab === "Table") ? " active" : "");
			btn.textContent = this.translate(tab.toUpperCase());
			btn.onclick = () => {
				this.currentSubTab = tab;
				this._lastRenderedKey = null;
				this.updateDom();
			};
			subTabNav.appendChild(btn);
		});
		wrapper.appendChild(subTabNav);

		const currentTab = this.currentSubTab || "Table";
		if (currentTab === "Table") {
			wrapper.appendChild(this.createTable(data));
		} else {
			const fixturesWrapper = document.createElement("div");
			fixturesWrapper.className = "fixtures-scroll-container";
			const fixtures = currentTab === "Results" ? 
				data.fixtures.filter(f => ["FT", "AET", "PEN"].includes(f.status)).reverse() :
				data.fixtures.filter(f => !["FT", "AET", "PEN"].includes(f.status));
			
			if (fixtures.length === 0) {
				const empty = document.createElement("div");
				empty.className = "no-fixtures small dimmed";
				empty.textContent = this.translate("NO_FIXTURES");
				fixturesWrapper.appendChild(empty);
			} else {
				const fixturesList = document.createElement("div");
				fixturesList.className = "fixtures-list";
				
				// Group fixtures by date
				const grouped = {};
				fixtures.forEach(f => {
					if (!grouped[f.date]) grouped[f.date] = [];
					grouped[f.date].push(f);
				});

				Object.entries(grouped).forEach(([date, dayFixtures]) => {
					const dayBlock = document.createElement("div");
					dayBlock.className = "fixture-day-block";
					
					const dateHeader = document.createElement("div");
					dateHeader.className = "fixture-date-header";
					dateHeader.textContent = date;
					dayBlock.appendChild(dateHeader);

					dayFixtures.forEach(f => {
						const row = document.createElement("div");
						row.className = "fixture-row";
						
						const home = document.createElement("div");
						home.className = "home-team";
						
						const homeName = document.createElement("span");
						homeName.textContent = this.translateTeamName(f.homeTeam);
						home.appendChild(homeName);
						
						// Team logos if enabled
						if (this.config.showTeamLogos) {
							const logo = document.createElement("img");
							logo.className = "team-logo";
							logo.src = this.file("images/" + this.getTeamLogoMapping(f.homeTeam));
							home.appendChild(logo);
						}
						row.appendChild(home);

						const status = document.createElement("div");
						status.className = "fixture-status";
						
						const score = document.createElement("div");
						const isFinished = ["FT", "AET", "PEN"].includes(f.status);
						score.className = (isFinished || f.live) ? "fixture-score" : "fixture-time";
						score.textContent = (isFinished || f.live) ? `${f.homeScore} - ${f.awayScore}` : (f.time || "vs");
						status.appendChild(score);
						
						if (f.live) {
							const live = document.createElement("div");
							live.className = "live-badge";
							live.textContent = "LIVE";
							status.appendChild(live);
						}
						row.appendChild(status);

						const away = document.createElement("div");
						away.className = "away-team";
						
						if (this.config.showTeamLogos) {
							const logo = document.createElement("img");
							logo.className = "team-logo";
							logo.src = this.file("images/" + this.getTeamLogoMapping(f.awayTeam));
							away.appendChild(logo);
						}
						
						const awayName = document.createElement("span");
						awayName.textContent = this.translateTeamName(f.awayTeam);
						away.appendChild(awayName);
						row.appendChild(away);

						dayBlock.appendChild(row);
					});
					fixturesList.appendChild(dayBlock);
				});
				fixturesWrapper.appendChild(fixturesList);
			}
			wrapper.appendChild(fixturesWrapper);
		}
		
		return wrapper;
	},

	_createWC2026View(data) {
		const wrapper = document.createElement("div");
		wrapper.className = "wc2026-view";
		
		const subTabNav = document.createElement("div");
		subTabNav.className = "sub-tab-navigation wc2026-nav";
		
		const groups = this.config.showWC2026Groups || ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
		const knockoutStages = this.config.showWC2026Knockouts || ["Rd32", "Rd16", "QF", "SF", "TP", "Final"];
		
		const allTabs = [...groups, ...knockoutStages];
		if (!this.currentSubTab) this.currentSubTab = groups[0];

		allTabs.forEach(tab => {
			const btn = document.createElement("button");
			btn.className = "sub-tab-btn" + (this.currentSubTab === tab ? " active" : "");
			btn.textContent = tab;
			btn.onclick = () => {
				this.currentSubTab = tab;
				this._lastRenderedKey = null;
				this.updateDom();
			};
			subTabNav.appendChild(btn);
		});
		
		this._addHorizontalScrollIndicators(subTabNav, wrapper);

		if (groups.includes(this.currentSubTab)) {
			wrapper.appendChild(this._createWC2026GroupTable(data, this.currentSubTab));
		} else {
			wrapper.appendChild(this._createWC2026KnockoutView(data, this.currentSubTab));
		}

		return wrapper;
	},

	_createFixturesTableV2(fixtures, stage = "") {
		const fixturesWrapper = document.createElement("div");
		fixturesWrapper.className = "fixtures-wrapper-v2";

		const scrollBody = document.createElement("div");
		scrollBody.className = "fixtures-body-scroll";
		if (stage === "Rd32" || stage === "GS") {
			scrollBody.classList.add("restricted-height");
		}

		const table = document.createElement("table");
		table.className = "wc-fixtures-table-v2";

		const tbody = document.createElement("tbody");
		fixtures.forEach((f) => {
			const tr = document.createElement("tr");
			tr.className = "fixture-row-v2";
			if (f.live) tr.classList.add("live");
			if (f.status === "FT") tr.classList.add("finished");

			// 1. Date
			const dateTd = document.createElement("td");
			dateTd.className = "fixture-date-v2";
			dateTd.textContent = f.date || "";
			tr.appendChild(dateTd);

			// 2. Home Team Name
			const homeTeamTd = document.createElement("td");
			homeTeamTd.className = "fixture-home-team-v2";
			homeTeamTd.textContent = this.translateTeamName(f.homeTeam);
			tr.appendChild(homeTeamTd);

			// 3. Home Team Logo
			const homeLogoTd = document.createElement("td");
			homeLogoTd.className = "fixture-home-logo-v2";
			if (this.config.showTeamLogos) {
				const img = document.createElement("img");
				img.className = "fixture-logo-v2";
				const logoUrl = this.getTeamLogoMapping(f.homeTeam);
				if (logoUrl) img.src = logoUrl;
				homeLogoTd.appendChild(img);
			}
			tr.appendChild(homeLogoTd);

			// 4. Score / Time (vs or hh:mm)
			const scoreTd = document.createElement("td");
			scoreTd.className = "fixture-score-v2";
			const scoreWrapper = document.createElement("div");
			scoreWrapper.className = "score-wrapper-v2";
			const mainScore = document.createElement("div");
			mainScore.className = "main-score-v2";
			if (f.live || f.status === "FT" || f.status === "AET" || f.status === "PEN") {
				mainScore.textContent = `${f.homeScore}-${f.awayScore}`;
			} else {
				mainScore.textContent = f.time || "vs";
			}
			scoreWrapper.appendChild(mainScore);
			scoreTd.appendChild(scoreWrapper);
			tr.appendChild(scoreTd);

			// 5. Away Team Logo
			const awayLogoTd = document.createElement("td");
			awayLogoTd.className = "fixture-away-logo-v2";
			if (this.config.showTeamLogos) {
				const img = document.createElement("img");
				img.className = "fixture-logo-v2";
				const logoUrl = this.getTeamLogoMapping(f.awayTeam);
				if (logoUrl) img.src = logoUrl;
				awayLogoTd.appendChild(img);
			}
			tr.appendChild(awayLogoTd);

			// 6. Away Team Name
			const awayTeamTd = document.createElement("td");
			awayTeamTd.className = "fixture-away-team-v2";
			awayTeamTd.textContent = this.translateTeamName(f.awayTeam);
			tr.appendChild(awayTeamTd);

			// 7. Venue
			const venueTd = document.createElement("td");
			venueTd.className = "fixture-location-v2";
			venueTd.textContent = f.venue || "";
			tr.appendChild(venueTd);

			tbody.appendChild(tr);
		});

		table.appendChild(tbody);
		scrollBody.appendChild(table);
		fixturesWrapper.appendChild(scrollBody);
		return fixturesWrapper;
	},

	_createWC2026GroupTable(data, group) {
		const container = document.createElement("div");
		container.className = "wc-group-container";
		
		const groupData = data.groups && data.groups[group] ? data.groups[group] : (data.standings && data.standings[group] ? data.standings[group] : []);
		if (groupData.length === 0) {
			const noData = document.createElement("div");
			noData.className = "no-data small dimmed";
			noData.textContent = "Group data not available yet";
			container.appendChild(noData);
			return container;
		}

		const table = document.createElement("table");
		table.className = "spfl-table wc-table small";
		
		const thead = document.createElement("thead");
		const hr = document.createElement("tr");
		["#", "Team", "P", "W", "D", "L", "F", "A", "GD", "Pts"].forEach(h => {
			const th = document.createElement("th");
			th.textContent = h;
			if (h === "#") th.className = "pos-cell";
			if (h === "Team") th.className = "team-cell";
			if (h === "P") th.className = "played-cell";
			if (h === "W") th.className = "won-cell";
			if (h === "D") th.className = "drawn-cell";
			if (h === "L") th.className = "lost-cell";
			if (h === "F") th.className = "gf-cell";
			if (h === "A") th.className = "ga-cell";
			if (h === "GD") th.className = "gd-cell";
			if (h === "Pts") th.className = "points-cell";
			hr.appendChild(th);
		});
		if (this.config.showForm) {
			const th = document.createElement("th");
			th.textContent = "Form";
			th.className = "form-cell";
			hr.appendChild(th);
		}
		thead.appendChild(hr);
		table.appendChild(thead);

		const tbody = document.createElement("tbody");
		groupData.forEach(team => {
			const tr = document.createElement("tr");
			tr.appendChild(this.createTableCell(team.position, "pos-cell"));
			
			const teamCell = this.createTableCell("", "team-cell");
			
			// Use logo from data (resolved on server) or fallback to client-side lookup
			let logoUrl = team.logo || this.getTeamLogoMapping(team.name);
			
			// Ensure path is absolute for MagicMirror
			if (logoUrl && logoUrl.indexOf("http") !== 0 && logoUrl.indexOf("/") !== 0 && !logoUrl.startsWith("modules/")) {
				logoUrl = this.file(`images/${logoUrl}`);
			}

			if (logoUrl && this.config.showTeamLogos) {
				const img = document.createElement("img");
				img.className = "team-logo";
				img.alt = "";
				this.setupImageLazyLoading(img, logoUrl);
				teamCell.appendChild(img);
			}
			const span = document.createElement("span");
			span.textContent = this.translateTeamName(team.name);
			teamCell.appendChild(span);
			tr.appendChild(teamCell);

			tr.appendChild(this.createTableCell(team.played, "played-cell"));
			tr.appendChild(this.createTableCell(team.won, "won-cell"));
			tr.appendChild(this.createTableCell(team.drawn, "drawn-cell"));
			tr.appendChild(this.createTableCell(team.lost, "lost-cell"));
			tr.appendChild(this.createTableCell(team.goalsFor !== undefined ? team.goalsFor : team.gf, "gf-cell"));
			tr.appendChild(this.createTableCell(team.goalsAgainst !== undefined ? team.goalsAgainst : team.ga, "ga-cell"));
			tr.appendChild(this.createTableCell(team.goalDifference !== undefined ? team.goalDifference : team.gd, "gd-cell"));
			tr.appendChild(this.createTableCell(team.points, "points-cell highlight"));

			if (this.config.showForm) {
				const formCell = this.createTableCell("", "form-cell");
				formCell.appendChild(this.createFormIndicator(team.form));
				tr.appendChild(formCell);
			}
			tbody.appendChild(tr);
		});
		table.appendChild(tbody);
		container.appendChild(table);

		// Group Fixtures
		const fixtures = data.fixtures ? data.fixtures.filter(f => (f.stage === "GS" || f.stage === group) && f.group === group) : [];
		if (fixtures.length > 0) {
			const fixHeader = document.createElement("div");
			fixHeader.className = "wc-fix-header xsmall dimmed";
			fixHeader.textContent = "Group Fixtures";
			container.appendChild(fixHeader);
			container.appendChild(this._createFixturesTableV2(fixtures, "GS"));
		}

		return container;
	},

	_createWC2026KnockoutView(data, stage) {
		const container = document.createElement("div");
		container.className = "wc-knockout-container";
		
		// Map display stage names to internal parser stage names if needed
		const stageMap = {
			"Rd32": ["Rd32", "RD32", "Round of 32"],
			"Rd16": ["Rd16", "RD16", "Round of 16"],
			"QF": ["QF", "Quarter-final", "Quarter"],
			"SF": ["SF", "Semi-final", "Semi"],
			"TP": ["TP", "Third Place", "3rd Place"],
			"Final": ["Final", "The Final"]
		};

		const allowedStages = stageMap[stage] || [stage];
		const fixtures = data.fixtures ? data.fixtures.filter(f => 
			allowedStages.some(s => f.stage === s || f.stage?.toUpperCase() === s.toUpperCase())
		) : [];
		
		if (fixtures.length === 0) {
			const noData = document.createElement("div");
			noData.className = "no-data small dimmed";
			noData.textContent = "Fixtures not yet determined";
			container.appendChild(noData);
			return container;
		}

		container.appendChild(this._createFixturesTableV2(fixtures, stage));
		return container;
	},
};
