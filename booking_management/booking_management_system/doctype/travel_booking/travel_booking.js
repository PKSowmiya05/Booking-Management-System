// Copyright (c) 2026, Sowmiya] and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Travel Booking", {
// 	refresh(frm) {

// 	},
// });
frappe.ui.form.on('Travel Booking', {
    refresh: function(frm) {

        if (frm.doc.grand_total > 50000) {

            frm.dashboard.clear_comment(); 

            frm.dashboard.add_comment(
                "High Value Booking",
                'orange'
            );
        }

        if (frm.doc.docstatus === 1) {
            frm.add_custom_button("Request Refund", () => {
                frappe.new_doc("Refund Request", {
                    travel_booking: frm.doc.name,
                    customer: frm.doc.customer,
                    booking_amount: frm.doc.grand_total
                });
            });
        }
    }
});

