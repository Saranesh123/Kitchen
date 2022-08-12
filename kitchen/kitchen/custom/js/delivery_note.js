frappe.ui.form.on('Delivery Note', {
    refresh: function(frm,cdt,cdn) {
        if(frm.doc.docstatus == 1){ 
        frm.add_custom_button(__('Packing Slip'), function(){
            frappe.model.open_mapped_doc({
                method: "kitchen.kitchen.custom.python.delivery_note.make_packing_slip",
                frm:frm,
        })
    }, __("Create"));
  }
  if(frm.doc.docstatus == 0){
    frm.add_custom_button(__('Packing Slip'), function(){
        frappe.msgprint("Please submit the document to proceed further")
    },__("Create"));
}
}});