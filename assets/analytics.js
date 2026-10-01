(function () {
  "use strict";

  var GA_MEASUREMENT_ID = "G-XXXXXXXXXX";
  if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === "G-XXXXXXXXXX") {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }

  window.gtag = window.gtag || gtag;

  var script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_MEASUREMENT_ID);
  document.head.appendChild(script);

  gtag("js", new Date());
  gtag("config", GA_MEASUREMENT_ID, {
    anonymize_ip: true,
    transport_type: "beacon"
  });

  function ctaLocation(el) {
    if (el.dataset.ctaLocation) return el.dataset.ctaLocation;
    var section = el.closest("section, header, footer, nav, main");
    if (!section) return "page";
    if (section.id) return section.id;
    if (section.className && typeof section.className === "string") {
      return section.className.trim().split(/\s+/)[0] || section.tagName.toLowerCase();
    }
    return section.tagName.toLowerCase();
  }

  document.addEventListener("click", function (event) {
    var cta = event.target.closest("[data-cta='true']");
    if (!cta) return;

    var label = (cta.dataset.ctaLabel || cta.textContent || "cta").trim().replace(/\s+/g, " ");
    var destination = "";
    if (cta.tagName === "A") {
      destination = cta.href || cta.getAttribute("href") || "";
    } else {
      destination = cta.dataset.ctaDestination || "";
    }

    gtag("event", "cta_click", {
      cta_label: label,
      cta_location: ctaLocation(cta),
      cta_destination: destination,
      page_url: window.location.href,
      page_path: window.location.pathname,
      page_title: document.title
    });
  }, true);
})();
