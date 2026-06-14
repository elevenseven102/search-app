// Window API for Electrobun
declare global {
  interface Window {
    api: {
      toggleWindow: () => void;
    };
  }
}

window.api = {
  toggleWindow: () => {
    console.log("Toggle window");
  },
};
