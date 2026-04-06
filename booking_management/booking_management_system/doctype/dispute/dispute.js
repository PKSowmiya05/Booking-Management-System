// Copyright (c) 2026, Sowmiya] and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Dispute", {
// 	refresh(frm) {

// 	},
// });
frappe.ui.form.on("Dispute", {
    proposed_amount: function(frm) {

        if (frm.doc.proposed_amount && frm.doc.original_refund) {

            frm.set_value(
                "difference_amount",
                frm.doc.proposed_amount - frm.doc.original_refund
            );
        }
    },
    after_save: function(frm) {

        if (frm.doc.status === "Accepted" || frm.doc.status === "Resolved") {

            frappe.call({
                method: "booking_management.booking_management_system.api.supplementary_refund",
                args: {
                    dispute_name: frm.doc.name
                }
            });
        }
    }
});