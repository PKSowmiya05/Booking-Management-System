# Copyright (c) 2026, Sowmiya] and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class Service(Document):
    def validate(self):
                if not self.service_category:
                        frappe.throw("Service Category is required")
        
                if not self.vendor:
                         frappe.throw("Vendor is required")
                if self.price <= 0:
                       frappe.throw("Price must be greater than 0")

                if self.commision_percentage < 0 or self.commision_percentage > 100:
                       frappe.throw("Commission must be between 0 and 100")