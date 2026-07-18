function tabSlider(switcher, onChange) {
  const CLASS_BUTTON = "menu-switch";

  if (!switcher || switcher.dataset.tabSlider === "initialized") return;

  const buttons = switcher.querySelectorAll(`.${CLASS_BUTTON}`);
  if (!buttons.length) return;

  switcher.dataset.tabSlider = "initialized";

  function updateSlider(button) {
    const rect = button.getBoundingClientRect();
    const parentRect = switcher.getBoundingClientRect();
    const offsetX = rect.left - parentRect.left;
    const width = rect.width;

    switcher.style.setProperty("--slider-x", `${offsetX}px`);
    switcher.style.setProperty("--slider-width", `${width}px`);

    buttons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    if (typeof onChange === "function") {
      onChange(button);
    }
  }

  const initial =
    switcher.querySelector(`.${CLASS_BUTTON}.active`) || buttons[0];
  if (initial) updateSlider(initial);

  buttons.forEach((button) => {
    button.addEventListener("click", () => updateSlider(button));
  });
}

function checkEnableAll(switchElement, switchTarget, filterDisabled = false) {
  const targets = filterDisabled
    ? [...switchTarget].filter((sw) => !sw.disabled)
    : [...switchTarget];

  switchElement.checked = targets.every((sw) => sw.checked);
}

function switcher(switchElement, switchTarget) {
  if (switchElement !== null && switchTarget !== null) {
    const switchs = [...switchTarget].filter((sw) => !sw.disabled);

    switchs.forEach((el) => {
      el.addEventListener("change", () =>
        checkEnableAll(switchElement, switchs),
      );
    });

    switchElement.addEventListener("change", (e) => {
      switchs.forEach((el) => {
        el.checked = e.target.checked;
      });
    });

    checkEnableAll(switchElement, switchs);
  }
}

function resetAllWidgets() {
  const resetBtn = document.querySelector("#reset-all-widgets");
  if (resetBtn !== null) {
    resetBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.currentTarget.innerHTML = `<span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
    <span role="status">Resetting...</span>`;
      e.currentTarget.disabled = true;
      e.currentTarget.classList.add("text-decoration-none");

      fetch(
        `${rtmkit_ajax.ajax_url}?action=reset_all_widgets&nonce=${rtmkit_ajax.nonce}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
        .then((res) => res.json())
        .then((response) => {
          if (response.success) {
            window.location.reload(); // Reload the page to reflect changes
          } else {
            window.reactToast.error(response.data.message, {
              position: "bottom-right",
              autoClose: 5000,
              className: "rtmkit-toast",
              theme: "dark",
            });
          }
          resetBtn.innerHTML = "Reset All";
          resetBtn.disabled = false;
          resetBtn.classList.remove("text-decoration-none");
        })
        .catch(() => {
          window.reactToast.error("Reset failed.", {
            position: "bottom-right",
            autoClose: 5000,
            className: "rtmkit-toast",
            theme: "dark",
          });
          resetBtn.innerHTML = "Reset All";
          resetBtn.disabled = false;
          resetBtn.classList.remove("text-decoration-none");
        });
    });
  }
}

function saveWidgetsOption() {
  const saveBtn = document.querySelector("#save-widgets");

  if (saveBtn !== null) {
    saveBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      let currentHTMLBtn = saveBtn.innerHTML;
      saveBtn.innerHTML = `<span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
    <span role="status">Saving...</span>`;
      saveBtn.disabled = true;

      const types = getType("[data-widget-type]");

      // Array of Promises
      const promises = types.map((e) => {
        let data = {};
        const switchWidget = document.querySelectorAll(
          `[data-widget-type="${e}"] input.switch-status`,
        );

        switchWidget.forEach((el) => {
          data[el.name] = el.checked;
        });

        return fetch(
          `${rtmkit_ajax.ajax_url}?action=save_widget&type=${e}&nonce=${rtmkit_ajax.nonce}`,
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
            if (response.success) {
              window.reactToast.success(response.data.message, {
                position: "bottom-right",
                autoClose: 5000,
                className: "rtmkit-toast",
                theme: "dark",
              });
              const activeWidgets = document.querySelectorAll(
                `[data-widget-type] input.switch-status:checked`,
              );
              document.querySelector(
                "#active-widgets",
              ).textContent = `${activeWidgets.length} Active Widgets`;
            } else {
              window.reactToast.error(response.data.message, {
                position: "bottom-right",
                autoClose: 5000,
                className: "rtmkit-toast",
                theme: "dark",
              });
            }
          });
      });

      // Tunggu semua request selesai
      await Promise.all(promises);

      // Baru lanjut
      saveBtn.innerHTML = currentHTMLBtn;
      saveBtn.disabled = false;
    });
  }
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

function saveModules() {
  const saveBtn = document.querySelector("#save-modules");

  if (saveBtn !== null) {
    saveBtn.addEventListener("click", async function (e) {
      e.preventDefault();
      let currentHTMLBtn = saveBtn.innerHTML;
      saveBtn.innerHTML = `<span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
    <span role="status">Saving...</span>`;
      saveBtn.disabled = true;

      let type = getType("[data-module-type]");
      const promise = type.map((e) => {
        let data = {};
        const switchExtension = document.querySelectorAll(
          `[data-module-type="${e}"] input.switch-status`,
        );
        switchExtension.forEach((el) => {
          data[el.name] = el.checked;
        });

        return fetch(
          `${rtmkit_ajax.ajax_url}?action=save_modules&type=${e}&nonce=${rtmkit_ajax.nonce}`,
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
            if (response.success) {
              window.reactToast.success(response.data.message, {
                position: "bottom-right",
                autoClose: 5000,
                className: "rtmkit-toast",
                theme: "dark",
              });
            } else {
              window.reactToast.error(response.data.message, {
                position: "bottom-right",
                autoClose: 5000,
                className: "rtmkit-toast",
                theme: "dark",
              });
            }
          });
      });

      await Promise.all(promise);
      // Baru lanjut
      saveBtn.innerHTML = currentHTMLBtn;
      saveBtn.disabled = false;
    });
  }
}

function reset_modules() {
  const resetBtn = document.querySelector("#reset-all-modules");

  if (resetBtn !== null) {
    resetBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.currentTarget.innerHTML = `<span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
    <span role="status">Resetting...</span>`;
      e.currentTarget.disabled = true;
      e.currentTarget.classList.add("text-decoration-none");

      fetch(
        `${rtmkit_ajax.ajax_url}?action=reset_modules&nonce=${rtmkit_ajax.nonce}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
        .then((res) => res.json())
        .then((response) => {
          if (response.success) {
            window.location.reload(); // Reload the page to reflect changes
          } else {
            window.reactToast.error(response.data.message, {
              position: "bottom-right",
              autoClose: 5000,
              className: "rtmkit-toast",
              theme: "dark",
            });
          }
          resetBtn.innerHTML = "Reset All";
          resetBtn.disabled = false;
          resetBtn.classList.remove("text-decoration-none");
        })
        .catch(() => {
          window.reactToast.error(response.data.message, {
            position: "bottom-right",
            autoClose: 5000,
            className: "rtmkit-toast",
            theme: "dark",
          });
          resetBtn.innerHTML = "Reset All";
          resetBtn.disabled = false;
          resetBtn.classList.remove("text-decoration-none");
        });
    });
  }
}

function tabs() {
  const tabs = document.querySelectorAll(".tabs");

  if (tabs.length) {
    tabs.forEach((el) => {
      const tabBtn = el.querySelectorAll(".tab-nav .nav-link");
      const tabContents = document.querySelectorAll(".tab-content .tab-item");

      // fungsi helper untuk ganti tab
      const activateTab = (tabId) => {
        // reset semua tombol
        tabBtn.forEach((b) => b.classList.remove("active"));
        // reset semua konten
        tabContents.forEach((c) => c.classList.remove("active"));

        // aktifkan sesuai tabId
        const activeBtn = el.querySelector(
          `.tab-nav .nav-link[data-tabs="${tabId}"]`,
        );
        const target = document.querySelector(tabId);

        if (activeBtn) activeBtn.classList.add("active");
        if (target) target.classList.add("active");
      };

      // klik event
      tabBtn.forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();

          const targetSelector = btn.getAttribute("data-tabs");

          // update tab
          activateTab(targetSelector);

          // update URL (replace tab param)
          const url = new URL(window.location);
          url.searchParams.set("tab", targetSelector.replace("#", ""));
          window.history.pushState({ tab: targetSelector }, "", url);
        });
      });

      // popstate event (navigasi browser back/forward)
      window.addEventListener("popstate", (e) => {
        const url = new URL(window.location);
        const tab = url.searchParams.get("tab");
        if (tab) {
          activateTab(`#${tab}`);
        }
      });

      // aktifkan tab sesuai URL saat pertama kali load
      const initUrl = new URL(window.location);
      const initTab = initUrl.searchParams.get("tab");
      if (initTab) {
        activateTab(`#${initTab}`);
      }
    });
  }
}

