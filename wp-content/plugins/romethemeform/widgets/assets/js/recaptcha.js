jQuery(window).on("elementor/frontend/init", function () {
  elementorFrontend.hooks.addAction(
    "frontend/element_ready/rform-recaptcha.default",
    function ($scope, $) {
      const $form = $scope.closest("form");

      if (typeof grecaptcha !== "undefined") {
        const recaptchaV2Elements = $scope.find(".rform-recaptcha-v2");
        const recaptchaV3Elements = $scope.find(".rform-recaptcha-token");
        if (recaptchaV2Elements.length > 0) {
          recaptchaV2Elements.each(function () {
            const siteKey = $(this).data("sitekey");
            const theme = $(this).data("theme") ?? "light";
            let verificationDone = false;
            const thisEl = this;
            grecaptcha.ready(function () {
              grecaptcha.render(thisEl, {
                sitekey: siteKey,
                theme: theme,
                callback: function (token) {
                  // You can store the token in a hidden input or send it to your server here
                  verificationDone = true;
                  $scope
                    .find(".rform-recaptcha-wrapper")
                    .removeAttr("aria-invalid");
                },
                "expired-callback": function () {
                  grecaptcha.reset();
                  verificationDone = false;
                  $scope
                    .find(".rform-recaptcha-wrapper")
                    .attr("aria-invalid", "true");
                },
              });
            });
            $form
              .find("button.rform-button-submit")[0]
              .addEventListener("click", function () {
                console.log(
                  "Form submitted with reCAPTCHA token:",
                  grecaptcha.getResponse(),
                );
                if (!verificationDone) {
                  $scope
                    .find(".rform-recaptcha-wrapper")
                    .attr("aria-invalid", "true");
                } else {
                  $scope
                    .find(".rform-recaptcha-wrapper")
                    .removeAttr("aria-invalid");
                }
              });
          });
        } else if (recaptchaV3Elements.length > 0) {
          // console.log("reCAPTCHA v3 detected, executing...");
          recaptchaV3Elements.each(function () {
            const siteKey = $(this).data("sitekey");
            grecaptcha.ready(function () {
              grecaptcha
                .execute(siteKey, { action: "submit" })
                .then(function (token) {
                  recaptchaV3Elements.val(token);
                  $form
                    .find("button.rform-button-submit")[0]
                    .addEventListener("click", function () {
                      const newToken = generateRecaptchaToken(
                        "submit",
                        siteKey,
                      );
                      recaptchaV3Elements.val(newToken);
                    });
                });
            });
          });
        }
      }
    },
  );
});

function generateRecaptchaToken(action = "submit", siteKey) {
  return new Promise((resolve, reject) => {
    grecaptcha.ready(function () {
      grecaptcha.execute(siteKey, { action }).then(resolve).catch(reject);
    });
  });
}
