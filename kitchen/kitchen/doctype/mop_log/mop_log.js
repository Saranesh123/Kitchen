// Copyright (c) 2022, Saranesh and contributors
// For license information, please see license.txt

frappe.ui.form.on('MOP Log', {
	refresh: function(frm){
		frm.set_query('department',function(doc){
			return{
				filters:{
					'company':doc.company
				}
			}
		})
	},
	department: function(frm,cdt,cdn){
		let p = locals[cdt][cdn]
		frappe.call({
			'method':'kitchen.kitchen.doctype.mop_log.mop_log.get_config',
			'args':{
				department : frm.doc.department,
			},
			callback(r){
				for(let i=0; i<r.message.length;i++){
					frm.add_child("mop_details")
					frappe.model.set_value(p.mop_details[i].doctype,p.mop_details[i].name,"name1",r.message[i]["name1"])
					frappe.model.set_value(p.mop_details[i].doctype,p.mop_details[i].name,"date_of_joining",r.message[i]["date_of_joining"])
					frappe.model.set_value(p.mop_details[i].doctype,p.mop_details[i].name,"salary",r.message[i]["salary"])
					frappe.model.set_value(p.mop_details[i].doctype,p.mop_details[i].name,"mode_of_payment",r.message[i]["mode_of_payment"])
					frappe.model.set_value(p.mop_details[i].doctype,p.mop_details[i].name,"minimum",r.message[i]["minimum"])
					frappe.model.set_value(p.mop_details[i].doctype,p.mop_details[i].name,"maximum",r.message[i]["maximum"])
					frm.refresh_field('mop_details')
				}
				frm.refresh_field('mop_details')
                frm.refresh()
			}
		})
	},
});