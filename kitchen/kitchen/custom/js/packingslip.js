cur_frm.fields_dict['delivery_note'].get_query = function(doc, cdt, cdn) {
	return{
		filters:{ 'docstatus': 1}
	}
}