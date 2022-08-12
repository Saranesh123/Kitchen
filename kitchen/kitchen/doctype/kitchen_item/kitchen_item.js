// Copyright (c) 2022, Saranesh and contributors
// For license information, please see license.txt

frappe.ui.form.on('Kitchen Food Items', {
	quantity: function(frm,cdt,cdn) {
		let row = locals[cdt][cdn]
		frappe.model.set_value(cdt,cdn,'total',row.rate*row.quantity)
	},
});

frappe.ui.form.on('Kitchen Item',{
	refresh: function(frm,cdt,cdn){
		frm.set_query('it','item',function(doc){
			return{"filters": {"is_stock":1}}
		})
	}
})