jQuery(window).on("elementor:init", () => {
  const e = window.elementor;

  e.on("preview:loaded", () => {
    const check = setInterval(() => {
      const $doc = e.$previewContents;

      if (!$doc || !$doc.length) return;

      $doc.on("click", ".rtmkit-edit-template-btn", function (e) {
        const targetUrl =
          jQuery(this).attr("href") || jQuery(this).data("href");
        if (!targetUrl) return console.warn("No target URL found.");

        window.parent.postMessage(
          {
            action: "open-saved-template-editor",
            url: targetUrl,
          },
          "*",
        );
      });

      clearInterval(check);
    }, 200);
  });
});

jQuery(document).on("click", "#saved-template-save-editor-btn", function () {
  jQuery(this).html("SAVING...");
  jQuery(this).attr("disabled", true);
  const $this = jQuery(this);
  const modal = jQuery("#saved-template-editor-modal");
  const iframe = window.parent.document.querySelector(".ifr-editor");
  const elementorEditor = iframe.contentWindow.elementor;

  const panel = elementor.getPanelView();
  const currentSelectedWidget = panel
    .getCurrentPageView()
    .getOption("editedElementView");

  try {
    elementorEditor.saver.saveEditor({
      status: elementorEditor.settings.page.model.get("post_status"),
      onSuccess: function () {
        modal.hide();
        currentSelectedWidget.renderOnChange();
        iframe.src = "";
        $this.html("SAVE & CLOSE");
        $this.removeAttr("disabled");
      },
      onError: function () {
        alert("Error saving template");
      },
    });
  } catch (err) {
    console.log(err);
  }
});

window.addEventListener("message", function (event) {
  const data = event.data || {};

  if (data.action === "open-saved-template-editor" && data.url) {
    const modal = jQuery("#saved-template-editor-modal");
    if (!modal.length) {
      console.warn("Modal not found in parent.");
      return;
    }

    modal.fadeIn();

    const iframe = modal.find(".ifr-editor");
    iframe.attr("src", data.url);

    iframe.off("load").on("load", function () {
      const iframeDoc = iframe.contents();
      // iframeDoc.find("#elementor-editor-wrapper-v2").hide();
      iframeDoc.find("#elementor-editor-wrapper").css("height", "100vh");
    });
  }
});
