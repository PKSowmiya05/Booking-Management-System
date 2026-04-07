// Copyright (c) 2026, Sowmiya] and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Travel Booking", {
// 	refresh(frm) {

// 	},
// });
frappe.ui.form.on('Travel Booking', {
    refresh: function(frm) {

        if (frm.doc.grand_total > 50000) {


            frm.dashboard.add_comment(
                "High Value Booking",
                'orange'
            );
        }

        if (frm.doc.docstatus === 1) {
            frm.add_custom_button("Request Refund", () => {
                frappe.prompt([
                   {
                     label: "Refund Type",
                     fieldname: "refund_type",
                     fieldtype: "Select",
                     options: ["Standard", "Goodwill"],
                     reqd: 1
                    }
                  ],
                 function(values) {

                    frappe.new_doc("Refund Request", {
                    travel_booking: frm.doc.name,
                    refund_type: values.refund_type
                   });

                    },
                   "Select Refund Type",
                    "Proceed");
 
                   });

        }

     if (frm.doc.docstatus === 1) {

    frm.add_custom_button('Partial Cancellation', function() {

        let items = frm.doc.booked_package;

        if (!items || items.length === 0) {
            frappe.msgprint("No items to cancel");
            return;
        }

        let fields = [];

        items.forEach(item => {
            fields.push({
                label: item.travel_package,
                fieldname: item.name,
                fieldtype: "Check"
            });
        });

        let d = new frappe.ui.Dialog({
            title: "Select Items to Cancel",
            fields: fields,

            primary_action_label: "Confirm",

            primary_action(values) {

                let selected_items = [];
                let remaining_items = [];
                let refund_amount = 0;

                items.forEach(item => {
                    if (values[item.name]) {
                        selected_items.push(item);
                        refund_amount += item.amount;
                    } else {
                        remaining_items.push(item);
                    }
                });

                if (selected_items.length === 0) {
                    frappe.msgprint("Please select at least one item");
                    return;
                }

                frappe.msgprint("Refund Amount: " + refund_amount);

                frappe.call({
                    method: "frappe.client.insert",
                    args: {
                        doc: {
                            doctype: "Refund Request",
                            travel_booking: frm.doc.name,
                            refund_amount: refund_amount,
                            is_partial: 1
                        }
                    },
                    callback: function() {

                      
                        frm.clear_table("booked_package");

                        remaining_items.forEach(item => {
                            let row = frm.add_child("booked_package");
                            Object.assign(row, item);
                        });

                        let new_total = 0;
                        remaining_items.forEach(item => {
                            new_total += item.amount;
                        });

                        frm.set_value("grand_total", new_total);

                        frm.refresh_field("booked_package");
                        frm.save();

                        frappe.msgprint("Partial Cancellation Done");
                    }
                });

                d.hide();
            }
        });

        d.show();
    });
}
       
    }
});

