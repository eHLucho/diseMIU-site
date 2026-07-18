const upgradeToProLink = document.querySelector(
  '.toplevel_page_rtmkit > ul.wp-submenu a[href="admin.php?page=rtmkit-upgrade-to-pro"]'
);

if (upgradeToProLink) {
  upgradeToProLink.onclick = (e) => {
    e.preventDefault();
    window.open("https://rometheme.net/plugins/rtmkit/pricing/", "_blank");
  };
}
