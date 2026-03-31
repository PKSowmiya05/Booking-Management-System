# Copyright (c) 2026, Sowmiya] and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import nowdate

class RefundRequest(Document):


    def validate(self):

        doc = frappe.get_doc("Travel Booking", self.travel_booking)
        self.booking_amount = doc.grand_total

      
        travel_date = doc.travel_date
        

        days_diff = frappe.utils.date_diff(travel_date, nowdate())

        if days_diff >= 7:
            percentage = 10
        elif days_diff >= 3:
            percentage = 25
        else:
            percentage = 50

        self.cancellation_charge = self.booking_amount * (percentage / 100)

        if doc.is_international :
            self.visa_fee = 2500
        

       
        self.refund_amount =   self.booking_amount - self.cancellation_charge - self.visa_fee
     
        self.calculation_summary = f"""
                             Booking Amount: {self.booking_amount}
                             Cancellation Charge ({percentage}%): {self.cancellation_charge}
                             Visa Fee: {self.visa_fee}
                             Final Refund Amount: {self.refund_amount} """