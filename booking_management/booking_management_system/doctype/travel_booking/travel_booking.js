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
    }
});