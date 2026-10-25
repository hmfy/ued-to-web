/**
 * Nav dropdown keyboard access.
 *
 * The menus open on hover via CSS. For keyboard users the parent link opens the
 * panel through :focus-within, but a closed panel's links would still be
 * tabbable — invisible focus stops. This script keeps `tabindex="-1"` on the
 * links while the panel is closed and removes it when open, so tabbing only
 * ever reaches visible links.
 */
(function () {
  "use strict";

  var menus = Array.prototype.slice.call(document.querySelectorAll(".has-menu"));
  if (menus.length === 0) return;

  menus.forEach(function (li) {
    var trigger = li.querySelector(":scope > a");
    var panel = li.querySelector(".nav-menu");
    if (!trigger || !panel) return;

    var links = Array.prototype.slice.call(panel.querySelectorAll("a"));

    function setEnabled(enabled) {
      links.forEach(function (a) {
        if (enabled) a.removeAttribute("tabindex");
        else a.setAttribute("tabindex", "-1");
      });
    }

    // Start closed.
    setEnabled(false);

    // Mouse hover.
    li.addEventListener("mouseenter", function () {
      setEnabled(true);
    });
    li.addEventListener("mouseleave", function () {
      setEnabled(false);
    });

    // Keyboard: focus on the trigger opens it; leaving the block closes it.
    trigger.addEventListener("focus", function () {
      setEnabled(true);
    });
    li.addEventListener("focusout", function (e) {
      if (!li.contains(e.relatedTarget)) setEnabled(false);
    });

    // Escape closes and returns focus to the trigger.
    li.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        setEnabled(false);
        trigger.focus();
      }
    });
  });
})();
