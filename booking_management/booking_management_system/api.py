import frappe
from frappe.utils import nowdate,add_days

def payment_remainder():
    booking_numbers = frappe.db.get_list("Travel Booking", pluck="booking_number")

    for b in booking_numbers:
        doc = frappe.get_doc("Travel Booking", b)  
        for item in doc.payment_schedule:
            if item.status!= "Paid" and item.due_date<nowdate():
                if doc.customer:
                    customer=frappe.get_doc("Customer",doc.customer)
                    if customer.customer_email:
                            frappe.sendmail(
                            recipients=[customer.customer_email],
                            subject="Payment Reminder",
                            message=f"""
                            Dear {customer.customer_name},<br><br>
                            Your payment of ₹{item.amount} for Booking {doc.name} is overdue.<br>
                            Due Date: {item.due_date}<br><br>
                            Please make the payment as soon as possible.<br><br>
                            Thank you!!.
                            Have a nice day
                            """
                        )