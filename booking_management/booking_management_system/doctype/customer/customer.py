# Copyright (c) 2026, Sowmiya] and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import today

class Customer(Document):
 def validate(self):
    if self.expiry_date:
        if self.expiry_date < today():
            frappe.throw("Passport is expired")

    if not self.customer_phone:
        frappe.throw("Phone is required")

    count = frappe.db.count("Travel Booking", {
        "customer": self.customer_name
    })

    if count >= 10:
        self.loyalty_tier = "Platinum"
    elif count >= 5:
        self.loyalty_tier = "Gold"
    else:
        self.loyalty_tier = "Silver"