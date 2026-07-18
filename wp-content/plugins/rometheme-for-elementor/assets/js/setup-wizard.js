jQuery(document).ready(function ($) {
  $("[data-next]").on("click", function () {
    var nextStep = parseInt($(this).data("next"));
    var maxStep = 5;

    // Reset semua content
    $(".wizard-step-content").removeClass("active");

    // Aktifkan content sesuai step
    $('[data-step-content="' + nextStep + '"]').addClass("active");

    // Aktifkan step saat ini
    $('.wizard-step[data-step="' + nextStep + '"]').addClass("active");

    // 🔥 Remove active untuk step di atas nextStep
    $(".wizard-step").each(function () {
      var step = parseInt($(this).data("step"));

      if (step > nextStep && step <= maxStep) {
        $(this).removeClass("active");
      }
    });

    // Update URL
    var url = new URL(window.location);
    url.searchParams.set("step", nextStep);
    window.history.pushState({}, "", url);

    functionRunner(nextStep);
  });

  function functionRunner(step) {
    switch (step) {
      case 2:
        modules();
        break;
      case 4:
        subscribe();
        break;
      case 5:
        finish();
        break;
    }
  }

  function pluginCheck() {
    let updateNeeded = [];
    console.log("plugins checking...");
    $("#plugin-check button[data-next]").off("click").prop("disabled", true)
      .html(`<div class="spinner-border spinner-border-sm" role="status"
                                style="--bs-spinner-border-width:0.1em"></div>
                            <span>Checking...</span>`);
    $("#rtmkit-pro-button").html(
      `<div class="d-flex align-items-center gap-2 text-muted">
                                                <div class="spinner-border spinner-border-sm" role="status" style="--bs-spinner-border-width:0.1em">
                                                    <span class="visually-hidden">Loading...</span>
                                                </div>
                                                <span id="rtmkitpro-status" class="">Version Checking...</span>
                                            </div>`,
    );
    $("#rtmform-button").html(
      `<div class="d-flex align-items-center gap-2 text-muted">
                                                <div class="spinner-border spinner-border-sm" role="status" style="--bs-spinner-border-width:0.1em">
                                                    <span class="visually-hidden">Loading...</span>
                                                </div>
                                                <span id="rtmkitpro-status" class="">Version Checking...</span>
                                            </div>`,
    );
    const checkRtmkitPro = $.ajax({
      url: ajaxurl,
      method: "POST",
      data: {
        action: "plugin_status_check",
        plugin_slug: "rtmkitpro",
        nonce: rtmkitWizard.nonce,
      },
    }).done(function (response) {
      if (!response.success) return;

      const data = response.data;

      if (data.is_installed == true && data.is_active == true) {
        updateNeeded.push(data.update_required);
        $(".rtmkitpro-version").text(`v.${data.pro_current_version}`);

        if (!data.update_required) {
          $("#rtmkit-pro-button").html(
            '<span class="d-flex gap-2 align-items-center"><i class="fa-regular fa-circle-check accent-color"></i>Version Compatible</span>',
          );
        } else {
          $("#rtmkit-pro-button").html(`
         <span class="d-flex gap-2 align-items-center" data-action="update" data-plugin="rtmkitpro"><i class="fa-solid fa-circle-exclamation text-danger"></i>Update Required</span>
        `);
        }
      } else if (data.is_installed == true && data.is_active == false) {
        $("#rtmkit-pro-button").html(
          '<span class="d-flex gap-2 align-items-center"><i class="fa-regular fa-circle-xmark text-danger"></i>License Not Active</span>',
        );
      } else {
        $("#rtmkit-pro-button").html(
          '<span class="d-flex gap-2 align-items-center"><i class="fa-regular fa-circle-xmark text-danger"></i>Plugin Not Installed</span>',
        );
      }
    });

    const checkRtmForm = $.ajax({
      url: ajaxurl,
      method: "POST",
      data: {
        action: "plugin_status_check",
        plugin_slug: "rtmform",
        nonce: rtmkitWizard.nonce,
      },
    }).done(function (response) {
      if (!response.success) return;

      const data = response.data;

      if (data.is_installed) {
        updateNeeded.push(data.update_required);

        $(".rtmform-version").text(`v.${data.form_current_version}`);

        if (!data.update_required) {
          $("#rtmform-button").html(
            '<span class="d-flex gap-2 align-items-center"><i class="fa-regular fa-circle-check accent-color"></i>Version Compatible</span>',
          );
        } else {
          $("#rtmform-button").html(`
                   <span class="d-flex gap-2 align-items-center" data-action="update" data-plugin="rtmform"><i class="fa-solid fa-circle-exclamation text-danger"></i>Update Required</span>
        `);
        }
      } else {
        updateNeeded.push(true);
        $("#rtmform-button").html(`
                 <span class="d-flex gap-2 align-items-center" data-action="update" data-plugin="rtmform"><i class="fa-solid fa-circle-exclamation text-danger"></i>Install Required</span>
      `);
      }
    });

    // ⏳ TUNGGU SEMUA AJAX SELESAI
    $.when(checkRtmkitPro, checkRtmForm).done(function () {
      // Kalau TIDAK ADA update_required === true
      if (!updateNeeded.includes(true)) {
        $("#plugin-check #next-button")
          .removeAttr("disabled")
          .attr("data-next", 3)
          .text("Next")
          .on("click", function () {
            var nextStep = $(this).data("next");
            $(".wizard-step-content").removeClass("active");
            $('[data-step-content="' + nextStep + '"]').addClass("active");
            $('.wizard-step[data-step="' + nextStep + '"]').addClass("active");
            url = new URL(window.location);
            url.searchParams.set("step", nextStep);
            window.history.pushState({}, "", url);
            functionRunner(nextStep);
          });
      } else {
        installRequirement();
        $("#plugin-check #next-button")
          .removeAttr("disabled")
          .html(
            '<i class="fa-solid fa-arrow-down"></i> Install Required Plugins',
          );
      }
    });
  }

  function installRequirement() {
    const installBtn = $("#plugin-check #next-button");

    installBtn.prop("disabled", false);

    installBtn.off("click").on("click", async function (e) {
      e.preventDefault();

      const requireBtns = $("[data-action=update]");
      const tasks = [];
      requireBtns.each(function () {
        const $btn = $(this);
        const plugin = $btn.data("plugin");

        $btn.html(`
        <div class="spinner-border spinner-border-sm" role="status"
          style="--bs-spinner-border-width:0.1em"></div>
        <span>Installing...</span>
      `);

        installBtn.html(`
                <div class="spinner-border spinner-border-sm" role="status"
          style="--bs-spinner-border-width:0.1em"></div>
        <span>Installing...</span>

        `);

        installBtn.prop("disabled", true);

        const task = installPlugin(plugin).then((success) => {
          if (success) {
            $btn.html(
              '<span class="d-flex gap-2 align-items-center"><i class="fa-regular fa-circle-check accent-color"></i>Install Successfully</span>',
            );
          } else {
            $btn.html(
              '<span class="d-flex gap-2 align-items-center"><i class="fa-regular fa-circle-xmark text-danger"></i>Install Failed</span>',
            );
          }
        });

        tasks.push(task);
      });

      // ⏳ TUNGGU SEMUA INSTALL SELESAI
      await Promise.all(tasks);

      // BARU LANJUT
      installBtn.html(`
       <div class="spinner-border spinner-border-sm" role="status"
          style="--bs-spinner-border-width:0.1em"></div>
        <span>Checking...</span>
        `);
      pluginCheck();
    });
  }

  function installPlugin(plugin) {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: rtmkitWizard.ajax_url,
        method: "POST",
        data: {
          action: "update_plugin",
          plugin: plugin,
          nonce: rtmkitWizard.rtmkit_nonce,
        },
        success: function (res) {
          console.log(res);
          resolve(!!res.success);
        },
        error: function (err) {
          console.log(err);
          resolve(false); // jangan reject, biar Promise.all tetap jalan
        },
      });
    });
  }

  function modules() {
    const nextBtn = $("[data-action=save-module]");
    nextBtn.off("click").on("click", async function (e) {
      e.preventDefault();
      $(this)
        .prop("disabled", true)
        .html(
          ` <div class="spinner-border spinner-border-sm" role="status"
          style="--bs-spinner-border-width:0.1em"></div>
        <span>Saving...</span>`,
        );
      const types = getType("[data-module-type]");
      // Array of Promises
      const promises = types.map((e) => {
        let data = {};
        const switchModule = document.querySelectorAll(
          `[data-module-type="${e}"] input.switch-status`,
        );

        switchModule.forEach((el) => {
          data[el.name] = el.checked;
        });

        return fetch(
          `${rtmkitWizard.ajax_url}?action=save_modules&type=${e}&nonce=${rtmkitWizard.rtmkit_nonce}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          },
        )
          .then((res) => res.json())
          .then((response) => {
            console.log(response);
            console.log(response.data.message);
          });
      });

      // Tunggu semua request selesai
      await Promise.all(promises);
      $(this).prop("disabled", false).html(`Next`);
      var nextStep = 3;
      $(".wizard-step-content").removeClass("active");
      $('[data-step-content="' + nextStep + '"]').addClass("active");
      $('.wizard-step[data-step="' + nextStep + '"]').addClass("active");
      url = new URL(window.location);
      url.searchParams.set("step", nextStep);
      window.history.pushState({}, "", url);
      functionRunner(nextStep);
    });
  }

  function getType(selector) {
    const allTypes = [];

    // Ambil nama attribute dari selector, misalnya: [data-widget-type] -> data-widget-type
    const attrMatch = selector.match(/\[([^\]=]+)\]/);
    const attrName = attrMatch ? attrMatch[1] : null;

    document.querySelectorAll(selector).forEach((el) => {
      // Cari input switch-status di dalam elemen ini
      const switchInput = el.querySelector(".switch-status");

      // Skip jika switch-status ada DAN disabled
      if (switchInput && switchInput.disabled) {
        return;
      }

      if (attrName) {
        const type = el.getAttribute(attrName);
        if (type && !allTypes.includes(type)) {
          allTypes.push(type);
        }
      }
    });

    return allTypes;
  }

  function subscribe() {
    const form = $("#subscribe-form");
    $("[data-next=6]")
      .off("click")
      .on("click", function (e) {
        var nextStep = 6;
        $(".wizard-step-content").removeClass("active");
        $('[data-step-content="' + nextStep + '"]').addClass("active");
        $('.wizard-step[data-step="' + nextStep + '"]').addClass("active");
        url = new URL(window.location);
        url.searchParams.set("step", nextStep);
        window.history.pushState({}, "", url);
        functionRunner(nextStep);
      });
    form.on("submit", function (e) {
      e.preventDefault();
      let email = $(this).find("#email").val();
      const btn = $(this).find("button[type=submit]");
      $("[data-next=6]").prop("disabled", true).html(`
        <div class="spinner-border spinner-border-sm" role="status"
          style="--bs-spinner-border-width:0.1em"></div>
        <span>Sending...</span>
        `);
      btn.prop("disabled", true).html(`
        <div class="spinner-border spinner-border-sm" role="status"
          style="--bs-spinner-border-width:0.1em"></div>
        <span>Sending...</span>
        `);
      $(this).find("#email").prop("disabled", true);
      $.ajax({
        url: rtmkitWizard.ajax_url,
        method: "POST",
        data: {
          action: "newsletter_subscribe",
          email: email,
          nonce: rtmkitWizard.nonce,
        },
        success: function (res) {
          if (res.success) {
            btn
              .attr("data-submit-done", true)
              .html(
                `<span class="d-flex gap-2 align-items-center"><i class="fa-regular fa-circle-check accent-color"></i>Successfully</span>`,
              );
            $("[data-next=5]").prop("disabled", false).html(`Next`);
          }
        },
      });
    });
  }

  function finish() {
    const visitBtn = $("[data-finish]");

    visitBtn.on("click", function (e) {
      e.preventDefault();
      $this = $(this);
      $this.prop("disabled", true)
        .html(`<div class="spinner-border spinner-border-sm" role="status"
          style="--bs-spinner-border-width:0.1em"></div>
        <span>Redirect to dashboard...</span>`);
      $.ajax({
        url: rtmkitWizard.ajax_url,
        method: "POST",
        data: {
          nonce: rtmkitWizard.nonce,
          action: "rtm_wizard_finish",
        },
        success: function (res) {
          // console.log(res);
          if (res.success) {
            // window.location.reload();
            window.location.href = res.data.redirect_url;
          }
        },
      });
    });
  }

  url = new URL(window.location);
  var step = url.searchParams.get("step");
  functionRunner(parseInt(step));
});
