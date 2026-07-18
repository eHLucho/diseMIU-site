jQuery(window).on("elementor/frontend/init", function () {
    elementorFrontend.hooks.addAction(
      "frontend/element_ready/rkit_image_accordion.default",
      function ($scope, $) {
        const accl = $scope.find(".item-ia-click");
        const wrapper = $scope.find(".gallery-wrap");
        const animate = wrapper.data('animate')
  
        accl.on("click", function () {
          accl
            .removeClass("active")
            .find(".text-title-ia")
            .removeClass(animate);
          accl
            .removeClass("active")
            .find(".text-description")
            .removeClass(animate)
          accl
            .removeClass("active")
            .find(".rkit-image-accordion-item-button")
            .removeClass(animate);
  
          // Set yang diklik
          $(this).addClass("active");
          $(this).find(".text-title-ia").addClass(animate);
          $(this).find(".text-description").addClass(animate);
          $(this)
            .find(".rkit-image-accordion-item-button")
            .addClass("");
        });
  
        const acc = $scope.find(".item-ia-hover");
        const dfa = $scope.find(".item-ia-hover.active");
  
        acc.on("mouseenter", function () {
          $(this).addClass("active");
          $scope.find(".item-ia-hover").not($(this)).removeClass("active");
          // Tambahkan animasi ke child
          $(this).find(".text-title-ia").addClass(animate);
          $(this).find(".text-description").addClass(animate);
          $(this).find(".rkit-image-accordion-item-button").addClass(animate);
        });
        acc.on("mouseleave", function () {
          $(this).removeClass("active");
          $(this).find(".text-title-ia").removeClass(animate);
          $(this).find(".text-description").removeClass(animate);
          $(this).find(".rkit-image-accordion-item-button").removeClass(animate);
  
          dfa.addClass("active");
        });
  
        // ===========
      }
    );
  });
  