// Copyright (c) 2026, Sowmiya] and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Customer", {
// 	refresh(frm) {

// 	},
// });
frappe.ui.form.on('Customer', {
    refresh(frm) {
        if (frm.doc.outstanding_amount > 0 || frm.doc.has_open_disputes) {
            frm.dashboard.set_headline_alert(
                "Outstanding payment or dispute exists",
                "red"
            );
        }
    }
});