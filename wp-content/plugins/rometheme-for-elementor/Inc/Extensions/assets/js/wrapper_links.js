jQuery(window).on("elementor/frontend/init", function () {
  elementorFrontend.hooks.addAction(
    "frontend/element_ready/global",
    function ($scope, $) {
      //   console.log("Wrapper Link Initialized");
      $scope.find("div.rtmkit-wrapper-link").on("click", function (e) {
        e.preventDefault();
        const url = $(this).data("url");
        const target = $(this).data("target") || "_self";
        const rel = $(this).data("rel") || "";
        window.open(url, target, rel);
      });

      $scope.filter(".rtmkit-wrapper-link").on("click", function (e) {
        e.preventDefault();
        const url = $(this).data("url");
        const target = $(this).data("target") || "_self";
        const rel = $(this).data("rel") || "";
        window.open(url, target, rel);
      });
    },
  );
});
