jQuery(window).on("elementor/frontend/init", function () {
  elementorFrontend.hooks.addAction(
    "frontend/element_ready/rkit-counter.default",
    function ($scope, $) {
      const counterContainer = $scope.find(".rkit-counter");
      const counter = counterContainer.find(".odometer");
      let config = counter.data("config");
      let counterEl = counter[0];
      let opt = {
        root: null,
        rootMargin: "0px",
        threshold: 0.75,
      };

      let odo = new Odometer({
        el: counterEl,
        value: config.start_number,
        format: config.format,
        duration: config.duration,
        theme: "minimal",
      });

      const callback = (entries, observer) => {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            odo.update(config.end_number);
            observer.unobserve(entry.target);
          }
        });
      };
      let observ = new IntersectionObserver(callback, opt);
      observ.observe(counterEl);
    }
  );
});
