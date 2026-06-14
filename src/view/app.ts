import Fuse from "fuse.js";
import data from "../../data.json" assert { type: "json" };

const SEARCH_TYPES = {
  NAIM: "naim",
  INVERTED: "inverted_naim",
  VOENKOMATS: "voenkomats",
  ADDRESSES: "adresses",
};

const SEARCH_TYPE_KEYS = [
  SEARCH_TYPES.NAIM,
  SEARCH_TYPES.INVERTED,
  SEARCH_TYPES.VOENKOMATS,
  SEARCH_TYPES.ADDRESSES,
];

class SearchApp {
  currentType: number = 0;
  selectedIndex: number = -1;
  searchQuery: string = "";
  results: any[] = [];
  fuseInstances: { [key: string]: Fuse<any> } = {};
  searchInput: HTMLInputElement;
  resultsContainer: HTMLElement;
  tabs: NodeListOf<Element>;

  constructor() {
    this.searchInput = document.getElementById("searchInput") as HTMLInputElement;
    this.resultsContainer = document.getElementById("results") as HTMLElement;
    this.tabs = document.querySelectorAll(".tab");

    this.initFuseInstances();
    this.attachEventListeners();
    this.registerGlobalShortcut();

    this.searchInput.focus();
  }

  initFuseInstances() {
    const fuseOptions = {
      keys: ["name"],
      threshold: 0.3,
      minMatchCharLength: 3,
      includeScore: true,
      ignoreLocation: true,
    };

    SEARCH_TYPE_KEYS.forEach((type) => {
      this.fuseInstances[type] = new Fuse(data[type as keyof typeof data], fuseOptions);
    });
  }

  attachEventListeners() {
    this.searchInput.addEventListener("input", (e) => {
      this.searchQuery = (e.target as HTMLInputElement).value;
      this.selectedIndex = -1;
      this.performSearch();
    });

    this.searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        e.preventDefault();
        this.switchTab();
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        this.selectNext();
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        this.selectPrev();
      }

      if (e.key === "Enter" && this.selectedIndex >= 0) {
        e.preventDefault();
        this.copySelectedResult();
      }
    });

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
        resultDiv.innerHTML = `
          <div class="result-item-name">${this.escapeHtml(item.name)}</div>
          <div class="result-item-address">${this.escapeHtml(item.address)}</div>
          <div class="result-item-postal">Код: ${this.escapeHtml(item.postal_code)}</div>
        `;
      } else {
        resultDiv.innerHTML = `<div class="result-item-name">${this.escapeHtml(item.name)}</div>`;
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
      textToCopy = item.name + "\n" + item.address + "\n" + "Код: " + item.postal_code;
    } else {
      textToCopy = item.name;
    }

    navigator.clipboard.writeText(textToCopy).then(() => {
      console.log("Copied:", textToCopy);
    });
  }

  escapeHtml(text: string) {
    const map: { [key: string]: string } = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new SearchApp();
});
