import frappe
from frappe.utils import nowdate,date_diff

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
@frappe.whitelist()                            
def bulk_refund(vendor,travel_package):
     doc =frappe.db.sql("""select tb.name from `tabTravel Booking` as tb join `tabBooking item` as bi on bi.parent = tb.name where bi.travel_package= %s and tb.docstatus= 1""",(travel_package,),as_dict=True)
     if not doc:
          frappe.msgprint("No bookings found")    
          return
     frappe.enqueue(
          "booking_management.booking_management_system.api.bulk_refund_background",doc=doc,vendor=vendor,travel_package=travel_package,)
def bulk_refund_background(doc, vendor, travel_package):

    total = len(doc)
    success = 0
    failed = 0

    for i in range(total):
        booking_name = doc[i]["name"]

        try:
            booking = frappe.get_doc("Travel Booking", booking_name)

            refund_amount = 0

           
            for bp in booking.booked_package:

                if bp.travel_package == travel_package:

                    package_doc = frappe.get_doc("Travel Package", bp.travel_package)

                    for item in package_doc.package_item:

                        service_doc = frappe.get_doc("Service", item.service)

            
                        if service_doc.vendor == vendor:

                            if hasattr(item, "total"):
                                refund_amount += item.total
                            else:
                                refund_amount=0

           
            if refund_amount == 0:
                failed += 1
                continue    

            days_diff = date_diff(booking.travel_date, nowdate())

            if days_diff >= 7:
                percentage = 10
            elif days_diff >= 3:
                percentage = 25
            else:
                percentage = 50

            cancellation_charge = refund_amount * (percentage / 100)

            if booking.is_international:
                    visa_fee = 2500
            else :
                visa_fee = 0

            final_refund = refund_amount - cancellation_charge - visa_fee

           
            refund = frappe.new_doc("Refund Request")
            refund.travel_booking = booking.name
            refund.customer = booking.customer
            refund.refund_type = "Standard"

            refund.booking_amount = refund_amount
            refund.cancellation_charge = cancellation_charge
            refund.visa_fee = visa_fee
            refund.refund_amount = final_refund

            refund.calculation_summary = f"""
                             Booking Amount (Selected Services): {refund_amount}
                            Cancellation Charge : {cancellation_charge}
                           Visa Fee: {visa_fee}
                           Final Refund Amount: {final_refund}
                         """

            refund.insert()
            doc=frappe.new_doc("Payment Entry")
            doc.travel_booking=booking.booking_number
            doc.payment_date=nowdate()
            doc.amount_paid=final_refund
            doc.payment_mode="UPI"
            doc.reference_number=booking.booking_number
            doc.payment_type="Refund Payment"
            doc.insert()
            doc.submit()
            
            if booking.customer:
                customer=frappe.get_doc("Customer",booking.customer)
                if customer.customer_email:
                     frappe.sendmail(
                     recipients=customer.customer_email,
                     subject="Refund Processed",
                     message=f"""
                        Dear {customer.customer_name},<br><br>
                        Your refund of {final_refund} has been processed for Booking {booking.name}.<br><br>
                        Thank you.
                        """)

            success += 1

        except Exception:
            failed += 1
            frappe.error_log( "Bulk Refund Error")

       
        frappe.publish_realtime(
            "bulk_refund_progress",
            {
                "current": i + 1,
                "total": total,
                "success": success,
                "failed": failed
            }
        )

  
    frappe.publish_realtime(
        "bulk_refund_complete",
        {
            "total": total,
            "success": success,
            "failed": failed
        }
    )

    frappe.sendmail(
        recipients=[frappe.session.user],
        subject="Bulk Refund Summary",
        message=f"""
        Total: {total}<br>
        Success: {success}<br>
        Failed: {failed}"""
        )