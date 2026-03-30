frappe.pages['customer_search'].on_page_load = function(wrapper) {
	console.log("Customer dashboard loaded");
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Customer Search',
		single_column: true
	});
	let input=$(<input type="text"
		        class="form-control"
				placeholder="Search by Name or Phone"
				style="margin-bottom: 15px; width: 50%;"
				></input>
	)
	let result=$(<div></div>)
	$(page.body).append(input)
	$(page.body).append(result)
	 input.on("input", function() {

        let value = input.val();

        if (!value) {
            result.empty();
            return;
        }

        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Customer",
                fields: [
                    "name",
                    "customer_name",
                    "phone",
                    "email"
                ],
                filters: [
                    ["customer_name", "like", "%" + value + "%"]
                ],
                or_filters: [
                    ["phone", "like", "%" + value + "%"]
                ]
            },
            callback: function(r) {

                result.empty();

                if (!r.message || r.message.length === 0) {

                    result.html(`
                        <div style="padding:10px;">
                            <p>No customer found</p>
                            <button class="btn btn-primary" id="create_customer">
                                Create New Customer
                            </button>
                        </div>
                    `);

                
                    $("#create_customer").click(function() {
                        frappe.new_doc("Customer", {
                            customer_name: value
                        });
                    });

                } else {

                    r.message.forEach(c => {

                        let card = $(`
                            <div style="
                                padding:10px;
                                border:1px solid #ddd;
                                margin-bottom:8px;
                                border-radius:6px;
                                cursor:pointer;
                            ">
                                <b>${c.customer_name}</b><br>
                                📞 ${c.phone || 'N/A'}<br>
                                📧 ${c.email || 'N/A'}
                            </div>
                        `);

             
                        card.click(function() {
                            frappe.set_route('Form', 'Customer', c.name);
                        });

                        result.append(card);
                    });
                }
            }
        });
    });
}