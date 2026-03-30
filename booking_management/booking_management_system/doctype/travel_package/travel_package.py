# Copyright (c) 2026, Sowmiya] and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import getdate

class TravelPackage(Document):
	def validate(self):
		self.available_slots=self.total_slots-self.booked_slots
		if self.available_slots<0:
			frappe.throw("Booked slots cant exceed total slots")
		
		today= getdate()
		if today.month in [12,1]:
			self.seasonal_price =self.toatl_price*1.2
		else:
			self.seasonal_price =self.toatl_price