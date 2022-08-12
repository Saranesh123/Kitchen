// Copyright (c) 2022, Saranesh and contributors
// For license information, please see license.txt

frappe.ui.form.on('MOP Configuration', {
	refresh: function(frm){
		frm.set_query('department',function(doc){
			return{
				filters:{
					'company':doc.company
				}
			}
		})
		frm.set_query('name1','mop_details',function(doc){
			if(frm.doc.department){
				return{"filters":{"department":doc.department}}
			} else {
				return None
			}
		})
	}
});