const ThemebuilderTabs = () => {
  const btn = document.querySelectorAll(".themebuilder.tabs .nav-link");

  // fungsi helper untuk ganti tab
  const activateTab = (tabId) => {
    // reset semua tombol
    btn.forEach((b) => b.classList.remove("active"));
    // aktifkan sesuai tabId
    const activeBtn = document.querySelector(
      `.themebuilder.tabs .nav-link[data-tabs="${tabId}"]`,
    );
    // const target = document.getElementById(tabId);

    if (activeBtn) activeBtn.classList.add("active");
  };

  btn.forEach((el) => {
    el.addEventListener("click", async function (e) {
      e.preventDefault();
      let tab = e.currentTarget.getAttribute("data-tabs");
      const url = new URL(window.location);
      url.searchParams.set("themebuilder", tab);
      window.history.pushState({ tab: tab }, "", url);
      activateTab(tab);
      const fetching = await render_themebuilder_tab();
    });
  });
  render_themebuilder_tab();
};

const statusTabs = () => {
  const links = document.querySelectorAll(".table-link");

  if (links) {
    links.forEach((el) => {
      el.addEventListener("click", async function (e) {
        e.preventDefault();
        let tab = e.currentTarget.getAttribute("data-status");
        const url = new URL(window.location);
        url.searchParams.set("status", tab);
        window.history.pushState({ tab: tab }, "", url);
        // activateTab(tab);
        const fetching = await render_themebuilder_tab();
      });
    });
  }
};

async function render_themebuilder_tab() {
  const content = document.getElementById("themebuilder-tab-content");
  const loading = `<div class="d-flex justify-content-center align-items-center" style="min-height:20rem">${window.RTMLoader}</>`;
  // content.innerHTML = "";
  if (content) {
    content.innerHTML = loading;
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("action", "get_themebuilder_table");
    urlParams.set("nonce", rtmkit_ajax.nonce);

    try {
      const res = await fetch(rtmkit_ajax.ajax_url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: urlParams.toString(),
      });

      const json = await res.json();
      if (json.success) {
        content.innerHTML = "";
        content.innerHTML = json.data;
        statusTabs();
        editThemebuilder();
        // addCondition();
        let themebuilder = urlParams.get("themebuilder") ?? "all";
        if (themebuilder == "form") {
          form();
          installRTMForm();
        }
      }
    } catch (error) {
      console.error("Error fetching content:", error);
    }
  }
}

function form() {
  const exportToCSVBtn = document.querySelectorAll(".export-to-csv");
  if (exportToCSVBtn.length) {
    exportToCSVBtn.forEach((el) => {
      el.onclick = (e) => {
        e.preventDefault();
        const thisBtn = e.currentTarget;
        const formId = thisBtn.dataset.formId;
        const formName = thisBtn.dataset.formName;
        let param = new URLSearchParams({
          action: "export_entries",
          form_id: formId,
          form_name: formName,
          nonce: romethemeform_ajax_url.nonce,
        });
        let url = new URL(romethemeform_ajax_url.ajax_url);
        url.search = param;
        window.location.href = url;
      };
    });
  }

  const viewEntriesBtn = document.querySelectorAll("[data-view-entries]");

  if (viewEntriesBtn.length) {
    viewEntriesBtn.forEach((btn) => {
      btn.onclick = (e) => {
        e.preventDefault();
        let formId = e.currentTarget.dataset.viewEntries;
        let url = new URL(window.location);
        url.searchParams.delete("themebuilder");

        if (url.searchParams.has("status")) {
          url.urlSearchParams.delete("status");
        }

        if (url.searchParams.has("paged")) {
          url.urlSearchParams.delete("paged");
        }

        url.searchParams.set("path", "submission");
        url.searchParams.set("rform_id", formId);

        window.history.pushState({}, "", url);

        window.setReactPath("submission");
      };
    });
  }

  editFormThemebuilder();
}

function editFormThemebuilder() {
  const editBtns = document.querySelectorAll(".form-edit-link");
  const editFormModalEl = document.getElementById("formUpdate");
  let editFormModal = null;
  let currentData = null;
  if (editFormModalEl) {
    editFormModal = new bootstrap.Modal(editFormModalEl, {
      keyboard: false,
      backdrop: "static",
    });

    editFormModalEl.addEventListener("show.bs.modal", (e) => {
      const data = currentData;
      let isConfirmation =
        data.confirmation &&
        data.confirmation !== null &&
        data.confirmation !== "";

      let isNotification =
        data.notification &&
        data.notification !== null &&
        data.notification !== "";

      editFormModalEl.querySelector("#id[name=id]").value = data.id;

      editFormModalEl.querySelector("#form-name").value = data.title;
      editFormModalEl.querySelector("#success-message").value =
        data.success_msg;
      editFormModalEl.querySelector("#entry-name").value = data.entry_title;

      editFormModalEl.querySelector("[name=require-login]").checked =
        data.restricted && data.restricted == "true";

      editFormModalEl.querySelector("#switch_confirmation").checked =
        isConfirmation;

      editFormModalEl.querySelector("#switch_notification").checked =
        isNotification;

      if (isConfirmation) {
        let confirmation = JSON.parse(data.confirmation);
        editFormModalEl.querySelector("#update_email_subject").value =
          confirmation.email_subject;
        editFormModalEl.querySelector("#update_email_from").value =
          confirmation.email_from;
        editFormModalEl.querySelector("#update_email_replyto").value =
          confirmation.email_replyto;
        editFormModalEl.querySelector("#update_thks_msg").value =
          confirmation.thankyou_msg;
      }

      if (isNotification) {
        let notification = JSON.parse(data.notification);
        editFormModalEl.querySelector("#update_notif_subject").value =
          notification.notif_subject;
        editFormModalEl.querySelector("#update_notif_email_from").value =
          notification.notif_email_from;
        editFormModalEl.querySelector("#update_notif_email_to").value =
          notification.notif_email_to;
        editFormModalEl.querySelector("#update_adm_msg").value =
          notification.admin_note;
      }
      toogle_form_confirmation(editFormModalEl);
      toogle_form_notification(editFormModalEl);

      const switchConfirmation = editFormModalEl.querySelector(
        "#switch_confirmation",
      );
      const switchNotif = editFormModalEl.querySelector("#switch_notification");
      switchConfirmation.onchange = (e) => {
        toogle_form_confirmation(editFormModalEl);
      };
      switchNotif.onchange = (e) => {
        toogle_form_notification(editFormModalEl);
      };

      const submitBtn = editFormModalEl.querySelector("#rform-save-button");

      if (submitBtn) {
        submitBtn.onclick = (e) =>
          submitForm(editFormModalEl, editFormModal, false);
      }
    });

    editFormModalEl.addEventListener("hidden.bs.modal", (e) => {
      editFormModalEl
        .querySelector(".nav-link.active")
        .classList.remove("active");
      editFormModalEl.querySelector("#nav-general-tab").classList.add("active");
      editFormModalEl
        .querySelector(".tab-pane.active.show")
        .classList.remove("active", "show");
      editFormModalEl
        .querySelector("#nav-update-general")
        .classList.add("active", "show");
    });
  }

  if (editBtns.length) {
    editBtns.forEach((btn) => {
      btn.onclick = (e) => {
        e.preventDefault();
        const data = JSON.parse(e.currentTarget.getAttribute("data"));
        currentData = data;
        editFormModal.show();
      };
    });
  }
}

