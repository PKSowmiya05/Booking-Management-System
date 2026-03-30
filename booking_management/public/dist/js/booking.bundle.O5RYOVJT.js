(() => {
  // ../booking_management/booking_management/public/js/booking.bundle.js
  frappe.provide("frappe.views");
  setTimeout(() => {
    if (frappe.boot.booking_sname) {
      let agency_name = frappe.boot.booking_sname;
      $(".navbar-home").append(
        `<span style="margin-left:10px; font-weight:600;">
                ${agency_name}
            </span>`
      );
    }
  }, 100);
})();
//# sourceMappingURL=booking.bundle.O5RYOVJT.js.map
