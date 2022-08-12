# Copyright (c) 2022, Saranesh and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class MOPLog(Document):
    def validate(self):
        mop_log = frappe.get_all("MOP Log",{'department':['in',(self.department)],'month':['in',(self.month)]},pluck ='name')
        if mop_log != None and self.name in mop_log:
            pass
        if mop_log:
            if self.name in mop_log:
                pass
            else:
                frappe.throw("Alert")
            
        for i in self.mop_details:
            if(i.current_month_data == None):
                frappe.throw("Current Month Data cannot be Empty")
            if (i.minimum > i.current_month_data and i.reason == None):
                frappe.throw("Enter the Reason")
            if(i.current_month_data > i.maximum and i.reason == None):
                frappe.throw("Enter the Reason")
        

@frappe.whitelist()
def get_config(department):
    mop_config_list = []
    config_list = frappe.get_all("MOP Configuration",{'department':['in',(department)]},pluck = 'name')
    for config in config_list:
        details = frappe.get_doc("MOP Configuration",config)
        for row in details.mop_details:
            final_dict = {}
            final_dict['name1'] = row.name1
            final_dict['date_of_joining'] = row.date_of_joining
            final_dict['salary'] = row.salary
            final_dict['mode_of_payment'] = row.mode_of_payment
            final_dict['minimum'] = row.minimum
            final_dict['maximum'] = row.maximum
            mop_config_list.append(final_dict)
    return mop_config_list