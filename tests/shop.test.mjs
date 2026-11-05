import {shopAddressInput,shopEnquiryInput,mayCancelShopOrder} from "../supabase/functions/_shared/shop-model.ts";
import test from 'node:test';
import assert from 'node:assert/strict';
import {equipmentTotals,equipmentProfiles} from '../src/data/equipmentStore.ts';
import {resolveInvoiceBuyer,missingInvoiceBuyer} from '../src/lib/invoice-buyer.ts';
import {emptyProfile} from '../src/lib/panel-model.ts';
import {equipmentEnquiryDraft} from '../src/lib/shop-enquiry-handoff.ts';
import {equipmentInvoice} from '../src/lib/retail-invoice.ts';
import {invoiceTotals} from '../src/lib/billing.ts';
import {equipmentWarranty} from '../src/data/equipmentStore.ts';

test('shop handoff contains reference selections only, rejects stale/forged lines and never forwards prices',()=>{
 const raw=JSON.stringify({at:1000,lines:[{id:'core-24-stock',quantity:2,price:1,paid:true}]});
 const text=equipmentEnquiryDraft(raw,false,2000);assert.ok(text.includes('core-24-stock'));assert.ok(text.includes('× 2'));assert.ok(!text.includes('paid'));assert.ok(!text.includes('price'));
 assert.equal(equipmentEnquiryDraft(raw,false,3601001),'');
 for(const line of [{id:'missing',quantity:1},{id:'core-24-stock',quantity:0},{id:'core-24-stock',quantity:1.5}])assert.equal(equipmentEnquiryDraft(JSON.stringify({at:1000,lines:[line]}),false,2000),'');
});
test('new company proformas prefer registered details, while issued snapshots retain their buyer',()=>{
 const registered={...emptyProfile,kind:'company',name:'Company representative',company:'Registered example Ltd',nationalId:'12345678901',economicCode:'123456',registrationNumber:'42',postalCode:'1234567890',address:'Example address'};
 const draft={id:'draft',status:'Unpaid',buyer:{...registered,company:'Old company draft'}};
 assert.equal(resolveInvoiceBuyer(draft,registered).company,registered.company);
 assert.equal(resolveInvoiceBuyer({...draft,status:'Paid'},registered).company,'Old company draft');
 assert.equal(resolveInvoiceBuyer({...draft,officialNumber:'INV-42'},registered).company,'Old company draft');
 assert.deepEqual(missingInvoiceBuyer(registered),[]);
 assert.ok(missingInvoiceBuyer({...registered,registrationNumber:''}).includes('registrationNumber'));
});
test('equipment preview totals use integer quantities and 10% sample VAT without live inventory claims',()=>{
 const p=equipmentProfiles[0],result=equipmentTotals([{id:p.id,quantity:2}]);assert.equal(result.subtotal,p.price*2);assert.equal(result.tax,Math.round(result.subtotal*.1));assert.equal(result.total,result.subtotal+result.tax);
 for(const quantity of [0,-1,1.5,100,NaN])assert.throws(()=>equipmentTotals([{id:p.id,quantity}]));assert.throws(()=>equipmentTotals([{id:'invented',quantity:1}]));assert.equal(equipmentTotals([]).total,0);
});

test('store enquiry accepts requirements, never browser prices or fulfillment states',()=>{
 const result=shopEnquiryInput({description:'A real equipment requirement for review',quantity:2,total_toman:1,status:'paid',tracking:'fake',user_id:'other'});assert.deepEqual(result,{description:'A real equipment requirement for review',quantity:2,addressId:null});
 assert.throws(()=>shopEnquiryInput({description:'Too short',quantity:1}));for(const quantity of [0,-1,1.5,100])assert.throws(()=>shopEnquiryInput({description:'Equipment requirement',quantity}));
 assert.equal(mayCancelShopOrder('requested'),true);for(const status of ['paid','shipped','delivered','quoted','cancelled'])assert.equal(mayCancelShopOrder(status),false);
});
test('store addresses normalize localized postcodes and discard caller identity fields',()=>{
 const address=shopAddressInput({recipient:'Example Customer',city:'Tehran',street:'Example street number 123',postalCode:'۱۲۳۴۵۶۷۸۹۰',user_id:'other',id:'forged',country:'XX'});assert.equal(address.postalCode,'1234567890');assert.equal(address.country,'IR');assert.equal('user_id' in address,false);assert.equal('id' in address,false);assert.throws(()=>shopAddressInput({recipient:'A',city:'T',street:'Short',postalCode:'123'}));
});
test('retail preview uses the same integer quantities, currency and VAT totals as its cart',()=>{
 const lines=[{id:'core-24-stock',quantity:2},{id:'link-10',quantity:1}], expected=equipmentTotals(lines);
 for(const fa of [true,false]) {const {invoice,retail}=equipmentInvoice(lines,'2026-10-27',fa);assert.equal(invoice.currency,'TOMAN');assert.equal(invoice.tax,expected.tax);assert.equal(invoiceTotals(invoice).total,expected.total);assert.equal(invoice.demo,true);assert.equal(invoice.status,'Unpaid');assert.equal(invoice.proforma,true);assert.equal(retail.lines[0].sku,'core-24-stock');assert.equal(retail.lines[0].condition,fa?'استوک':'Pre-owned');assert.deepEqual(retail.lines[0].serials,[]);assert.equal(invoice.officialNumber,undefined);}
 for(const quantity of [0,-1,1.5,100,NaN])assert.throws(()=>equipmentInvoice([{id:'edge-8',quantity}],'2026-10-27',true));
});


test('pre-owned reference warranty cannot claim duration or provider before verification',()=>{
 const used=equipmentProfiles.filter(p=>p.condition==='used');assert.equal(used.length,2);for(const p of used){assert.equal(p.warranty.verified,false);assert.equal(p.warranty.months,null);assert.equal(p.warranty.provider,null);assert.ok(equipmentWarranty(p,false).includes('pending'));assert.ok(equipmentWarranty({...p,warranty:{...p.warranty,verified:false,months:12,provider:'Unverified'}},false).includes('pending'));}
 const verified={...used[0],warranty:{available:true,verified:true,months:12,provider:'Verified provider'}};assert.equal(equipmentWarranty(verified,false),'12 months · Verified provider');
});
