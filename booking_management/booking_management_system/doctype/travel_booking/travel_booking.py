# Copyright (c) 2026, Sowmiya] and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import nowdate, add_days
from frappe.utils.jinja import render_template
class TravelBooking(Document):
    def autoname(self):
        year = nowdate().split("-")[0]
        count = frappe.db.count("Travel Booking")
        self.name = f"BK-{year}-{str(count+1).zfill(5)}"
        self.booking_number = self.name

    def validate(self):
     
        if not self.booked_package:
            frappe.throw("Atleast one package is required")

        total_amount = 0
        for item in self.booked_package:
            doc = frappe.get_value("Travel Package", item.travel_package, "seasonal_price") or 0
            item.price=doc
            item.total = (item.quantity or 0) * doc 
            total_amount += item.total

        self.total_amount = total_amount

        total_after_discount = total_amount - self.discount
        gst_percent = frappe.db.get_single_value("Agency Settings", "gst_percentage")

        GST_amount = total_after_discount * gst_percent / 100
        self.gst_amount = GST_amount
        self.grand_total = total_after_discount + GST_amount

        if self.grand_total > 50000:
            self.high_value_booking = 1
        else:
            self.high_value_booking = 0

        total_paid = 0

        for item in self.payment_schedule:
            total_paid += item.paid_amount or 0
        
        self.paid_amount=total_paid

        self.balance_amount = self.grand_total - total_paid
        if self.workflow_state == "Approved" and self.docstatus == 1:
            self.status = "Completed"
        elif total_paid == 0:
            self.status = "Confirmed"
        elif total_paid < self.grand_total:
            self.status = "Partially Paid"
        else:
            self.status = "Paid"
        total = self.grand_total
        if not self.payment_schedule:
         self.append("payment_schedule", {
            "due_date": nowdate(),
            "amount": total * 0.33,
            "status": "Pending"
        })

         self.append("payment_schedule", {
            "due_date": add_days(nowdate(), 7),
            "amount": total * 0.33,
            "status": "Pending"
        })

         self.append("payment_schedule", {
            "due_date": add_days(nowdate(), 15),
            "amount": total * 0.34,
            "status": "Pending"
        })
      

    def on_submit(self):
        if self.is_international:
            if not self.passport_number or not self.expiry_date:
                frappe.throw("Passport details are mandatory")

        for item in self.booked_package:
            doc = frappe.db.get_value("Travel Package", item.travel_package,"available_slots")
            if item.quantity > doc:
                frappe.throw("Not enough slots")
        
        for item in self.booked_package:
            package = frappe.get_doc("Travel Package", item.travel_package)
            package.booked_slots += item.quantity
            package.save()
    
        count = frappe.db.count("Travel Booking", {
        "customer": self.customer,
        "docstatus": 1
             })

        if count >= 10:
           tier = "Platinum"
        elif count >= 5:
           tier = "Gold"
        else:
              tier = "Silver"

        frappe.db.set_value("Customer", self.customer, "loyalty_tier", tier)

     

   
    def on_submit(self):
        customer_email = frappe.db.get_value("Customer", self.customer, "customer_email")

        if customer_email:
            voucher_pdf = frappe.get_print(
            "Travel Booking", self.name,
            print_format="Booking Voucher",
            as_pdf=True
        )

            itenary_pdf = frappe.get_print(
            "Travel Booking", self.name,
            print_format="Travel Itenary",
            as_pdf=True
        )

            frappe.sendmail(
            recipients=[customer_email],
            subject="Booking Confirmed",
            message="Your booking is confirmed.",
            attachments=[
                {
                    "fname": f"{self.booking_number}.pdf",
                    "fcontent": voucher_pdf
                },
                {
                    "fname": f"{self.booking_number}.pdf",
                    "fcontent": itenary_pdf
                }
            ]
        )

    def on_cancel(self):

        for item in self.booked_package:
            doc = frappe.get_doc("Travel Package", item.travel_package)
            doc.booked_slots -= item.quantity
            doc.save()

        for item in self.payment_schedule:
            item.status = "Cancelled"