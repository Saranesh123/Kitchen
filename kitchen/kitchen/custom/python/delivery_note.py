import frappe
from frappe.model.mapper import get_mapped_doc
@frappe.whitelist()
def make_packing_slip(source_name, target_doc=None):
	doclist = get_mapped_doc(
		"Delivery Note",
		source_name,
		{
			"Delivery Note": {
				"doctype": "Packing Slip",
				"field_map": {"name": "delivery_note", "letter_head": "letter_head"},
				"validation": {"docstatus": ["=", 1]},
			}
		},
		target_doc,
	)

	return doclist