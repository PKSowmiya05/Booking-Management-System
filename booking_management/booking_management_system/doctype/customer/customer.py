# Copyright (c) 2026, Sowmiya] and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import today

class Customer(Document):
 def validate(self):
    if self.expiry_date and self.expiry_date < today():
            frappe.throw("Passport is expired")

    if not self.customer_phone:
        frappe.throw("Phone is required")
    if frappe.db.exists("Customer",{ "customer_phone":self.customer_phone,"name": ["!=", self.name]}):
          frappe.throw("Phone number already exists")

        
