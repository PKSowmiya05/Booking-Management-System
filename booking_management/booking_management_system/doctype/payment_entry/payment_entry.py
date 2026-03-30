# Copyright (c) 2026, Sowmiya] and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class PaymentEntry(Document):
    def on_submit(self):
        doc =frappe.get_doc("Travel Booking",self.travel_booking)
        remaining= self.amount_paid
        for item in doc.payment_schedule:
            if item.status!="Paid":
                pending=item.amount_paid -(item.paid_amount or 0)
                if remaining>=pending:
                    item.paid_amount=item.amount_paid
                    item.status="Paid"
                    remaining -= pending
                else:
                    item.paid_amount = (item.paid_amount or 0) + remaining
                    remaining=0
                if remaining<=0:
                    break
        total_paid=0
        for item in self.payment_schedule:
            total_paid+=item.paid_amount or 0
        self.balance_amount= self.grand_total - total_paid

        if total_paid==0:
            self.status="Confirmed"
        elif total_paid<self.grand_total:
            self.status="Partially Paid"
        else:
            self.status="Paid"

        doc.save()