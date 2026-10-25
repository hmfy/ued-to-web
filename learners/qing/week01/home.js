/**
 * ChargeWipe home page — FAQ accordion.
 *
 * Behaviour:
 *   - clicking a question toggles that answer
 *   - opening one item closes the others (single-open, like the reference)
 *   - the button's `aria-expanded` drives the open state in CSS, so there is
 *     only one source of truth and no duplicate `.is-open` class to keep in
 *     sync
 *
 * The answers are present in the HTML already, so the page is still readable
 * with JavaScript disabled — it simply shows every question collapsed.
 */
(function () {
  "use strict";

  var buttons = Array.prototype.slice.call(
    document.querySelectorAll(".hp-faq-btn")
  );

  if (buttons.length === 0) return;

  function setOpen(button, open) {
    button.setAttribute("aria-expanded", open ? "true" : "false");
  }

  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      var isOpen = button.getAttribute("aria-expanded") === "true";

      // Closing the open item should always work; opening one closes the rest.
      buttons.forEach(function (other) {
        setOpen(other, other === button && !isOpen);
      });
    });
  });
})();
