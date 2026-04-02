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

                let items = frm.doc.booking_items;

                if (!items || items.length === 0) {
                    frappe.msgprint("No items to cancel")
                   
                }

                let fields = [];

                for (let i = 0; i < items.length; i++) {

                   let item = items[i];

                   if (values[item.name]) {
                   selected_items.push(item);
                   refund_amount += item.amount;
                          }
                   }

                let d = new frappe.ui.Dialog({
                    title: "Select Items to Cancel",
                    fields: fields,

                    primary_action_label: "Confirm",

                    primary_action(values) {

                        let selected_items = [];
                        let refund_amount = 0;

                
                       for (let i = 0; i < items.length; i++) {
                           let item = items[i];

                         if (values[item.name]) {
                             selected_items.push(item);
                             refund_amount += item.amount;
                                   }
                        }
                        if (selected_items.length === 0) {
                            frappe.msgprint("Please select at least one item");
                            return;
                        }

                        frappe.msgprint("Refund Amount" + refund_amount);

                        
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

                                for(let j=0;j<selected_items.length;j++){
                                    let sel =selected_items[j];
                                    if(sel.name == item.name){
                                        remove=true;
                                        break
                                    }
                                }
                                if(!remove){
                                    remaining_items.push(item);
                                }
                            

                                frm.clear_table("booking_items");

                                for (let i = 0; i < remaining_items.length; i++) {

                                let item = remaining_items[i];
 
                                let row = frm.add_child("booking_items");

                              Object.assign(row, item);
                                 } 


                                let new_total = 0;
                               for (let i = 0; i < remaining_items.length; i++) {
                                     new_total += remaining_items[i].amount;
                                    }
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
