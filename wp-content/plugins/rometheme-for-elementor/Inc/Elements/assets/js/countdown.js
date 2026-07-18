jQuery(window).on("elementor/frontend/init", function () {
  elementorFrontend.hooks.addAction(
    "frontend/element_ready/rkit-countdown.default",
    function ($scope, $) {
      function formatDate(dateString) {
        var parts = dateString.split(" ");
        if (parts.length === 2) {
          var datePart = parts[0];
          var timePart = parts[1];
          var timeParts = timePart.split(":");
          if (timeParts.length === 3 && timeParts[2].length === 1) {
            timeParts[2] = "0" + timeParts[2];
          }
          return datePart + "T" + timeParts.join(":");
        }
        return "";
      }

      function initFlipCountdown($countdown, endDate) {
        if ($countdown.data("skin") !== "flip") return;
        if (!endDate) return;

        const formattedDate = formatDate(endDate);
        const countDownDate = new Date(formattedDate).getTime();
        if (isNaN(countDownDate)) return;

        const pieces = {};
        $countdown.find(".flip-clock__piece").each(function () {
          const key = $(this).data("key");
          const el = this;
          const top = el.querySelector(".card__top");
          const bottom = el.querySelector(".card__bottom");
          const back = el.querySelector(".card__back");
          const backBottom = el.querySelector(".card__back .card__bottom");

          pieces[key] = {
            el,
            update(val) {
              val = val < 10 ? "0" + val : String(val);
              if (val !== el.dataset.value) {
                if (el.dataset.value) {
                  back.setAttribute("data-value", el.dataset.value);
                  bottom.setAttribute("data-value", el.dataset.value);
                }
                el.dataset.value = val;
                top.innerText = val;
                backBottom.setAttribute("data-value", val);
                el.classList.remove("flip");
                void el.offsetWidth;
                el.classList.add("flip");
              }
            },
          };
        });

        const timer = setInterval(() => {
          const now = new Date().getTime();
          const distance = countDownDate - now;

          if (distance < 0) {
            clearInterval(timer);
            Object.values(pieces).forEach((p) => p.update(0));
            var expiredSection = $scope.find(".expired-time-section");
            var countdownWidget = $scope.find(".count");
            if (expiredSection.length && countdownWidget.length) {
              expiredSection.show();
              countdownWidget.hide();
            }
            return;
          }

          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((distance / (1000 * 60)) % 60);
          const seconds = Math.floor((distance / 1000) % 60);

          if (pieces.days) pieces.days.update(days);
          if (pieces.hours) pieces.hours.update(hours);
          if (pieces.minutes) pieces.minutes.update(minutes);
          if (pieces.seconds) pieces.seconds.update(seconds);
        }, 1000);

        $countdown.data("interval", timer);
      }

      function updateCountdownNormal($element, endDate) {
        if (!endDate) return;
        var formattedDate = formatDate(endDate);
        var countDownDate = new Date(formattedDate).getTime();
        if (isNaN(countDownDate)) return;

        $element.find(".countdown-days").text("00");
        $element.find(".countdown-hours").text("00");
        $element.find(".countdown-minutes").text("00");
        $element.find(".countdown-seconds").text("00");

        var x = setInterval(function () {
          var now = new Date().getTime();
          var distance = countDownDate - now;

          var days = Math.floor(distance / (1000 * 60 * 60 * 24));
          var hours = Math.floor(
            (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
          );
          var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          var seconds = Math.floor((distance % (1000 * 60)) / 1000);

          var daysStr = (days < 10 ? "0" + days : days).toString();
          var hoursStr = (hours < 10 ? "0" + hours : hours).toString();
          var minutesStr = (minutes < 10 ? "0" + minutes : minutes).toString();
          var secondsStr = (seconds < 10 ? "0" + seconds : seconds).toString();

          if ($element.find(".countdown-days").text() !== daysStr)
            $element.find(".countdown-days").text(daysStr);
          if ($element.find(".countdown-hours").text() !== hoursStr)
            $element.find(".countdown-hours").text(hoursStr);
          if ($element.find(".countdown-minutes").text() !== minutesStr)
            $element.find(".countdown-minutes").text(minutesStr);
          if ($element.find(".countdown-seconds").text() !== secondsStr)
            $element.find(".countdown-seconds").text(secondsStr);

          if (distance < 0) {
            clearInterval(x);
            $element.find(".countdown-days").text("00");
            $element.find(".countdown-hours").text("00");
            $element.find(".countdown-minutes").text("00");
            $element.find(".countdown-seconds").text("00");

            var expiredSection = $scope.find(".expired-time-section");
            var countdownWidget = $scope.find(".count");
            if (expiredSection.length && countdownWidget.length) {
              expiredSection.show();
              countdownWidget.hide();
            }
          }
        }, 1000);

        $element.data("interval", x);
      }

      const $countdown = $scope.find("#countdown");
      const endDate = $countdown.data("date");
      const skin = $countdown.data("skin");
      const useFlip = skin === "flip";

      const existingInterval = $countdown.data("interval");
      if (existingInterval) clearInterval(existingInterval);

      if (useFlip) {
        initFlipCountdown($countdown, endDate);
      } else {
        updateCountdownNormal($countdown, endDate);
      }

      $countdown.on("change", function () {
        const newEndDate = $(this).data("date");
        const prevInterval = $(this).data("interval");
        if (prevInterval) clearInterval(prevInterval);

        if (useFlip) {
          initFlipCountdown($(this), newEndDate);
        } else {
          updateCountdownNormal($(this), newEndDate);
        }
      });
    },
  );
});