function addThemebuilder() {
  const urlParams = new URLSearchParams(window.location.search);
  const addBtn = document.getElementById("add-themebuilder");
  const addModalEl = document.getElementById("addModal");
  let themebuilder = urlParams.get("themebuilder") ?? "all";
  if (addModalEl) {
    addModalEl.addEventListener("shown.bs.modal", (e) => {
      const urlParams = new URLSearchParams(window.location.search);
      let themebuilder = urlParams.get("themebuilder") ?? "all";

      if (themebuilder !== "all" && themebuilder !== "form") {
        const inputType = addModalEl.querySelector("#inputType");
        if (inputType) {
          inputType.value = themebuilder;
        }
      }
    });
    addModalEl.addEventListener("hidden.bs.modal", (e) => {
      const thisModal = e.target;
      thisModal.querySelector(".conditions").innerHTML = "";
      thisModal.querySelector("#inputTitle").value = "";
      thisModal.querySelector("#inputType").value = "";
    });
  }
  if (addBtn) {
    addBtn.onclick = function (e) {
      e.preventDefault();
      if (
        new URLSearchParams(window.location.search).get("themebuilder") ==
        "form"
      ) {
        const addModalFormEl = document.getElementById("formModal");
        const addModalForm = new bootstrap.Modal(addModalFormEl, {
          keyboard: false,
          backdrop: "static",
        });
        toogle_form_confirmation(addModalFormEl);
        toogle_form_notification(addModalFormEl);
        addModalFormEl.addEventListener("show.bs.modal", (e) => {
          toogle_form_confirmation(addModalFormEl);
          toogle_form_notification(addModalFormEl);
          const switchConfirmation = addModalFormEl.querySelector(
            "#switch_confirmation",
          );
          const switchNotif = addModalFormEl.querySelector(
            "#switch_notification",
          );
          switchConfirmation.onchange = (e) => {
            toogle_form_confirmation(addModalFormEl);
          };
          switchNotif.onchange = (e) => {
            toogle_form_notification(addModalFormEl);
          };

          const submitBtn = addModalFormEl.querySelector("#rform-save-button");

          if (submitBtn) {
            submitBtn.onclick = (e) =>
              submitForm(addModalFormEl, addModalForm, true);
          }
        });
        addModalForm.show();

        addModalFormEl.addEventListener("hidden.bs.modal", (e) => {
          addModalFormEl
            .querySelector(".nav-link.active")
            .classList.remove("active");
          addModalFormEl
            .querySelector("#nav-general-tab")
            .classList.add("active");
          addModalFormEl
            .querySelector(".tab-pane.active.show")
            .classList.remove("active", "show");
          addModalFormEl
            .querySelector("#nav-general")
            .classList.add("active", "show");
          addModalFormEl.querySelector("#form-name").value = "";
          addModalFormEl.querySelector("#success-message").value =
            "Thank you! Form submitted successfully.";
          addModalFormEl.querySelector("#entry-name").value = "Entry #";
          addModalFormEl.querySelector("#switch_confirmation").checked = false;
          addModalFormEl.querySelector("#switch_notification").checked = false;
          addModalFormEl.querySelector("#email_subject").value = "";
          addModalFormEl.querySelector("#email_from").value = "";
          addModalFormEl.querySelector("#email_replyto").value = "";
          addModalFormEl.querySelector("#thks_msg").value = "";
          addModalFormEl.querySelector("#notif_subject").value = "";
          addModalFormEl.querySelector("#notif_email_from").value = "";
          addModalFormEl.querySelector("#notif_email_to").value = "";
          addModalFormEl.querySelector("#adm_msg").value = "";
        });
      } else {
        const addModal = new bootstrap.Modal("#addModal", {
          keyboard: false,
          backdrop: "static",
        });

        addCondition(null, addModalEl);

        addModal.show();
      }
    };
  }
  submitThemebuilder();
}

function toogle_form_confirmation(modalEl) {
  const switchConfirmation = modalEl.querySelector("#switch_confirmation");
  const confirmForm = modalEl.querySelector("#confirmation_form");
  if (switchConfirmation.checked) {
    confirmForm.style.display = "block";
  } else {
    confirmForm.style.display = "none";
  }
}

function toogle_form_notification(modalEl) {
  const switchNotif = modalEl.querySelector("#switch_notification");
  const notifForm = modalEl.querySelector("#notification_form");
  if (switchNotif.checked) {
    notifForm.style.display = "block";
  } else {
    notifForm.style.display = "none";
  }
}

