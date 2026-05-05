if (typeof window !== "undefined") {
  const devtools = /./ as RegExp & { opened?: boolean };
  devtools.toString = function () {
    devtools.opened = true;
    return "";
  };

  const checkDevTools = () => {
    if (devtools.opened) {
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
