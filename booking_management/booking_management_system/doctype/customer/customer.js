// Copyright (c) 2026, Sowmiya] and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Customer", {
// 	refresh(frm) {

// 	},
// });
frappe.ui.form.on('Customer', {
    refresh(frm) {
        if (frm.doc.has_overdue_payments > 0 ) {
            frm.dashboard.set_headline_alert(
                "Outstanding payment ",
                "red"
            );
        }
    }
});