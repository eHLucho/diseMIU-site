jQuery(window).on("elementor/frontend/init", function () {
  const elementor = window.elementor;
  elementorFrontend.hooks.addAction(
    "frontend/element_ready/rkit-accordion.default",
    function ($scope, $) {
      const DURATION = 100;
      const EASING = "swing";

      const $items = $scope.find(".rkit-accordion-item");

      $items.each(function () {
        const $item = jQuery(this);
        let $content = $item.find(".rkit-accordion-content");

        if ($content.children(".rkit-accordion-content-inner").length === 0) {
          $content.wrapInner(
            '<div class="rkit-accordion-content-inner"></div>',
          );
        }

        $content.css({
          overflow: "hidden",
        });

        const $inner = $content.find(".rkit-accordion-content-inner");

        if ($item.hasClass("open")) {
          $content.css("height", $inner[0].scrollHeight + "px");
          window.setTimeout(function () {
            $content.css("height", "auto");
          }, 20);
        } else {
          $content.css("height", "0px");
        }
      });

      $scope.find(".rkit-accordion-header").on("click", function (e) {
        e.preventDefault();
        const $header = jQuery(this);
        const $item = $header.closest(".rkit-accordion-item");
        const $content = $item.find(".rkit-accordion-content");
        const $inner = $content.find(".rkit-accordion-content-inner");

        const $openItem = $items.filter(".open").not($item);
        const $openContent = $openItem.find(".rkit-accordion-content");
        const $openInner = $openContent.find(".rkit-accordion-content-inner");

        const targetOpenHeight = $openInner.length
          ? $openInner[0].scrollHeight
          : 0;
        const targetThisHeight = $inner.length ? $inner[0].scrollHeight : 0;

        $openContent.stop(true, true);
        $content.stop(true, true);

        if ($item.hasClass("open")) {
          $content.css("height", $content.height() + "px");
          $content[0].offsetHeight;
          $content.animate({ height: 0 }, DURATION, EASING, function () {
            $item.removeClass("open");
            $content.css("height", "0px");
          });
        } else {
          $content.css("height", $content.height() + "px");
          $content[0].offsetHeight;

          if ($openItem.length) {
            $openContent.css("height", $openContent.height() + "px");
            $openContent[0].offsetHeight;
          }

          if ($openItem.length) {
            $openContent.animate({ height: 0 }, DURATION, EASING, function () {
              $openItem.removeClass("open");
              $openContent.css("height", "0px");
            });
          }

          $content.animate(
            { height: targetThisHeight },
            DURATION,
            EASING,
            function () {
              $item.addClass("open");
              $content.css("height", "auto");
            },
          );
        }
      });

      jQuery(document).on(
        "click",
        ".accordion-edit-template-btn",
        function (e) {
          e.preventDefault();

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
        },
      );
    },
  );

  elementorFrontend.hooks.addAction(
    "panel/open_editor/widget",
    function (panel, model, view) {
      const settings = model.get("settings");
      const showHeading = settings.get("show_subheading");
      hideRepeaterField(showHeading);

      const showIconHeading = settings.get("show_heading_icons");
      hideRepeaterIconField(showIconHeading);
    },
  );

  if (!window.elementor || !elementor.channels || !elementor.channels.editor) {
    // console.warn("Elementor editor not ready");
    return;
  }

  elementor.channels.editor.on("change", function (panel, model) {
    const currentWidget = elementor
      .getPanelView()
      .getCurrentPageView()
      .getOption("editedElementView");
    if (
      !currentWidget ||
      currentWidget.model.get("widgetType") !== "rkit-accordion"
    )
      return;

    const showHeading = currentWidget.model
      .get("settings")
      .get("show_subheading");
    hideRepeaterField(showHeading);

    const showIconHeading = currentWidget.model
      .get("settings")
      .get("show_heading_icons");
    hideRepeaterIconField(showIconHeading);
  });

  function hideRepeaterField(showHeading) {
    const repeaterFields = parent.jQuery(
      ".elementor-control-accordion_sub_title",
    );

    if (showHeading === "yes") {
      repeaterFields.show();
    } else {
      repeaterFields.hide();
    }
  }

  function hideRepeaterIconField(showIconHeading) {
    const repeaterFields = parent.jQuery(
      ".elementor-control-accordion_header_icon",
    );

    if (showIconHeading === "yes") {
      repeaterFields.show();
    } else {
      repeaterFields.hide();
    }
  }
});
