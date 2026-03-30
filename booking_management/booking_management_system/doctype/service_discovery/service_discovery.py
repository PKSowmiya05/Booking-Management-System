# Copyright (c) 2026, Sowmiya] and contributors
# For license information, please see license.txt

import frappe
from frappe.utils.nestedset import NestedSet


class ServiceDiscovery(NestedSet):
    def validate(self):
        if not self.commission_percentage and self.parent_service_category:
             parent = frappe.get_doc("Service Category", self.parent_service_category)
             self.commission_percentage = parent.commission_percentage