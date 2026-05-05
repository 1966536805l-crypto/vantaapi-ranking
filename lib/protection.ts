if (typeof window !== "undefined") {
  const devtools = /./;
  (devtools as any).toString = function () {
    (this as any).opened = true;
    return "";
  };

  const checkDevTools = () => {
    if ((devtools as any).opened) {
      window.location.href = "about:blank";
    }
  };

  setInterval(checkDevTools, 1000);

  Object.defineProperty(window, "console", {
    get: function () {
      return {
        log: () => {},
        warn: () => {},
        error: () => {},
        info: () => {},
        debug: () => {},
      };
    },
  });

  document.addEventListener("contextmenu", (e) => {
    if (process.env.NODE_ENV === "production") {
      e.preventDefault();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (
      process.env.NODE_ENV === "production" &&
      (e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && e.key === "I") ||
        (e.ctrlKey && e.shiftKey && e.key === "J") ||
        (e.ctrlKey && e.key === "U"))
    ) {
      e.preventDefault();
    }
  });
}

export {};
