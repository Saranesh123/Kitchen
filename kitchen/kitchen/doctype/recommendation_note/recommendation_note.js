// Copyright (c) 2022, Saranesh and contributors
// For license information, please see license.txt

frappe.ui.form.on('Recommendation Note', {
	refresh: function(frm){
		frm.set_value('creation_date',frappe.datetime.nowdate());
		frm.set_query('project',function(doc){
			return{
				filters:{
					'company':doc.company
				}
			}
		})
		if(frm.doc.built_type == "Custom Built" && frm.doc.rn_type == "Permanent" && frm.doc.rn_status!="Verified"){
			frm.add_custom_button(__("Verify"),function(){
				frappe.call({
					doc: frm.doc,
					method: "update_status",
					callback:function(r){
						$.each(frm.meta.fields, function(index,field){
							frm.set_df_property(field.fieldname,"read_only",1)
						})
						frm.remove_custom_button(__("Verify"));
						frm.reload_doc();
					}
				})
			})
		}
		if(frm.doc.rn_type == "Adhoc" && frm.doc.rn_status == "Approved"){
			frm.add_custom_button(__("Create Purchase Order"),function(){
				frappe.call({
					'method': 'kitchen.kitchen.doctype.recommendation_note.recommendation_note.create_po',
					args:{
						self : frm.doc,
					},
					callback(r){
						frm.remove_custom_button(__("Create Purchase Order"));
						frm.reload_doc();
					}
				})
			})
		}
	},
	project: function(frm){
		if(! frm.doc.company){
			frm.doc.project = " ";
			refresh_field("project");
			frappe.throw("Enter the Company");
		}
	},
	rn_type:function(frm){
		if(! frm.doc.project){
			frm.doc.rn_type = "";
			refresh_field('rn_type');
			frappe.throw("Enter the Project");
		}
		if(frm.doc.rn_type != " "){
			frm.clear_table('recommendation_detail');
			frm.refresh_fields();
		}
	},
	built_type:function(frm){
		if(frm.doc.rn_type == " "){
			frm.doc.built_type = "";
			refresh_field("built_type");
			frappe.throw("Enter the RN Type");
		}
	},
	after_save: function(frm,cdt,cdn){
		let tot_burden = 0
		let row = locals[cdt][cdn]
		let column = row.recommendation_detail
		for(let data = 0; data < column.length; data++){
			tot_burden = tot_burden + parseFloat(column[data].burden)
		}
		frm.doc.total_burden = tot_burden
		frm.refresh_field('total_burden')
	}
});

frappe.ui.form.on("Recommendation Detail",{
	item_code: function(frm,cdt,cdn){
		let row = locals[cdt][cdn]
		if(! frm.doc.rn_type){
			frappe.msgprint("Enter the RN Type")
			frm.clear_table('recommendation_detail');
			frm.refresh_fields();
		}
		else{
			if(row.item_code){
			frappe.call({
				'method' : 'kitchen.kitchen.doctype.recommendation_note.recommendation_note.get_supplier',
				args :{
					item_code : row.item_code,
				},
				callback(r){
					for(let i=0;i<r.message.length;i++){
						row.default_supplier = r.message[i].supplier
						row.rate = r.message[i].rate
						row.default_supplier_currency = r.message[i].supplier_curr
						row.valid_from = r.message[i].valid_from
					if(r.message[i]['supplier_curr'] != "INR"){
						row.supplier_currency_exchange_rate = r.message[i].ex_rate
					}
					else{
						row.supplier_currency_exchange_rate = ""
					}
					}
					frm.refresh_field('recommendation_detail')
				}
			})}
		}
		if(frm.doc.rn_type == "Permanent"){
			frappe.call({
				'method': 'kitchen.kitchen.doctype.recommendation_note.recommendation_note.get_po_qty',
				args :{
					item_code : row.item_code,
				},
				callback(r){
					frappe.model.set_value(cdt,cdn,'total_po_quantity',r.message)
				}
			})
		}
	},
	ordering_quantity: function(frm,cdt,cdn){
		let row = locals[cdt][cdn]
		frappe.model.set_value(cdt,cdn,'burden',((row.proposed_rate - row.rate) *  row.ordering_quantity))
	},
	proposed_supplier: function(frm,cdt,cdn){
		let row = locals[cdt][cdn]
		if(row.proposed_supplier_currency != "INR"){
			frappe.call({
				'method' : 'kitchen.kitchen.doctype.recommendation_note.recommendation_note.exchange_rate',
				args :{
					ex_rate : row.proposed_supplier_currency
				},
				callback(r){
					frappe.model.set_value(cdt,cdn,'proposed_supplier_currency_exchange_rate',r.message)
				}
			})
		}
		else{
			frappe.model.set_value(cdt,cdn,'proposed_supplier_currency_exchange_rate','')
		}
	},
})