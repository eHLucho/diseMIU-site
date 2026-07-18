jQuery(window).on("elementor/frontend/init", function () {
  elementorFrontend.hooks.addAction(
    "frontend/element_ready/rkit-tabs.default",
    function ($scope, $) {
      var container = $scope.find(".rkit-tab-container");
      var tabBtn = container.find(".rkit-tab-btn-item");
      var tabContent = container.find(".rkit-tab-content");

      tabBtn.click(function () {
        var tabContentId = $(this).data("tab");
        tabBtn.removeClass("active");
        tabContent.removeClass("active");
        var tabContentTarget = container.find("#" + tabContentId);
        tabContentTarget.addClass("active");
        $(this).addClass("active");
      });

      //   jQuery(".edit-template-btn").on("click", function (e) {
      //     e.preventDefault();

      //     const modal = parent.jQuery("#saved-template-editor-modal");
      //     if (!modal.length) {
      //       console.warn("Modal not found in parent.");
      //       return;
      //     }

      //     const targetUrl =
      //       jQuery(this).attr("href") || jQuery(this).data("href");
      //     if (!targetUrl) {
      //       console.warn("No URL found on edit button.");
      //       return;
      //     }

      //     modal.fadeIn();

      //     const iframe = modal.find(".ifr-editor");
      //     iframe.attr("src", targetUrl);

      //     iframe[0].addEventListener("load", () => {
      //       console.log("Iframe content has loaded!");
      //       iframe
      //         .contents()
      //         .find("#elementor-editor-wrapper-v2")
      //         .css("display", "none");
      //       iframe
      //         .contents()
      //         .find("#elementor-editor-wrapper")
      //         .css("height", "100vh");
      //     });
      //   });

      jQuery(document).on("click", ".tabs-edit-template-btn", function (e) {
        e.preventDefault();

        const targetUrl =
          jQuery(this).attr("href") || jQuery(this).data("href");
        if (!targetUrl) return console.warn("No target URL found.");

        window.parent.postMessage(
          {
            action: "open-saved-template-editor",
            url: targetUrl,
          },
          "*"
        );
      });
    }
  );
});
