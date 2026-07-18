jQuery(window).on('elementor/frontend/init', function () {
    elementorFrontend.hooks.addAction('frontend/element_ready/rkit_image_gallery.default', function ($scope, $) {

        // Temukan semua gambar dengan kelas 'gallery_image'
        const galleryImages = $scope.find('.gallery_image');

        galleryImages.each(function () {
            var img = jQuery(this);

            // Jika gambar sudah dimuat, langsung sembunyikan skeleton
            if (img[0].complete) {
                const skeleton = img.closest('.brick').find('.skeleton');
                if (skeleton.length) {
                    skeleton.hide();
                }
                img.css('opacity', '1');
            } else {
                img.on('load', function () {
                    const skeleton = img.closest('.brick').find('.skeleton');
                    if (skeleton.length) {
                        skeleton.hide();
                    }
                    img.css('opacity', '1');
                });
            }
        });

        $scope.find('a[data-elementor-open-lightbox="yes"]').each(function () {
            jQuery(this).on('click', function () {
                setTimeout(function () {
                    jQuery('.elementor-lightbox img.elementor-lightbox-image[data-src]').each(function () {
                        const $img = jQuery(this);
                        $img.attr('src', $img.attr('data-src')).removeAttr('data-src');
                        $img.removeClass('swiper-lazy');

                        const preloader = $img.closest('.swiper-zoom-container').find('.swiper-lazy-preloader');
                        if (preloader.length) preloader.remove();
                    });
                }, 100);
            });
        });

    });
});
