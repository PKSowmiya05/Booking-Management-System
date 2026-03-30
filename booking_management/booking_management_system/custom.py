
import frappe


def extend_bootinfo(bootinfo):
	s = frappe.get_single("Agency Settings")
	bootinfo.booking_sname = s.agency_name
	

def get_shop_name():
	setting = frappe.get_single("Agency Settings")
	return setting.agency_name
