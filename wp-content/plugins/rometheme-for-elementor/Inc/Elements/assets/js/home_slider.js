jQuery(window).on('elementor/frontend/init', function () {
  elementorFrontend.hooks.addAction('frontend/element_ready/rkit-home-slider.default', function ($scope, $) {

    const slider = $scope.find('.rkit-homeslider-slider');
    var config = slider.data('config');

    var conf = {
      rtl: config.rtl,
      arrows: config.arrows,
      dots: config.dots,
      autoplay: (config.autoplay) ? {
        delay: 3000,
        disableOnInteraction: false,
        pauseOnMouseEnter: config.pauseOnHover
      } : false,
      loop: config.loop,
      speed: config.speed,
      slidesPerView: config.slidesPerView,
      slidesPerGroup: config.slidesPerGroup,
      breakpoints: config.breakpoints,
      grabCursor: true,
      initialSlide: (config.initial_slide == null) ? 0 : config.initial_slide,
    }

    if (config.slideStyle === 'fade') {
      conf.effect = 'fade';
      conf.cardsEffect = {
        crossFade: true,
      };
    }

    var pagination = {
      pagination: {
        enabled: config.dots,
        el: '.rkit-homeslider-pagination',
        type: 'bullets',
        clickable: true,
        bulletClass: 'rkit-homeslider-bullet',
        bulletActiveClass: 'rkit-homeslider-bullet-active',
        clickableClass: 'rkit-homeslider-bullet-clickable'
        // dynamicBullets : true
      }
    }

    var navigation = {
      navigation: {
        enabled: config.arrows,
        nextEl: '.rkit-swiper-hs-button-next',
        prevEl: '.rkit-swiper-hs-button-prev',
      }
    }

    var dataConfig = { ...conf, ...pagination, ...navigation }

    let container = $scope.find('.rkit-swiper-hs');
    const swiper = new Swiper(container[0], dataConfig);

    // 🔥 Helper function untuk animasi split text
    function splitTextToSpans(el, delayStep = 0.2) {
      if (!el) return;
      // Kalau sudah ada span, jangan di-split ulang
      if (el.querySelector('span')) return;

      const rawText = el.textContent.trim();
      el.textContent = '';

      const words = rawText.split(/\s+/).filter(Boolean);

      words.forEach((word, index) => {
        const span = document.createElement('span');
        span.textContent = word;
        span.style.animationDelay = `${(delayStep * (index + 1)).toFixed(2)}s`;
        el.appendChild(span);
        el.appendChild(document.createTextNode(' '));
      });
    }

    swiper.on('slideChangeTransitionStart', function () {
      $('.image-cover-hsl').removeClass('animate-zoom-out');
      $('.swiper-slide-active .image-cover-hsl').addClass('animate-zoom-out');

      // Subtitle
      const subTitle = document.querySelector('.swiper-slide-active .hs-subtitle-section .hs-sub-title');
      splitTextToSpans(subTitle);

      // Title
      const title = document.querySelector('.swiper-slide-active .hs-animation-1-title');
      splitTextToSpans(title);

      // Desc
      const desc = document.querySelector('.swiper-slide-active .hs-animation-1-desc');
      splitTextToSpans(desc);

      // Typewriter subtitle
      const typeSub = document.querySelector('.swiper-slide-active .hs-animation-2-subtitle');
      if (typeSub) {
        typeSub.style.animation = 'none';
        void typeSub.offsetWidth;
        typeSub.style.animation = 'typewritersubtitle 4s steps(30) 1s forwards, blink 0.7s step-end infinite';
      }

      // Typewriter title
      const typeTitle = document.querySelector('.swiper-slide-active .hs-animation-2-title');
      if (typeTitle) {
        typeTitle.style.animation = 'none';
        void typeTitle.offsetWidth;
        typeTitle.style.animation = 'typewritertitle 4s steps(30) 1s forwards, blink 0.7s step-end infinite';
      }

      // Typewriter desc
      const typeDesc = document.querySelector('.swiper-slide-active .hs-animation-2-desc');
      if (typeDesc) {
        typeDesc.style.animation = 'none';
        void typeDesc.offsetWidth;
        typeDesc.style.animation = 'typewriterdesc 4s steps(30) 1s forwards, blink 0.7s step-end infinite';
      }
    });

  });
});
