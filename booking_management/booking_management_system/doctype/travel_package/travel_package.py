# Copyright (c) 2026, Sowmiya] and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import getdate

class TravelPackage(Document):
    def validate(self):

        self.available_slots=self.total_slots-self.booked_slots or 0
        if self.available_slots<0:
            frappe.throw("Booked slots cant exceed total slots")

        total_price = 0
        for item in self.package_item:
           if not item.service:
            continue
           service = frappe.get_doc("Service", item.service)
           item.price = service.price

           item.total = item.quantity * item.price
           item.commission_amount = item.total * (service.commision_percentage / 100)

           total_price += item.total
        self.toatl_price = total_price		
        today= getdate()
        if today.month in [12,1]:
            self.seasonal_price =self.toatl_price*1.2
        else:
            self.seasonal_price =self.toatl_price
