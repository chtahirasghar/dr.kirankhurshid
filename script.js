var footerYear = document.getElementById("year");

if (footerYear) {
  footerYear.textContent = new Date().getFullYear();
}

var printProfileButton = document.getElementById("printProfile");

if (printProfileButton) {
  printProfileButton.addEventListener("click", function () {
    window.print();
  });
}

function animateCounters() {
  document.querySelectorAll("[data-count]").forEach(function (counter) {
    var target = Number(counter.getAttribute("data-count"));
    var current = 0;
    var step = Math.max(1, Math.ceil(target / 40));

    var timer = window.setInterval(function () {
      current += step;

      if (current >= target) {
        current = target;
        window.clearInterval(timer);
      }

      counter.textContent = target >= 10 ? current + "+" : String(current).padStart(2, "0");
    }, 28);
  });
}

function updateNavbar() {
  document.getElementById("mainNav").classList.toggle("is-scrolled", window.scrollY > 12);
}

function setupBackToTop() {
  var button = document.getElementById("backToTop");

  if (!button) {
    return;
  }

  function updateButton() {
    button.classList.toggle("is-visible", window.scrollY > 460);
  }

  button.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("scroll", updateButton, { passive: true });
  updateButton();
}

function setupRevealAnimations() {
  var items = document.querySelectorAll(".reveal-up, .reveal-slide");

  if (!items.length) {
    return;
  }

  if (!("IntersectionObserver" in window)) {
    items.forEach(function (item) {
      item.classList.add("is-visible");
    });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries, revealObserver) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.2,
      rootMargin: "0px 0px -40px 0px",
    }
  );

  items.forEach(function (item) {
    observer.observe(item);
  });
}

function setupPublicationFilters() {
  var filterButtons = document.querySelectorAll("[data-publication-filter]");
  var volumes = document.querySelectorAll("[data-publication-category]");
  var gallery = document.querySelector(".library-gallery");

  if (!filterButtons.length || !volumes.length || !gallery) {
    return;
  }

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var category = button.getAttribute("data-publication-filter");

      filterButtons.forEach(function (filterButton) {
        var isSelected = filterButton === button;
        filterButton.classList.toggle("is-active", isSelected);
        filterButton.setAttribute("aria-selected", String(isSelected));
      });

      volumes.forEach(function (volume) {
        volume.hidden = volume.getAttribute("data-publication-category") !== category;
      });

      gallery.setAttribute("aria-label", button.textContent.trim() + " publication collection");
      gallery.classList.remove("is-filtering");
      void gallery.offsetWidth;
      gallery.classList.add("is-filtering");

      window.setTimeout(function () {
        gallery.classList.remove("is-filtering");
      }, 760);
    });
  });
}

function setupImageModal() {
  var collections = [
    {
      images: Array.from(document.querySelectorAll(".launch-series-expanded img")),
      label: "Book launch photograph"
    },
    {
      images: Array.from(document.querySelectorAll(".event-atlas-section img")),
      label: "Gallery & Events"
    }
  ].filter(function (collection) { return collection.images.length; });
  var modalElement = document.getElementById("launchImageModal");
  var modalImage = document.getElementById("launchImageModalImage");
  var modalCaption = document.getElementById("launchImageModalCaption");
  var modalTitle = document.getElementById("launchImageModalLabel");
  var previousButton = document.querySelector(".launch-modal-prev");
  var nextButton = document.querySelector(".launch-modal-next");
  var currentIndex = 0;
  var activeCollection = collections[0];
  var modal;

  if (!collections.length || !modalElement || !modalImage || !modalCaption || !modalTitle || !previousButton || !nextButton) {
    return;
  }

  modal = new bootstrap.Modal(modalElement);

  function showImage(index) {
    var images = activeCollection.images;
    currentIndex = (index + images.length) % images.length;
    var image = images[currentIndex];

    modalImage.src = image.currentSrc || image.src;
    modalImage.alt = image.alt;
    modalCaption.textContent = image.alt;
    modalTitle.textContent = activeCollection.label;
  }

  collections.forEach(function (collection) {
    collection.images.forEach(function (image, index) {
      var trigger = image.closest(".event-atlas-hero") || image;
      trigger.classList.add("launch-image-trigger");
      trigger.setAttribute("tabindex", "0");
      trigger.setAttribute("role", "button");
      trigger.setAttribute("aria-label", "Open image: " + image.alt);

      function openImage() {
        activeCollection = collection;
        showImage(index);
        modal.show();
      }

      trigger.addEventListener("click", openImage);
      trigger.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openImage();
        }
      });
    });
  });

  previousButton.addEventListener("click", function () {
    showImage(currentIndex - 1);
  });

  nextButton.addEventListener("click", function () {
    showImage(currentIndex + 1);
  });

  modalElement.addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft") {
      showImage(currentIndex - 1);
    }
    if (event.key === "ArrowRight") {
      showImage(currentIndex + 1);
    }
  });
}

function setupAtlasDecks() {
  document.querySelectorAll(".event-atlas-rail").forEach(function (rail) {
    var tiles = Array.from(rail.querySelectorAll(".event-atlas-tile"));

    if (!tiles.length) {
      return;
    }

    function setActiveTile() {
      var railCenter = rail.scrollLeft + rail.clientWidth / 2;
      var activeTile = tiles.reduce(function (closest, tile) {
        var tileCenter = tile.offsetLeft + tile.offsetWidth / 2;
        var closestCenter = closest.offsetLeft + closest.offsetWidth / 2;
        return Math.abs(tileCenter - railCenter) < Math.abs(closestCenter - railCenter) ? tile : closest;
      }, tiles[0]);

      tiles.forEach(function (tile) { tile.classList.toggle("atlas-active", tile === activeTile); });
    }

    rail.addEventListener("scroll", setActiveTile, { passive: true });
    window.setTimeout(setActiveTile, 80);
  });

  document.querySelectorAll(".event-atlas-arrow").forEach(function (button) {
    button.addEventListener("click", function () {
      var chapter = button.closest(".rtmes-gallery-chapter");
      var section = button.closest(".event-atlas-section");
      var rail = chapter
        ? chapter.querySelector('[data-atlas-rail="rtmes"]')
        : section.querySelector('[data-atlas-rail="events"]');
      var direction = button.dataset.atlasDirection === "previous" ? -1 : 1;

      rail.scrollBy({ left: direction * Math.max(rail.clientWidth * 0.62, 260), behavior: "smooth" });
    });
  });
}

document.querySelectorAll(".navbar .nav-link").forEach(function (link) {
  link.addEventListener("click", function () {
    var navbar = document.getElementById("navbarContent");
    var collapse = bootstrap.Collapse.getInstance(navbar);

    if (collapse) {
      collapse.hide();
    }
  });
});

var pageInitialized = false;

function initializePage() {
  if (pageInitialized) {
    return;
  }

  pageInitialized = true;
  animateCounters();
  updateNavbar();
  setupRevealAnimations();
  setupPublicationFilters();
  setupImageModal();
  setupAtlasDecks();
  setupBackToTop();
}

window.addEventListener("scroll", updateNavbar);

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializePage, { once: true });
} else {
  initializePage();
}

window.addEventListener("load", initializePage, { once: true });
