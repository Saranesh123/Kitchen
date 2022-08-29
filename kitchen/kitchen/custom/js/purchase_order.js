frappe.ui.form.on('Purchase Order',{
    before_save: function(frm){
        if(frm.doc.owner != "Administrator" || frm.doc.owner == "System User"){
        if(frm.doc.__islocal){
            frappe.throw("You are not allowed to Create Purchase Order manually")
        }
    }}
})