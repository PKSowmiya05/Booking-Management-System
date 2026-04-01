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

        if (frm.doc.docstatus === 1) { 
            frm.add_custom_button('Request Refund', function() {

                frappe.call({
                    method: "frappe.client.insert",
                    args: {
                        doc: {
                            doctype: "Refund Request",
                            travel_booking: frm.doc.name
                        }
                    },
                    callback: function(r) {
                        if (r.message) {
                            frappe.msgprint("Refund Request Created Successfully");
                        }
                    }
                });

            });
    }
     
        if (frm.doc.docstatus === 1) {

            frm.add_custom_button('Partial Cancellation', function() {

                let items = frm.doc.booking_items;

                // Step 1: Create simple checkbox list
                let fields = [];

                items.forEach(item => {
                    fields.push({
                        label: item.service,
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
                        let refund_amount = 0;

                
                        items.forEach(item => {
                            if (values[item.name]) {
                                selected_items.push(item);
                                refund_amount += item.amount;
                            }
                        });

                        if (selected_items.length === 0) {
                            frappe.msgprint("Please select at least one item");
                            return;
                        }

                        frappe.msgprint("Refund Amount: ₹" + refund_amount);

                        
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

                                let remaining_items = [];

                                items.forEach(item => {
                                    let remove = false;

                                    selected_items.forEach(sel => {
                                        if (sel.name === item.name) {
                                            remove = true;
                                        }
                                    });

                                    if (!remove) {
                                        remaining_items.push(item);
                                    }
                                });

                                frm.set_value("booking_items", remaining_items);


                                let new_total = 0;
                                remaining_items.forEach(item => {
                                    new_total += item.amount;
                                });

                                frm.set_value("grand_total", new_total);

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
frappe.ui.form.on("Booking Item", {
    service: function(frm, cdt, cdn) {
        let row = locals[cdt][cdn];

        if (row.service) {
            frappe.db.get_doc("Service", row.service).then(doc => {
                row.service_type = doc.service_type;
                row.vendor = doc.vendor;
                row.price = doc.price;
                row.quantity = 1;
                row.total = row.price * row.quantity;

                frm.refresh_field("services");
            });
        }
    },

    quantity: function(frm, cdt, cdn) {
        let row = locals[cdt][cdn];
        row.total = row.price * row.quantity;

        frm.refresh_field("services");
    }
});