function submitForm(modalEl, modal, editor = false) {
  const form = modalEl.querySelector("form");
  const submitBtn = modalEl.querySelector("#rform-save-button");

  let currentHTMLBtn = submitBtn.innerHTML;

  submitBtn.disabled = true;

  submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
        <span role="status">Saving...</span>`;

  let formData = new FormData(form);
  formData.set("nonce", romethemeform_ajax_url.nonce);
  fetch(rtmkit_ajax.ajax_url, {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.success) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = currentHTMLBtn;
        if (editor) {
          const modalEditor = document.getElementById("rform-editor-modal");
          const iframe = modalEditor.querySelector("#rform-elementor-editor");
          modal.hide();
          iframe.src = res.data.url;
          modalEditor.style.display = "block";

          const saveBtn = modalEditor.querySelector("#rform-save-editor-btn");
          saveBtn.onclick = (e) => {
            e.preventDefault();
            const elementorEditor = iframe.contentWindow.elementor;
            elementorEditor.saver.saveEditor({
              status: elementorEditor.settings.page.model.get("post_status"),
              onSuccess: function () {
                window.reactToast.success(
                  "The form has been saved successfully.",
                  {
                    position: "bottom-right",
                    autoClose: 5000,
                    className: "rtmkit-toast",
                    theme: "dark",
                  },
                );
                modalEditor.style.display = "none";
                render_themebuilder_tab();
              },
              onError: function () {
                alert("Error saving Form");
              },
            });
          };
        } else {
          window.reactToast.success(res.data.message, {
            position: "bottom-right",
            autoClose: 5000,
            className: "rtmkit-toast",
            theme: "dark",
          });

          modal.hide();
          render_themebuilder_tab();
        }
      }
    })
    .catch((res) => {
      console.log(res);
    });
}

function editThemebuilder() {
  const editBtns = document.querySelectorAll(".edit-link");
  const editModalEl = document.getElementById("editModal");

  if (!editModalEl) return;

  const editModal = new bootstrap.Modal(editModalEl, {
    keyboard: false,
    backdrop: "static",
  });

  // Bersihkan modal setiap kali ditutup
  editModalEl.addEventListener("hidden.bs.modal", (e) => {
    const thisModal = e.target;
    thisModal.querySelector(".conditions").innerHTML = "";
    thisModal.querySelector("#inputTitle").value = "";
    thisModal.querySelector("#inputType").value = "";
    thisModal.querySelector('input[name="themebuilder_id"]').value = "";
    thisModal.querySelector('input[name="active"]').checked = false;
  });

  // Jalankan listener untuk semua tombol edit
  if (editBtns.length) {
    editBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();

        const dataAttr = btn.getAttribute("data");
        if (!dataAttr) return console.error("Tidak ada data di tombol edit!");

        let data = {};
        try {
          data = JSON.parse(dataAttr);
        } catch (err) {
          console.error("Gagal parse data JSON:", err);
          return;
        }

        // Simpan reference tombol yang diklik
        editModalEl.relatedButton = btn;

        // Tampilkan modal dulu
        editModal.show();

        // Tunggu modal selesai muncul agar DOM siap
        editModalEl.addEventListener(
          "shown.bs.modal",
          function handleModalShow() {
            const thisModal = editModalEl;

            // Hapus event ini agar tidak dipanggil dua kali
            editModalEl.removeEventListener("shown.bs.modal", handleModalShow);

            // Isi data field
            thisModal.querySelector("#inputTitle").value = data.title || "";
            thisModal.querySelector("#inputType").value = data.type || "";
            thisModal.querySelector('input[name="themebuilder_id"]').value =
              data.id || "";

            thisModal.querySelector('input[name="active"]').checked =
              data.active === "true" || data.active === true;

            // Render condition hanya jika ada data
            if (data.conditions) {
              addCondition(data.conditions, editModalEl);
            } else {
              console.warn("Tidak ada data.conditions pada data edit:", data);
            }
          },
        );
      });
    });
  }
}

function addCondition(savedConditions = null, modalEl) {
  const inputGroup = `
    <div class="input-group condition-input" data-condition-type="include">
      <select class="form-select w-25 py-2 condition-select">
        <option value="include" selected>Include</option>
        <option value="exclude">Exclude</option>
      </select>
      <select class="form-select w-auto py-2 page-select">
        <option value="entire">Entire Site</option>
        <option value="archives">Archives</option>
        <option value="singular">Singular</option>
        <option value="woocommerce">WooCommerce</option>
        <option value="error_404">404</option>
      </select>
    </div>
    <button class="btn p-3 del-condition" type="button">✕</button>
  `;

  const subOptions = {
    archives: [
      { val: "all", text: "All Archives" },
      { val: "author", text: "Author Archive", specific: "author" },
      { val: "search", text: "Search Results" },
      { val: "post_archive", text: "Post Archive" },
      { val: "categories", text: "Categories", specific: "category" },
      { val: "tags", text: "Tags", specific: "tag" },
    ],
    singular: [
      { val: "all", text: "All Singular" },
      { val: "front_page", text: "Front Page" },
      { val: "posts", text: "Posts", specific: "post" },
      { val: "post_category", text: "Post Category", specific: "category" },
      { val: "post_tag", text: "Post Tag", specific: "tag" },
      { val: "pages", text: "Pages", specific: "page" },
      { val: "author", text: "By Author", specific: "author" },
    ],
    woocommerce: [
      { val: "shop", text: "Shop Page" },
      { val: "product_archive", text: "Product Archive" },
      { val: "single_product", text: "Single Product", specific: "product" },
      {
        val: "product_categories",
        text: "Product Categories",
        specific: "product_cat",
      },
      { val: "product_tags", text: "Product Tags", specific: "product_tag" },
      {
        val: "product_author",
        text: "Product by Author",
        specific: "author",
      },
    ],
  };

  // Pastikan tombol .add-condition hanya terdaftar 1 kali

  modalEl.querySelectorAll(".add-condition").forEach((btn) => {
    btn.onclick = (e) => handleAddCondition(e, null, null, modalEl);
  });

  function handleAddCondition(e, predefined = null, type = "include", modalEl) {
    e?.preventDefault();
    // defensive: jika tetap null/undefined -> jadikan 'include'
    if (type === null || typeof type === "undefined") type = "include";
    const wrapper = document.createElement("div");
    wrapper.className = "d-flex flex-row align-items-center mb-2";
    wrapper.innerHTML = inputGroup;

    const list = modalEl.querySelector(".conditions");
    list.appendChild(wrapper);

    const conditionSelect = wrapper.querySelector(".condition-select");
    const pageSelect = wrapper.querySelector(".page-select");
    const delBtn = wrapper.querySelector(".del-condition");
    const inputCondition = wrapper.querySelector(".condition-input");

    inputCondition.setAttribute("data-condition-type", type);
    conditionSelect.value = type;

    delBtn.addEventListener("click", () => wrapper.remove());
    conditionSelect.addEventListener("change", () => {
      inputCondition.setAttribute("data-condition-type", conditionSelect.value);
    });

    const renderSub = (
      pageVal,
      selectedSub = null,
      selectedSpecific = null,
    ) => {
      wrapper
        .querySelectorAll(".sub-select, .specific-select")
        .forEach((el) => el.remove());
      pageSelect.removeAttribute("data-has-sub");

      if (subOptions[pageVal]) {
        pageSelect.setAttribute("data-has-sub", "true");
        const subSelect = document.createElement("select");
        subSelect.className = "form-select w-auto py-2 sub-select";

        subOptions[pageVal].forEach((opt) => {
          const option = document.createElement("option");
          option.value = opt.val;
          option.textContent = opt.text;
          subSelect.appendChild(option);
        });

        inputCondition.appendChild(subSelect);
        if (selectedSub) subSelect.value = selectedSub;

        subSelect.addEventListener("change", () => {
          const selected = subOptions[pageVal].find(
            (o) => o.val === subSelect.value,
          );
          wrapper
            .querySelectorAll(".specific-select")
            .forEach((el) => el.remove());
          subSelect.removeAttribute("data-has-sub");

          if (selected && selected.specific) {
            subSelect.setAttribute("data-has-sub", "true");

            const specificSelect = document.createElement("select");
            specificSelect.className = "specific-select form-control";
            inputCondition.appendChild(specificSelect);

            let tomselect = new TomSelect(specificSelect, {
              valueField: "id",
              labelField: "text",
              searchField: "text",
              placeholder: "Search " + selected.specific,
              load: function (query, callback) {
                if (!query.length) return callback();
                fetch(rtmkit_ajax.ajax_url, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                  },
                  body: new URLSearchParams({
                    action: "get_specific_posts",
                    nonce: rtmkit_ajax.nonce,
                    post_type: selected.specific,
                    search: query,
                  }),
                })
                  .then((res) => res.json())
                  .then((data) => {
                    callback(
                      data?.data?.map((item) => ({
                        id: item.id,
                        text: item.text,
                      })) || [],
                    );
                  })
                  .catch(() => callback());
              },
            });

            if (selectedSpecific) {
              const val = String(selectedSpecific);
              fetch(rtmkit_ajax.ajax_url, {
                method: "POST",
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                  action: "get_specific_posts",
                  nonce: rtmkit_ajax.nonce,
                  post_type: selected.specific,
                  post_id: val,
                }),
              })
                .then((res) => res.json())
                .then((data) => {
                  const item = data?.data?.find((i) => String(i.id) === val);
                  if (item) {
                    tomselect.addOption(item);
                    tomselect.addItem(item.id);
                  }
                });
            }
          }
        });

        if (selectedSub) subSelect.dispatchEvent(new Event("change"));
      }
    };

    // Jika ada predefined (edit)
    if (predefined) {
      pageSelect.value = predefined.page;

      if (predefined.sub && typeof predefined.sub === "object") {
        const entries = Object.entries(predefined.sub);

        entries.forEach(([subKey, subValue], index) => {
          // Jika value adalah array → buat multiple row
          if (Array.isArray(subValue)) {
            subValue.forEach((val, i) => {
              if (index === 0 && i === 0) {
                renderSub(predefined.page, subKey, val);
              } else {
                handleAddCondition(
                  null,
                  { page: predefined.page, sub: { [subKey]: val } },
                  type,
                  modalEl,
                );
              }
            });
          } else {
            // single value (string / true)
            if (index === 0) {
              renderSub(predefined.page, subKey, subValue);
            } else {
              handleAddCondition(
                null,
                { page: predefined.page, sub: { [subKey]: subValue } },
                type,
                modalEl,
              );
            }
          }
        });
      }
    }

    pageSelect.addEventListener("change", () => renderSub(pageSelect.value));
  }

  // Jika edit mode (savedConditions)
  if (savedConditions) {
    console.log("Loading saved conditions:", savedConditions);
    ["include", "exclude"].forEach((type) => {
      if (Array.isArray(savedConditions[type])) {
        savedConditions[type].forEach((cond) =>
          handleAddCondition(null, cond, type, modalEl),
        );
      }
    });
  }
}

function submitThemebuilder() {
  const forms = document.querySelectorAll(".themebuilder-forms");

  if (forms) {
    forms.forEach((el) => {
      el.addEventListener("submit", (e) => {
        e.preventDefault();
        const btn = e.submitter;
        console.log(btn);
        let currentHTMLBtn = btn.innerHTML;
        btn.innerHTML = `<span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
        <span role="status">Saving...</span>`;
        btn.disabled = true;

        const formData = new FormData(e.target);
        let condition = buildConditions(el);
        let data = {
          action: formData.get("action"),
          title: formData.get("title"),
          type: formData.get("type"),
          active: formData.get("active"),
          nonce: rtmkit_ajax.nonce,
        };

        data = { ...data, conditions: JSON.stringify(condition) };
        console.log(data);
        if (formData.has("themebuilder_id")) {
          data = { ...data, themebuilder_id: formData.get("themebuilder_id") };
        }
        fetch(rtmkit_ajax.ajax_url, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams(data),
        })
          .then((res) => res.json())
          .then((res) => {
            if (res.success) {
              window.location.reload();
            }
          });
      });
    });
  }
}

function buildConditions(forms) {
  let conditions = { include: [], exclude: [] };

  const inputConditionInclude = forms.querySelectorAll(
    ".condition-input[data-condition-type=include]",
  );
  const inputConditionExclude = forms.querySelectorAll(
    ".condition-input[data-condition-type=exclude]",
  );

  // Handle Include
  inputConditionInclude.forEach((el) => {
    const pageSelect = el.querySelector(".page-select");
    const pageValue = pageSelect.value;

    if (pageSelect.hasAttribute("data-has-sub")) {
      const subSelect = el.querySelector(".sub-select");
      let subObj = {};

      if (subSelect.hasAttribute("data-has-sub")) {
        const specificItem = el.querySelector(".item[data-ts-item]");
        subObj[subSelect.value] = specificItem
          ? specificItem.getAttribute("data-value")
          : true;
      } else {
        subObj[subSelect.value] = true;
      }
      // cek apakah sudah ada page yg sama
      let existing = conditions.include.find((c) => c.page === pageValue);
      if (existing) {
        Object.keys(subObj).forEach((key) => {
          const newValue = subObj[key];

          if (!existing.sub[key]) {
            // belum ada key → langsung set
            existing.sub[key] = newValue;
          } else {
            // sudah ada key
            if (!Array.isArray(existing.sub[key])) {
              // ubah ke array jika masih string
              existing.sub[key] = [existing.sub[key]];
            }

            // hindari duplicate
            if (!existing.sub[key].includes(newValue)) {
              existing.sub[key].push(newValue);
            }
          }
        });
      } else {
        conditions.include.push({
          page: pageValue,
          sub: subObj,
        });
      }
    } else {
      conditions.include.push({ page: pageValue });
    }
  });

  // Handle Exclude (sama logika)
  inputConditionExclude.forEach((el) => {
    const pageSelect = el.querySelector(".page-select");
    const pageValue = pageSelect.value;

    if (pageSelect.hasAttribute("data-has-sub")) {
      const subSelect = el.querySelector(".sub-select");
      let subObj = {};

      if (subSelect.hasAttribute("data-has-sub")) {
        const specificItem = el.querySelector(".item[data-ts-item]");
        subObj[subSelect.value] = specificItem
          ? specificItem.getAttribute("data-value")
          : true;
      } else {
        subObj[subSelect.value] = true;
      }

      let existing = conditions.exclude.find((c) => c.page === pageValue);
      if (existing) {
        Object.keys(subObj).forEach((key) => {
          const newValue = subObj[key];

          if (!existing.sub[key]) {
            // belum ada key → langsung set
            existing.sub[key] = newValue;
          } else {
            // sudah ada key
            if (!Array.isArray(existing.sub[key])) {
              // ubah ke array jika masih string
              existing.sub[key] = [existing.sub[key]];
            }

            // hindari duplicate
            if (!existing.sub[key].includes(newValue)) {
              existing.sub[key].push(newValue);
            }
          }
        });
      } else {
        conditions.exclude.push({
          page: pageValue,
          sub: subObj,
        });
      }
    } else {
      conditions.exclude.push({ page: pageValue });
    }
  });

  return conditions;
}

function Templates() {
  const switcher = document.querySelectorAll(".template-tab .menu-switcher");
  const btnAction = document.querySelector(".action-button-container");

  if (switcher.length) {
    switcher.forEach((el) => {
      tabSlider(el, (button) => {
        let activeTemplates = button.dataset.templates;
        const url = new URL(window.location);
        url.searchParams.set("template", activeTemplates);

        if (url.searchParams.has("search")) {
          url.searchParams.delete("search");
        }
        if (url.searchParams.has("paged")) {
          url.searchParams.delete("paged");
        }
        if (url.searchParams.has("category")) {
          url.searchParams.delete("category");
        }
        if (url.searchParams.has("installed_template")) {
          url.searchParams.delete("installed_template");
        }

        btnAction.style.display = "none";

        window.history.pushState({ tab: activeTemplates }, "", url);
        renderTemplates(activeTemplates);
      });
    });
  }

  searchTemplates();
}

function renderTemplates(templates) {
  const categoriesSelect = document.getElementById("free-categories");
  const search = document.querySelector(".search-container");
  if (templates === "templatekits" && categoriesSelect) {
    categoriesSelect.style.display = "flex";
    setupCategoryFilter();
  } else {
    if (categoriesSelect) {
      categoriesSelect.style.display = "none";
    }
  }

  if (templates === "installed" && search) {
    search.style.display = "none";
  } else {
    if (search) {
      search.style.display = "flex";
    }
  }

  const content = document.getElementById("template_container");
  const loading = `<div class="d-flex justify-content-center align-items-center" style="min-height:20rem">${window.RTMLoader}</>`;
  content.innerHTML = loading;
  if (content) {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("action", "render_templates");
    urlParams.set("nonce", rtmkit_ajax.nonce);
    urlParams.set("template", templates);
    fetch(rtmkit_ajax.ajax_url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: urlParams.toString(),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          content.innerHTML = "";
          content.innerHTML = json.data;
          // console.log(json.data);
          paginationTemplates();
          if (templates === "templatekits") {
            downloadTemplate();
            viewTemplateDetails();
          } else if (templates === "installed") {
            uploadTemplate();
            deleteTemplate();
            viewTemplateDetails();
            importTemplates();
            deleteInstalledTemplate();
            installRequiredPlugin();
          } else if (templates === "themeforest") {
            themeforestStats();
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching content:", error);
      });
  }
}

function searchTemplates() {
  const searchInput = document.getElementById("search-templates");
  if (searchInput) {
    searchInput.addEventListener("change", function (e) {
      e.preventDefault();
      let search = e.target.value;
      const url = new URL(window.location);
      url.searchParams.set("search", search);
      window.history.pushState({ search: search }, "", url);
      const urlParams = new URLSearchParams(window.location.search);
      let template = urlParams.get("template") ?? "all";
      renderTemplates(template);
    });
  }
}

function setupCategoryFilter() {
  const categorySelect = document.getElementById("free-categories");
  const activeText = categorySelect.querySelector(".active-text");
  const categoryItems = categorySelect.querySelectorAll(".category-item");
  categoryItems.forEach((item) => {
    // item.removeEventListener("click", function () {});
    item.addEventListener("click", function (e) {
      categorySelect.removeEventListener("click", function () {});
      e.preventDefault();
      let category = e.currentTarget.getAttribute("data-category");
      const url = new URL(window.location);
      url.searchParams.set("category", category);
      window.history.pushState({ category: category }, "", url);
      const urlParams = new URLSearchParams(window.location.search);
      let template = urlParams.get("template") ?? "all";
      renderTemplates(template);
      activeText.textContent = e.currentTarget.textContent;
    });
  });
}

function downloadTemplate() {
  const downloadBtns = document.querySelectorAll(".btn-install-template");
  if (downloadBtns.length) {
    downloadBtns.forEach((btn) => {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        let currentHTMLBtn = btn.innerHTML;
        btn.innerHTML = `<span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
        <span role="status">Installing...</span>`;
        btn.disabled = true;
        let templateID = btn.getAttribute("data-template");
        fetch(
          `${rtmkit_ajax.ajax_url}?action=download_template&template=${templateID}&nonce=${rtmkit_ajax.nonce}`,
          {
            method: "GET",
            headers: {},
          },
        )
          .then((res) => res.json())
          .then((response) => {
            if (!response.success) {
              window.reactToast.error(response.data.message, {
                position: "bottom-right",
                autoClose: 5000,
                className: "rtmkit-toast",
                theme: "dark",
              });
            } else {
              window.reactToast.success("Install Template Successfully", {
                position: "bottom-right",
                autoClose: 5000,
                className: "rtmkit-toast",
                theme: "dark",
              });
              renderTemplates("templatekits");
            }
          })
          .finally(() => {});
      });
    });
  }
}

function uploadTemplate() {
  const dropZone = document.querySelector(".drop-zone");
  if (!dropZone) return; // kalau elemennya tidak ada, hentikan

  const fileInput = dropZone.querySelector(".drop-zone__input");
  const prompt = dropZone.querySelector(".drop-zone__prompt");

  // Klik area dropZone => buka file dialog
  dropZone.addEventListener("click", () => fileInput.click());

  // Drag over
  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("drop-zone--over");
  });

  // Drag leave
  dropZone.addEventListener("dragleave", (e) => {
    e.preventDefault();
    dropZone.classList.remove("drop-zone--over");
  });

  // Drop file
  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("drop-zone--over");

    const files = e.dataTransfer.files;
    if (!files.length) return;

    const zipFiles = [...files].filter((f) =>
      f.name.toLowerCase().endsWith(".zip"),
    );
    if (!zipFiles.length) {
      prompt.innerHTML = `<span style="color:red">❌ Hanya file .zip yang diperbolehkan</span>`;
      return;
    }

    showLoading(prompt);
    zipFiles.forEach(uploadFile);
  });

  // Cegah loop klik
  fileInput.addEventListener("click", (e) => e.stopPropagation());

  // Saat file dipilih manual
  fileInput.addEventListener("change", (e) => {
    const files = e.target.files;
    const zipFiles = [...files].filter((f) =>
      f.name.toLowerCase().endsWith(".zip"),
    );

    if (!zipFiles.length) {
      prompt.innerHTML = `<span style="color:red">❌ Hanya file .zip yang diperbolehkan</span>`;
      return;
    }

    showLoading(prompt);
    zipFiles.forEach(uploadFile);
  });

  function showLoading(el) {
    el.innerHTML = `
      ${window.RTMLoader}<span>Uploading Template Kit...</span>`;
  }

  function uploadFile(file) {
    // Hapus semua event listener agar tidak trigger ulang
    dropZone.replaceWith(dropZone.cloneNode(true));

    const formData = new FormData();
    formData.append("action", "upload_template");
    formData.append("file", file);
    formData.append("nonce", rtmkit_ajax.nonce);

    fetch(rtmkit_ajax.ajax_url, {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          window.reactToast.success("Upload Template Has been successfully ", {
            position: "bottom-right",
            autoClose: 5000,
            className: "rtmkit-toast",
            theme: "dark",
          });
          renderTemplates("installed");
        } else {
          console.error("Upload gagal:", res);
          prompt.innerHTML = `<span style="color:red">❌ Upload gagal</span>`;
        }
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        prompt.innerHTML = `<span style="color:red">❌ Terjadi kesalahan saat upload</span>`;
      });
  }
}

function deleteTemplate() {
  const deleteBtns = document.querySelectorAll(".delete-template");
  if (deleteBtns.length) {
    deleteBtns.forEach((btn) => {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        let currentHTMLBtn = btn.innerHTML;
        btn.innerHTML = `<span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
        <span role="status">Deleting...</span>`;
        btn.disabled = true;
        let templateID = btn.getAttribute("data-template");
        fetch(
          `${rtmkit_ajax.ajax_url}?action=delete_template&template=${templateID}&nonce=${rtmkit_ajax.nonce}`,
          {
            method: "GET",
          },
        )
          .then((res) => res.json())
          .then((response) => {
            if (response.success) {
              window.reactToast.success("Delete Template Successfully", {
                position: "bottom-right",
                autoClose: 5000,
                className: "rtmkit-toast",
                theme: "dark",
              });
              renderTemplates("installed");
            } else {
              window.reactToast.error(response.data.message, {
                position: "bottom-right",
                autoClose: 5000,
                className: "rtmkit-toast",
                theme: "dark",
              });
            }
          });
      });
    });
  }
}

function viewTemplateDetails() {
  const detailBtns = document.querySelectorAll(".view-template");
  const btnAction = document.querySelector(".action-button-container");

  if (detailBtns.length) {
    detailBtns.forEach((btn) => {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        btnAction.style.display = "flex";
        let templateID = btn.getAttribute("data-template");
        let url = new URL(window.location);
        url.searchParams.set("template", "installed");
        url.searchParams.set("installed_template", templateID);
        window.history.pushState({ installed_template: templateID }, "", url);
        renderTemplates("installed");
      });
    });
  }
}

function importTemplates() {
  const importBtns = document.querySelectorAll(".import-template");
  const importAllBtn = document.querySelector("#import-all-template");
  const importModalEl = document.getElementById("import-single");
  const importAllModalEl = document.getElementById("import-all");
  if (!importModalEl) return;
  if (!importAllModalEl) return;

  const importModal = new bootstrap.Modal(importModalEl, {
    keyboard: false,
    backdrop: "static",
  });

  const importAllModal = new bootstrap.Modal(importAllModalEl, {
    keyboard: false,
    backdrop: "static",
  });

  if (importBtns.length) {
    importBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const template = btn.getAttribute("data-template");
        const templateName = btn.getAttribute("data-template-name");
        const path = btn.getAttribute("data-path");
        const imageUrl = btn.getAttribute("data-image-url");

        importModalEl.querySelector("#template-screenshot").src = imageUrl;
        const importBtn = importModalEl.querySelector("#start-import");
        const message = importModalEl.querySelector("#message");
        importBtn.setAttribute("data-template", template);
        importBtn.setAttribute("data-template-name", templateName);
        importBtn.setAttribute("data-path", path);

        importModal.show();
        importBtn.addEventListener("click", (e) => {
          message.style.setProperty("visibility", "visible");
          $importResult = importTemplate(e);
          $importResult.then((res) => {
            if (res) {
              importModal.hide();
              window.reactToast.success("Import Template Successfully", {
                position: "bottom-right",
                autoClose: 5000,
                className: "rtmkit-toast",
                theme: "dark",
              });
              renderTemplates("installed");
            }
          });
        });
      });
    });
  }

  if (importAllBtn) {
    importAllBtn.onclick = (e) => {
      e.preventDefault();
      importAllModal.show();
      const importAllStartBtn =
        importAllModalEl.querySelector("#start-import-all");
      const importType = importAllModalEl.querySelector("#import-type").value;
      const importAsPage =
        importAllModalEl.querySelector("#import-as-page")?.checked ?? false;
      const importWithoutImages = importAllModalEl.querySelector(
        "#import-without-images",
      ).checked;
      importAllStartBtn.onclick = async (e) => {
        e.preventDefault();
        const message = importAllModalEl.querySelector("#message");

        message.style.setProperty("visibility", "visible");

        const thisBtn = e.currentTarget;

        const closeBtn = e.currentTarget
          .closest(".modal")
          .querySelector('[data-bs-dismiss="modal"]');
        closeBtn.disabled = true;

        const importType = importAllModalEl.querySelector("#import-type").value;
        const importAsPage =
          importAllModalEl.querySelector("#import-as-page")?.checked ?? false;
        const importWithoutImages = importAllModalEl.querySelector(
          "#import-without-images",
        ).checked;

        const allTemplates = Array.from(
          document.querySelectorAll("[data-template][data-path]"),
        );

        let filteredTemplates = [];
        switch (importType) {
          case "all":
            filteredTemplates = allTemplates;
            break;

          case "content":
            // buang global style
            filteredTemplates = allTemplates.filter(
              (el) => el.dataset.templateType !== "global",
            );
            break;

          case "global-only":
            // hanya global style
            filteredTemplates = allTemplates.filter(
              (el) => el.dataset.templateType === "global",
            );
            break;

          default:
            console.warn("Import type tidak dikenal");
            return;
        }

        let total = filteredTemplates.length;
        let index = 0;

        for (const el of filteredTemplates) {
          index++;

          const template = el.dataset.template;
          const path = el.dataset.path;
          const templateName = el.dataset.templateName;
          const steps = ["init", "validate", "import", "metadata", "finish"];

          let progress = Math.round((index / total) * 100);

          thisBtn.classList.add("importing");
          thisBtn.style.setProperty("--progress", `${progress}%`);
          thisBtn.innerHTML = `
    <span class="spinner-border spinner-border-sm"></span>
    <span>${index} / ${total} Importing</span>
  `;

          let jsonData = null;
          let templateId = null;

          for (const step of steps) {
            const formData = new FormData();
            formData.append("action", "import_template");
            formData.append("step", step);
            formData.append("template", template);
            formData.append("template_name", templateName);
            formData.append("path", path);
            formData.append("import_as_page", importAsPage ? "1" : "0");
            formData.append(
              "import_without_images",
              importWithoutImages ? "1" : "0",
            );
            formData.append("nonce", rtmkit_ajax.nonce);

            if (jsonData) formData.append("json_data", jsonData);
            if (templateId) formData.append("template_id", templateId);

            // console.log(`🚀 Running step: ${step}`);
            const controller = new AbortController();
            setTimeout(() => controller.abort(), 30000);
            const res = await fetch(rtmkit_ajax.ajax_url, {
              method: "POST",
              body: formData,
              signal: controller.signal,
            });

            const data = await res.json();

            if (!data.success) {
              throw new Error(`❌ Error at ${step}: ${data.data}`);
            }

            if (data.data.json_data) jsonData = data.data.json_data;
            if (data.data.template_id) templateId = data.data.template_id;

            // console.log(`✅ Step ${step} done`);

            if (data.data.done) break;

            await new Promise((r) => setTimeout(r, 1500));
          }
        }

        // console.log("🎉 All templates imported successfully");

        closeBtn.disabled = false;
        message.style.setProperty("visibility", "hidden");
        importAllModal.hide();
        window.reactToast.success("Import All Template Successfully", {
          position: "bottom-right",
          autoClose: 5000,
          className: "rtmkit-toast",
          theme: "dark",
        });
        renderTemplates("installed");
      };
    };
  }
}

async function importTemplate(e) {
  e.preventDefault();

  const thisBtn = e.currentTarget;
  const template = thisBtn.getAttribute("data-template");
  const templateName = thisBtn.getAttribute("data-template-name");
  const path = thisBtn.getAttribute("data-path");

  const importAsPage =
    document.getElementById("import-as-page")?.checked ?? false;
  const importWithoutImages = document.getElementById(
    "import-without-images",
  ).checked;

  console.log({ importAsPage, importWithoutImages });

  const closeBtn = e.currentTarget
    .closest(".modal")
    .querySelector('[data-bs-dismiss="modal"]');
  closeBtn.disabled = true;

  thisBtn.classList.add("importing");

  thisBtn.style.setProperty("--progress", `0%`);

  thisBtn.innerHTML = `<span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
        <span role="status">0% Importing</span>`;

  const steps = ["init", "validate", "import", "metadata", "finish"];
  let jsonData = null;
  let templateId = null;

  for (const step of steps) {
    const formData = new FormData();
    formData.append("action", "import_template");
    formData.append("step", step);
    formData.append("template", template);
    formData.append("template_name", templateName);
    formData.append("path", path);
    formData.append("import_as_page", importAsPage ? "1" : "0");
    formData.append("import_without_images", importWithoutImages ? "1" : "0");
    formData.append("nonce", rtmkit_ajax.nonce);
    console.log({ jsonData, templateId });
    if (jsonData) formData.append("json_data", jsonData);
    if (templateId) formData.append("template_id", templateId);

    console.log(`🚀 Running step: ${step}`);

    const res = await fetch(rtmkit_ajax.ajax_url, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    thisBtn.innerHTML = `<span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
        <span role="status">${data.data.progress}% Importing</span>`;
    // thisBtn.style.setProperty("--progress", `0%`);
    thisBtn.style.setProperty("--progress", `${data.data.progress}%`);

    // Jika gagal, hentikan proses
    if (!data.success) {
      alert(`❌ Error at ${step}: ${data.data}`);
      window.reactToast.error(`Error at ${step}: ${data.data}`, {
        position: "bottom-right",
        autoClose: 5000,
        className: "rtmkit-toast",
        theme: "dark",
      });
      console.error(data);
      return false;
    }

    // Update data antar-step
    if (data.data.json_data) jsonData = data.data.json_data;
    if (data.data.template_id) templateId = data.data.template_id;

    // Tampilkan progress log di console atau progress bar UI
    console.log(`✅ Step ${step} done:`, data.data.message ?? "");

    if (data.data.done) {
      console.log("🎉 Import completed successfully!");
      thisBtn.innerHTML = `Import Completed`;
      thisBtn.style.setProperty("--progress", `100%`);
      return true;
      // break;
    }

    // jeda antar step biar lebih aman di server (optional)
    await new Promise((r) => setTimeout(r, 300));
  }
}

function deleteInstalledTemplate() {
  const deleteBtn = document.querySelectorAll(".delete-installed-template");
  const deleteAllBtn = document.getElementById("delete-all-installed-template");

  if (deleteBtn.length) {
    deleteBtn.forEach((btn) => {
      btn.onclick = (e) => {
        e.preventDefault();
        thisBtn = e.currentTarget;
        const templateName = thisBtn.dataset.templateName;

        if (
          confirm(
            `Are you sure you want to permanently delete the ${templateName} Template ?`,
          )
        ) {
          thisBtn.innerHTML = `<span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
        <span role="status">Deleting...</span>`;

          thisBtn.disabled = true;

          const templateID = thisBtn.dataset.itemTemplate;
          const template = thisBtn.dataset.template;
          fetch(rtmkit_ajax.ajax_url, {
            method: "POST",
            body: new URLSearchParams({
              action: "delete_installed_template",
              template_id: templateID,
              template: template,
              nonce: rtmkit_ajax.nonce,
            }),
          })
            .then((res) => res.json())
            .then((res) => {
              if (res.success) {
                thisBtn.innerHTML = `<i class="far fa-trash-can"></i> Delete`;
                thisBtn.disabled = false;
                window.reactToast.success("Delete Template Successfully", {
                  position: "bottom-right",
                  autoClose: 5000,
                  className: "rtmkit-toast",
                  theme: "dark",
                });
                renderTemplates("installed");
              }
            });
        }
      };
    });
  }

  if (deleteAllBtn) {
    deleteAllBtn.onclick = async (e) => {
      e.preventDefault();
      const thisBtn = e.currentTarget;

      let currentHTMLBtn = thisBtn.innerHTML;
      if (
        confirm(
          "Are you sure you want to permanently delete all the template ?",
        )
      ) {
        const toDelete = document.querySelectorAll(
          ".delete-installed-template",
        );

        if (toDelete.length) {
          const total = toDelete.length;
          let index = 0;
          thisBtn.disabled = true;

          for (const el of toDelete) {
            const template = el.dataset.template;
            const templateID = el.dataset.itemTemplate;

            await fetch(rtmkit_ajax.ajax_url, {
              method: "POST",
              body: new URLSearchParams({
                action: "delete_installed_template",
                template_id: templateID,
                template: template,
                nonce: rtmkit_ajax.nonce,
              }),
            });

            index++;
            const progress = Math.round((index / total) * 100);
            thisBtn.classList.add("loading");
            thisBtn.style.setProperty("--progress", `${progress}%`);
            thisBtn.innerHTML = `
      <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
      <span role="status">${index} / ${total} Deleting...</span>
    `;
          }

          thisBtn.innerHTML = currentHTMLBtn;
          thisBtn.disabled = false;
          thisBtn.classList.remove("loading");
          window.reactToast.success(
            "Delete All Installed Template Successfully",
            {
              position: "bottom-right",
              autoClose: 5000,
              className: "rtmkit-toast",
              theme: "dark",
            },
          );
          renderTemplates("installed");
        } else {
          window.reactToast.error(
            "There are no installed templates to delete.",
            {
              position: "bottom-right",
              autoClose: 5000,
              className: "rtmkit-toast",
              theme: "dark",
            },
          );
        }
      }
    };
  }
}

function paginationTemplates() {
  const paginationLinks = document.querySelectorAll(".pagination .page-link");
  if (paginationLinks.length) {
    paginationLinks.forEach((link) => {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        let paged = link.getAttribute("data-paged");
        const url = new URL(window.location);
        url.searchParams.set("paged", paged);
        window.history.pushState({ paged: paged }, "", url);
        const urlParams = new URLSearchParams(window.location.search);
        let template = urlParams.get("template") ?? "all";
        renderTemplates(template);
      });
    });
  }
}

function themeforestStats() {
  const btnClickInstallStats = document.querySelectorAll(".btn-install-click");
  const btnClickPreviewStats = document.querySelectorAll(".btn-preview-click");
  if (btnClickInstallStats) {
    btnClickInstallStats.forEach((btn) => {
      btn.addEventListener("click", function (e) {
        const themeforestID = btn.getAttribute("data-template-id");
        const name = btn.getAttribute("data-template-name");
        const url = btn.getAttribute("href");
        fetch(rtmkit_ajax.ajax_url, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            action: "send_themeforest_stats",
            nonce: rtmkit_ajax.nonce,
            themeforest_id: themeforestID,
            name: name,
            url: url,
            click: "install",
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            console.log(data);
          });
      });
    });
  }
  if (btnClickPreviewStats) {
    btnClickPreviewStats.forEach((btn) => {
      btn.addEventListener("click", function (e) {
        const themeforestID = btn.getAttribute("data-template-id");
        const name = btn.getAttribute("data-template-name");
        const url = btn.getAttribute("href");
        fetch(rtmkit_ajax.ajax_url, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            action: "send_themeforest_stats",
            nonce: rtmkit_ajax.nonce,
            themeforest_id: themeforestID,
            name: name,
            url: url,
            click: "preview",
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            console.log(data);
          });
      });
    });
  }
}

function installRequiredPlugin() {
  const installBtns = document.querySelectorAll(".btn-install-requirements");

  if (!installBtns.length) return;

  installBtns.forEach((btn) => {
    btn.addEventListener("click", function handler(e) {
      e.preventDefault();

      let missingPlugins = btn.getAttribute("data-missing");

      try {
        missingPlugins = JSON.parse(missingPlugins);
      } catch {
        alert("Invalid plugin data.");
        return;
      }

      if (!Array.isArray(missingPlugins) || missingPlugins.length === 0) {
        alert("No plugins to install.");
        return;
      }

      btn.disabled = true;

      const total = missingPlugins.length;

      function installPlugin(index) {
        if (index >= total) {
          window.reactToast.success("All Required plugins installed successfully.", {
            position: "bottom-right",
            autoClose: 5000,
            className: "rtmkit-toast",
            theme: "dark",
          });

          btn.closest('.alert').remove();
          return;
        }

        btn.innerHTML = `<span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
        <span role="status">Installing...</span>`;

        const formData = new FormData();
        formData.append("action", "install_requirements");
        formData.append("plugin", missingPlugins[index].file);
        formData.append("nonce", rtmkit_ajax.nonce);

        fetch(rtmkit_ajax.ajax_url, {
          method: "POST",
          body: formData,
          credentials: "same-origin",
        })
          .then(() => {
            installPlugin(index + 1);
          })
          .catch(() => {
            installPlugin(index + 1);
          });
      }

      installPlugin(0);
    });
  });
}

function settings() {
  save_global_settings();
}

function save_global_settings() {
  const saveGlobalSiteBtn = document.getElementById("save-global-site");
  if (saveGlobalSiteBtn) {
    saveGlobalSiteBtn.addEventListener("click", function (e) {
      e.preventDefault();
      const thisBtn = this;
      thisBtn.disabled = true;
      thisBtn.querySelector("span").innerText = " Saving...";
      thisBtn.classList.add("loading");
      const idKit = document.getElementById("global-kit-style").value;
      fetch(rtmkit_ajax.ajax_url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          action: "set_global_site",
          nonce: rtmkit_ajax.nonce,
          idKit: idKit,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            window.reactToast.success(data.data, {
              position: "bottom-right",
              autoClose: 5000,
              className: "rtmkit-toast",
              theme: "dark",
            });
          } else {
            window.reactToast.error(data.data, {
              position: "bottom-right",
              autoClose: 5000,
              className: "rtmkit-toast",
              theme: "dark",
            });
          }
          thisBtn.disabled = false;
          thisBtn.querySelector("span").innerText = " Save Changes";
          thisBtn.classList.remove("loading");
        });
    });
  }
}

function submission() {
  renderSubmission();
  // installRTMForm();
}

function renderSubmission() {
  const urlSearchParams = new URLSearchParams(window.location.search);
  urlSearchParams.set("action", "get_submission_content");
  urlSearchParams.set("nonce", rtmkit_ajax.nonce);

  const submissionContainer = document.getElementById("submission");
  const loading = `<div class="d-flex justify-content-center align-items-center" style="min-height:20rem">${window.RTMLoader}</>`;

  if (submissionContainer) {
    submissionContainer.innerHTML = loading;

    fetch(rtmkit_ajax.ajax_url, {
      method: "POST",
      body: urlSearchParams,
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          submissionContainer.innerHTML = res.data;
          entriesDetail();
          installRTMForm();
        }
      });
  }
}

function installRTMForm() {
  // console.log("Setting up RTMForm installation...");
  const installBtn = document.getElementById("install-rtmform");
  if (installBtn) {
    installBtn.onclick = (e) => {
      // e.preventDefault();
      const thisBtn = e.currentTarget;
      let action = thisBtn.dataset.action;
      thisBtn.classList.add("loading");
      thisBtn.innerHTML = `<span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
        <span role="status">${action}...</span>`;
      thisBtn.disabled = true;
// console.log("Installing RTMForm...");
    };
  }
}

function entriesDetail() {
  const url = new URL(window.location);

  if (url.searchParams.has("entries_id")) {
    const backBtn = document.getElementById("back-to-submission");

    if (backBtn) {
      backBtn.onclick = (e) => {
        e.preventDefault();
        url.searchParams.delete("entries_id");
        window.history.pushState({}, "", url);
        renderSubmission();
      };
    }
  } else {
    const detailBtns = document.querySelectorAll("[data-entries-detail]");

    const statusBtn = document.querySelectorAll("[data-status]");

    if (detailBtns.length) {
      detailBtns.forEach((btn) => {
        btn.onclick = (e) => {
          e.preventDefault();
          let entriID = e.currentTarget.dataset.entriesDetail;

          if (url.searchParams.has("rform_id")) {
            url.searchParams.delete("rform_id");
          }
          url.searchParams.set("entries_id", entriID);

          window.history.pushState({}, "", url);

          renderSubmission();
        };
      });
    }

    if (statusBtn.length) {
      statusBtn.forEach((btn) => {
        btn.onclick = (e) => {
          e.preventDefault();
          let status = e.currentTarget.dataset.status;
          if (status !== url.searchParams.get("status")) {
            url.searchParams.set("status", status);
            window.history.pushState({}, "", url);
            renderSubmission();
          }
        };
      });
    }
  }
}

function updates() {
  render_update_content();
}

function render_update_content() {
  const updateContainer = document.getElementById("update-content");

  if (updateContainer) {
    const loading = `<div class="d-flex justify-content-center align-items-center" style="min-height:20rem">${window.RTMLoader}</>`;

    updateContainer.innerHTML = loading;

    fetch(rtmkit_ajax.ajax_url, {
      method: "POST",
      body: new URLSearchParams({
        action: "get_update_content",
        nonce: rtmkit_ajax.nonce,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          updateContainer.innerHTML = res.data;
          update_plugin();
          reinstall_plugin();
        }
      });
  }
}

function update_plugin() {
  const updateBtns = document.querySelectorAll(".btn-update-plugin");
  console.log(updateBtns.length);
  if (updateBtns.length) {
    updateBtns.forEach((btn) => {
      btn.onclick = (e) => {
        e.preventDefault();
        const thisBtn = e.currentTarget;
        const plugin = thisBtn.dataset.plugin;
        const pluginName = thisBtn.dataset.pluginName;
        const pluginVersion = thisBtn.dataset.pluginVersion;
        if (
          confirm(
            `Do you want to proceed with updating the ${pluginName} to version ${pluginVersion} ?`,
          )
        ) {
          thisBtn.classList.add("loading");
          thisBtn.querySelector("span").innerHTML = "Updating...";
          thisBtn.disabled = true;

          fetch(rtmkit_ajax.ajax_url, {
            method: "POST",
            body: new URLSearchParams({
              action: "update_plugin",
              plugin: plugin,
              nonce: rtmkit_ajax.nonce,
            }),
          })
            .then((res) => res.json())
            .then((res) => {
              if (res.success) {
                window.location.reload();
              }
            });
        }
      };
    });
  }
}

function reinstall_plugin() {
  const reinstallBtns = document.querySelectorAll(".btn-reinstall-plugin");

  if (reinstallBtns.length) {
    reinstallBtns.forEach((btn) => {
      btn.onclick = (e) => {
        e.preventDefault();
        const thisBtn = e.currentTarget;
        const container = thisBtn.closest("[data-rollback-plugin]");
        const plugin = container.dataset.rollbackPlugin;
        const pluginName = container.dataset.pluginName;
        let version = container.querySelector("select[name=versions]").value;

        if (
          confirm(
            `Do You Want to procced with reinstall the ${pluginName} to version ${version} ?`,
          )
        ) {
          thisBtn.classList.add("loading");
          thisBtn.querySelector("span").innerHTML = "ReInstalling...";
          thisBtn.disabled = true;
          fetch(rtmkit_ajax.ajax_url, {
            method: "POST",
            body: new URLSearchParams({
              action: "rollback_plugin",
              plugin: plugin,
              version: version,
              nonce: rtmkit_ajax.nonce,
            }),
          })
            .then((res) => res.json())
            .then((res) => {
              if (res.success) {
                window.location.reload();
              }
            });
        }
      };
    });
  }
}
