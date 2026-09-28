(() => {
  "use strict";

  const views = [...document.querySelectorAll(".app-shell > section")];

  // Features supply their own cleanup/focus hooks; navigation owns only visibility.
  window.appViews = {
    show(view, { leave, enter } = {}) {
      leave?.();
      views.forEach(section => { section.hidden = section !== view; });
      enter?.();
    },
  };
})();
