import Fuse from "fuse.js";

// Import your data (adjust path as needed)
import data from "../../data.json" assert { type: "json" };

const SEARCH_TYPES = {
  NAIM: "naim",
  INVERTED: "inverted_naim",
  VOENKOMATS: "voenkomats",
  ADDRESSES: "adresses", // Note: typo in original JSON
};

const SEARCH_TYPE_KEYS = [
  SEARCH_TYPES.NAIM,
  SEARCH_TYPES.INVERTED,
  SEARCH_TYPES.VOENKOMATS,
  SEARCH_TYPES.ADDRESSES,
];

class SearchApp {
  constructor() {
    this.currentType = 0;
    this.selectedIndex = -1;
    this.searchQuery = "";
    this.results = [];
    this.fuseInstances = {};

    this.searchInput = document.getElementById("searchInput");
    this.resultsContainer = document.getElementById("results");
    this.tabs = document.querySelectorAll(".tab");

    this.initFuseInstances();
    this.attachEventListeners();
    this.registerGlobalShortcut();
    
    // Auto-focus search input
    this.searchInput.focus();
  }

  initFuseInstances() {
    // Initialize Fuse for each search type
    const fuseOptions = {
      keys: ["name"],
      threshold: 0.3,
      minMatchCharLength: 3,
      includeScore: true,
      useExtendedSearch: false,
      ignoreLocation: true,
    };

    SEARCH_TYPE_KEYS.forEach((type) => {
      this.fuseInstances[type] = new Fuse(data[type], fuseOptions);
    });
  }

  attachEventListeners() {
    // Search input
    this.searchInput.addEventListener("input", (e) => {
      this.searchQuery = e.target.value;
      this.selectedIndex = -1;
      this.performSearch();
    });

    // Tab switching with Tab key
    this.searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        e.preventDefault();
        this.switchTab();
      }

      // Arrow keys for result navigation
      if (e.key === "ArrowDown") {
        e.preventDefault();
        this.selectNext();
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        this.selectPrev();
      }

      // Enter to copy selected result
      if (e.key === "Enter" && this.selectedIndex >= 0) {
        e.preventDefault();
        this.copySelectedResult();
      }
    });

    // Tab buttons
    this.tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => {
        this.currentType = index;
        this.updateTabUI();
        this.selectedIndex = -1;
        this.performSearch();
        this.searchInput.focus();
      });
    });
  }

  registerGlobalShortcut() {
    // Listen for Ctrl+Q to toggle window visibility
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key === "q") {
        e.preventDefault();
        if (window.api) {
          window.api.toggleWindow();
        }
      }
    });
  }

  switchTab() {
    this.currentType = (this.currentType + 1) % SEARCH_TYPE_KEYS.length;
    this.updateTabUI();
    this.selectedIndex = -1;
    this.performSearch();
  }

  updateTabUI() {
    this.tabs.forEach((tab, index) => {
      tab.classList.toggle("active", index === this.currentType);
    });
  }

  performSearch() {
    if (this.searchQuery.length < 3) {
      this.results = [];
      this.renderResults();
      return;
    }

    const typeKey = SEARCH_TYPE_KEYS[this.currentType];
    const fuse = this.fuseInstances[typeKey];
    const searchResults = fuse.search(this.searchQuery);

    // Take top 5 results
    this.results = searchResults.slice(0, 5).map((r) => r.item);
    this.renderResults();
  }

  renderResults() {
    this.resultsContainer.innerHTML = "";

    this.results.forEach((item, index) => {
      const resultDiv = document.createElement("div");
      resultDiv.className = "result-item";
      if (index === this.selectedIndex) {
        resultDiv.classList.add("selected");
      }

      const typeKey = SEARCH_TYPE_KEYS[this.currentType];

      if (typeKey === SEARCH_TYPES.ADDRESSES) {
        // For addresses, show name, address, and postal code
        resultDiv.innerHTML = `
          <div class="result-item-name">${this.escapeHtml(item.name)}</div>
          <div class="result-item-address">${this.escapeHtml(
            item.address
          )}</div>
          <div class="result-item-postal">Код: ${this.escapeHtml(
            item.postal_code
          )}</div>
        `;
      } else {
        // For other types, just show name
        resultDiv.innerHTML = `<div class="result-item-name">${this.escapeHtml(
          item.name
        )}</div>`;
      }

      resultDiv.addEventListener("click", () => {
        this.selectedIndex = index;
        this.copySelectedResult();
      });

      this.resultsContainer.appendChild(resultDiv);
    });
  }

  selectNext() {
    if (this.results.length === 0) return;
    this.selectedIndex = (this.selectedIndex + 1) % this.results.length;
    this.renderResults();
    this.scrollToSelected();
  }

  selectPrev() {
    if (this.results.length === 0) return;
    this.selectedIndex =
      this.selectedIndex <= 0 ? this.results.length - 1 : this.selectedIndex - 1;
    this.renderResults();
    this.scrollToSelected();
  }

  scrollToSelected() {
    const items = this.resultsContainer.querySelectorAll(".result-item");
    if (items[this.selectedIndex]) {
      items[this.selectedIndex].scrollIntoView({
        block: "nearest",
      });
    }
  }

  copySelectedResult() {
    if (this.selectedIndex < 0 || this.selectedIndex >= this.results.length) {
      return;
    }

    const item = this.results[this.selectedIndex];
    const typeKey = SEARCH_TYPE_KEYS[this.currentType];
    let textToCopy = "";

    if (typeKey === SEARCH_TYPES.ADDRESSES) {
      // For addresses, copy name, address, and postal code with line breaks
      textToCopy =
        item.name + "\n" + item.address + "\n" + "Код: " + item.postal_code;
    } else {
      textToCopy = item.name;
    }

    navigator.clipboard.writeText(textToCopy).then(() => {
      // Optional: Visual feedback
      console.log("Copied:", textToCopy);
    });
  }

  escapeHtml(text) {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }
}

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new SearchApp();
});