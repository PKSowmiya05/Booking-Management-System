frappe.listview_settings["Travel Booking"] = {

    onload: function(listview) {

        listview.page.add_inner_button("Process Bulk Refund", function() {

            frappe.prompt([

                 {
                    label: "Vendor",
                    fieldname: "vendor",
                    fieldtype: "Link",
                    options: "Vendor",
                    reqd: 1
                },
                {
                    label: "Travel Package",
                    fieldname: "travel_package",
                    fieldtype: "Link",
                    options: "Travel Package",
                    reqd: 1
                }
                
            ],
            function(values) {

                frappe.call({
                    method: "booking_management.booking_management_system.api.bulk_refund",
                    args: {
                        vendor:values.vendor,
                        travel_package: values.travel_package,
                       
                    },
                    callback: function(r) {
                        if (r.message) {
                            frappe.msgprint("Bulk Refund Process Started");
                        }
                    }
                });

            },
            "Bulk Refund",
            "Start");

        });

    }
};