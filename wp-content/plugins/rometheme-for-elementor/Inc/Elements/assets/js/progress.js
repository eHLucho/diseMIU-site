jQuery(window).on("elementor/frontend/init", function () {
  elementorFrontend.hooks.addAction(
    "frontend/element_ready/rkit-progress-bar.default",
    function ($scope, $) {
      const container = $scope.find(".rkit-progress")[0];
      if (!container) return;

      const resizeobserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const height = entry.contentRect.height;
          $scope.css("height", height + "px");
        //   console.log("Height synced:", height);
        }
      });

      resizeobserver.observe(container);    
      const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            $(entry.target).addClass("rkit-progress-animation");
            observer.unobserve(entry.target);
          }
        });
      });

      $scope.find(".circular-progress").each(function () {
        observer.observe(this);
      });
      $scope.find(".progress-value").each(function () {
        observer.observe(this);
      });
      $scope.find(".progress-bar").each(function () {
        observer.observe(this);
      });
      $scope.find(".half-circular-progress").each(function () {
        observer.observe(this);
      });
    },
  );
});
