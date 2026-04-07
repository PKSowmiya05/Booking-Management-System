# Copyright (c) 2026, Sowmiya] and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class PaymentEntry(Document):
    def validate(self):
        if not self.payment_mode:
            frappe.throw("Payment mode is mandatory")

        if not self.reference_number:
            frappe.throw("Enter the reference number")

        if self.payment_type == "Refund Payment" and self.refund_request:

            existing = frappe.db.exists("Payment Entry", {
                "refund_request": self.refund_request,
                "docstatus": 1
            })

            if existing:
                frappe.throw("Refund already paid!")    

    
    def on_submit(self):
        if self.payment_type == "Booking Payment":
         doc = frappe.get_doc("Travel Booking", self.travel_booking)

        remaining = self.amount_paid

        for item in doc.payment_schedule:
            if item.status != "Paid":

                pending = item.amount - (item.paid_amount or 0)

                if remaining >= pending:
                    item.paid_amount = item.amount
                    item.status = "Paid"
                    remaining -= pending
                else:
                    item.paid_amount = (item.paid_amount or 0) + remaining
                    item.status = "Pending"
                    remaining = 0

                if remaining <= 0:
                    break

        total_paid = 0
        for item in doc.payment_schedule:
            total_paid += item.paid_amount or 0

        doc.balance_amount = doc.grand_total - total_paid

        if total_paid == 0:
            doc.status = "Confirmed"
        elif total_paid < doc.grand_total:
            doc.status = "Partially Paid"
        else:
            doc.status = "Paid"

        doc.save()

   
        if self.payment_type == "Refund Payment" :
          doc = frappe.get_doc("Refund Request", self.refund_request)
          doc.status = "Paid"
          doc.save()