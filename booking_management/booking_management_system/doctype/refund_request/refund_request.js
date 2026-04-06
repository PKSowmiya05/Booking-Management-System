// Copyright (c) 2026, Sowmiya] and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Refund Request", {
// 	refresh(frm) {

// 	},
// });
frappe.ui.form.on('Refund Request', {
    refresh(frm) {

        if (frm.doc.workflow_state === "Approved" && frm.doc.docstatus === 1) {

            frm.add_custom_button("Make Refund Payment", () => {

                frappe.new_doc("Payment Entry", {
                    refund_request: frm.doc.name,
                    travel_booking: frm.doc.travel_booking,
                    customer: frm.doc.customer,
                    amount: frm.doc.refund_amount,
                    payment_type: "Refund Payment"
                });

            });
        }
        if (frm.doc.docstatus === 1) {

            frm.add_custom_button("Raise Dispute", () => {

                frappe.new_doc("Dispute", {
                    refund_request: frm.doc.name,
                    travel_booking: frm.doc.travel_booking,
                    customer: frm.doc.customer,
                    original_refund: frm.doc.refund_amount
                });

            });
        }
    }
});