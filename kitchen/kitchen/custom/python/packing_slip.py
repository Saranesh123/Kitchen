import frappe
from frappe.utils import cint
from erpnext.stock.doctype.packing_slip.packing_slip import PackingSlip

class dn(PackingSlip):
    def validate_delivery_note(self):
        pass