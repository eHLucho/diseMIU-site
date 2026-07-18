document.addEventListener("DOMContentLoaded", function () {
  const trigger = document.querySelector("#wp-admin-bar-rtmkit_whats_new_bar");
  const drawer = document.getElementById("custom-admin-drawer");
  const overlay = document.getElementById("custom-drawer-overlay");
  const drawerContent = document.querySelector("#custom-admin-drawer .drawer-content");

  let drawerLoaded = false;
  let isLoading = false;

  const loadingHtml = `
    <div class="rtmkit-drawer-loading">
      <div class="rtmkit-skeleton-item">
        <div class="rtmkit-skeleton-title"></div>
        <div class="rtmkit-skeleton-image"></div>
        <div class="rtmkit-skeleton-text"></div>
        <div class="rtmkit-skeleton-text short"></div>
      </div>
      <div class="rtmkit-skeleton-item">
        <div class="rtmkit-skeleton-title"></div>
        <div class="rtmkit-skeleton-image"></div>
        <div class="rtmkit-skeleton-text"></div>
        <div class="rtmkit-skeleton-text short"></div>
      </div>
    </div>
  `;

  const errorHtml = `
    <div class="rtmkit-drawer-error">
      <p>Unable to load content. Please try again.</p>
      <button type="button" class="rtmkit-drawer-retry">Retry</button>
    </div>
  `;

  function showLoading() {
    if (!drawerContent) return;
    isLoading = true;
    drawerContent.innerHTML = loadingHtml;
  }

  function showError() {
    if (!drawerContent) return;
    drawerContent.innerHTML = errorHtml;

    const retryBtn = drawerContent.querySelector(".rtmkit-drawer-retry");
    if (retryBtn) {
      retryBtn.addEventListener("click", function () {
        drawerLoaded = false;
        loadDrawerContent();
      });
    }
  }

  function loadDrawerContent() {
    if (drawerLoaded || isLoading || !drawerContent) return;

    if (typeof rtmkit_ajax === "undefined") {
      console.error("rtmkit_ajax is not available");
      showError();
      return;
    }

    showLoading();

    const params = new URLSearchParams();
    params.append("action", "rtmkit_load_drawer");
    params.append("nonce", rtmkit_ajax.nonce);

    fetch(rtmkit_ajax.ajax_url, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    })
      .then(function (res) {
        return res.json();
      })
      .then(function (res) {
        isLoading = false;

        if (res && res.success && res.data && res.data.html) {
          drawerContent.innerHTML = res.data.html;
          drawerLoaded = true;
        } else {
          throw new Error("ajax response invalid");
        }
      })
      .catch(function (err) {
        console.error("Failed to load drawer content:", err);
        isLoading = false;
        drawerLoaded = false;
        showError();
      });
  }

  if (trigger) {
    trigger.addEventListener("click", function (e) {
      e.preventDefault();
      drawer.classList.toggle("open");
      overlay.classList.toggle("active");
      loadDrawerContent();
    });
  }

  overlay.addEventListener("click", function () {
    drawer.classList.remove("open");
    overlay.classList.remove("active");
  });
});