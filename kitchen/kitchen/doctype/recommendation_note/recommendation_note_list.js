frappe.listview_settings['Recommendation Note'] = {
    add_fields: ['rn_status'],
    has_indicator_for_draft:1,
    get_indicator: function(doc){
        if(doc.rn_status == "Draft"){
            return [__("Draft"), "red", "status,=,Draft"];
        }
        if(doc.rn_status == "Verified"){
            return [__("Verified"), "orange", "status,=,Verified"];
        }
        if(doc.rn_status == "Approved"){
            return [__("Approved"), "green", "status,=,Aproved"];
        }
    }
}