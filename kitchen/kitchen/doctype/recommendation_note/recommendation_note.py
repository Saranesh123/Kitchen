# Copyright (c) 2022, Saranesh and contributors
# For license information, please see license.txt

from unicodedata import name
import frappe
from frappe.model.document import Document
from datetime import date
from frappe.utils import today
from erpnext.setup.utils import (get_exchange_rate, add_days)
import json

class RecommendationNote(Document):
    def validate(self):
        if self._action == "save":
            self.rn_status = "Draft"
        
        if self._action == "submit":
            if self.rn_type == "Permanent" and self.built_type == "Standard":
                item_price =frappe.new_doc("Item Price")
                for row in self.recommendation_detail:
                    item_price.item_code = row.item_code
                    item_price.price_list = row.price_list
                    item_price.price_list_rate = row.proposed_rate
                    item_price.uom = row.uom
                    item_price.supplier = row.proposed_supplier
                    item_price.valid_from = row.valid_from
                    item_price.save()
                self.rn_status = "Approved"
            if self.rn_type == "Permanent" and self.built_type == "Custom Built":
                if self.rn_status != "Verified":
                    frappe.throw("Verify the RN Type")
                else:
                    self.rn_status = "Approved" 
            self.rn_status = "Approved"
            
    @frappe.whitelist()
    def update_status(self):
        frappe.db.set_value(self.doctype, self.name, "rn_status","Verified")
        return True

                      
@frappe.whitelist()
def get_supplier(item_code):
    supplier_list = frappe.db.sql(""" select name from `tabItem Price` tip where tip.item_code = %s and tip.buying =1 and 
                                  tip.valid_upto is null or tip.valid_upto  >= CURDATE() """,(item_code))
    if len(supplier_list) == 0:
        frappe.throw("There is no Item Price in the List")
    else:
        for column in supplier_list:
            doc = frappe.get_doc("Item Price",column[0])
            latest = doc.valid_from
            for row in supplier_list:
                doc = frappe.get_doc("Item Price",row[0])
                if doc.valid_from >= latest and doc.valid_from <= date.today():
                    latest = doc.valid_from
                    
            if doc.valid_from == latest:
                return(final(doc))

@frappe.whitelist()
def exchange_rate(ex_rate):
    exchange = get_exchange_rate(ex_rate,"INR")
    return exchange

def final(doc):
    final_list = []
    supplier = doc.supplier
    final_dict = {}
    final_dict['supplier'] = doc.supplier
    final_dict['rate'] = doc.price_list_rate
    supplier_curr = frappe.get_doc("Supplier",{'supplier_name':['like',(supplier)]},pluck='name')
    final_dict['supplier_curr'] = supplier_curr.default_currency
    if supplier_curr.default_currency != "INR":
            final_dict['ex_rate'] = get_exchange_rate(supplier_curr.default_currency,"INR")
    final_list.append(final_dict)
    return final_list

@frappe.whitelist()
def create_po(self):
    self = json.loads(self)
    name = str(self["name"])
    final_suppliers_list =frappe.db.sql(""" select distinct proposed_supplier from `tabRecommendation Detail` trd 
                                        inner join `tabRecommendation Note` trn on trd.Parent = trn.name
                                            where trn.name = %s """,(name))
    for data in final_suppliers_list:
        purchase_order = frappe.new_doc("Purchase Order")
        new_items = []
        for row in self.get('recommendation_detail'):
            if row.get('proposed_supplier') in data:
                purchase_order.supplier = row.get('proposed_supplier')
                purchase_order.company = self.get('company')
                purchase_order.set_warehouse = frappe.db.get_value("Stock Settings", None, "default_warehouse")
                items = {
                    'item_code' : row.get('item_code'),
                    'qty' : row.get('ordering_quantity'),
                    'rate' : row.get('proposed_rate'),
                    'schedule_date': add_days(date.today(),2),
                }
                new_items.append(items)
                purchase_order.update({
                'items' : new_items
                })
                purchase_order.save()
                
@frappe.whitelist()
def get_po_qty(item_code):
    return frappe.db.sql(""" select sum(qty) from `tabPurchase Order Item` tpoi inner join `tabPurchase Order` tpo 
                         on tpoi.Parent = tpo.name where tpoi.item_code = %s and tpo.docstatus = 1""",(item_code))[0][0]