jQuery(document).ready(($) => {
  $(".rform-button-submit").on("click", function (event) {
    event.preventDefault();
    var form = $(this).closest("form");
    var form_id = form.attr("data-form");
    if (form.hasClass("rform-dsb")) {
      var m = form.find(".require-login");
      m.css("display", "block");
    } else {
      form.find(".rform-select").each(function () {
        if ($(this).is("[required]")) {
          var value = $(this)
            .closest(".rform-select-container")
            .find(".rform-select-input")
            .val();
          if (value === "") {
            $(this).attr("aria-invalid", "true");
          } else {
            $(this).attr("aria-invalid", "false");
          }
        }
      });

      // RADIO
      form.find(".rform-input[type=radio][required]").each(function () {
        $(this).on("change", function () {
          const groupName = $(this).attr("name");
          form
            .find(`.rform-input[type=radio][name="${groupName}"]`)
            .attr("aria-invalid", "false");
        });
      });

      // CHECKBOX
      let checkbox = form.find(".rform-checkbox-button[required]");

      if (checkbox.length) {
        checkbox.each(function () {
          const $checkbox = $(this);
          const min = parseInt($checkbox.data("min")) || 1;
          const max = $checkbox.data("max")
            ? parseInt($checkbox.data("max"))
            : null;
          const groupName = $checkbox
            .find(".rform-input[type=checkbox]")
            .attr("name");

          const group = $checkbox.find(
            `.rform-input[type=checkbox][name="${groupName}"]`,
          );

          validateGroup(); // validasi awal

          function validateGroup() {
            const checkedCount = group.filter(":checked").length;
            const isValid =
              max !== null
                ? checkedCount >= min && checkedCount <= max
                : checkedCount >= min;
            group.each(function () {
              $this = $(this);
              $this.attr("aria-invalid", !isValid ? "true" : "false");
              // console.log($this.attr('aria-invalid'));
            });
          }

          group.on("change", validateGroup);
        });
      }

      if (form[0].checkValidity()) {
        if (form.find("[aria-invalid=true]").length == 0) {
          // console.log('Form Valid');

          $(this).prop("disabled", true);

          let current_html = $(this).html();

          $(this).html(
            `<div class="loading"><div id="loading"></div>Sending...</div>`,
          );
          var data = form.serializeArray();
          let captchaToken;

          // recaptcha V3
          let recaptchaV3 = form.find(".rform-recaptcha-token");
          if (recaptchaV3.length > 0) {
            if (recaptchaV3.val() !== "") {
              captchaToken = recaptchaV3.val();
            }
          }
          var serializedInputs = {};
          var nonce = romethemeform_ajax_url.nonce;
          data = data.filter(function (item) {
            return item.name !== "g-recaptcha-response";
          });
          $(data).each(function (index, obj) {
            if (serializedInputs[obj.name] !== undefined) {
              if (!Array.isArray(serializedInputs[obj.name])) {
                serializedInputs[obj.name] = [serializedInputs[obj.name]];
              }
              serializedInputs[obj.name].push(obj.value);
            } else {
              serializedInputs[obj.name] = obj.value;
            }
          });

          var jsonString = JSON.stringify(serializedInputs);
          var data_sending = {
            action: "rformsendform",
            id: form_id,
            data: jsonString,
            email: form.find('input[type="email"]').val(),
            nonce: nonce,
            page: window.location.href,
          };

          if (
            captchaToken !== undefined ||
            captchaToken !== "" ||
            captchaToken !== null ||
            captchaToken.length > 0
          ) {
            data_sending["recaptchaToken"] = captchaToken;
          }
          // console.log(data_sending);
          sending_form(data_sending, $(this), current_html);
        } else {
          form.find(":invalid").each(function () {
            $(this).attr("aria-invalid", "true");
          });
        }
      } else {
        // console.log('haii')
        form.find(":invalid").each(function () {
          $(this).attr("aria-invalid", "true");
        });
      }
    }
  });
  $(".close-msg").click(function (event) {
    event.preventDefault();
    var msg = $(this).closest(".msg");
    msg.css("display", "none");
  });
});

function sending_form(data, btn, current_html) {
  jQuery(document).ready(($) => {
    $.ajax({
      type: "post",
      url: romethemeform_ajax_url.ajax_url,
      data: data,
      success: (e) => {
        if (e.success) {
          btn.prop("disabled", false);
          btn.html(current_html);
          btn.closest("form").find(".success-submit").css("display", "block");
          btn.closest("form")[0].reset();
        } else {
          btn.prop("disabled", false);
          btn.html(current_html);
          alert(e.data);
        }
        // console.log(e);
      },
      error: (jqXHR, textStatus, errorThrown) => {
        console.log(textStatus, errorThrown);
      },
    });
  });
}

function onRecaptchaSuccess() {
  console.log("Recaptcha berhasil diselesaikan!");
}
function onRecaptchaExpired() {
  console.log("Recaptcha telah kedaluwarsa. Silakan selesaikan lagi.");
}
