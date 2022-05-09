import { LightningElement, wire } from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import TENANT from '@salesforce/schema/Tenant__c'
import GOV_DOC_TYPE from '@salesforce/schema/Tenant__c.Govt_Document_Type__c'
import addTenant from '@salesforce/apex/BuildingHandler.addTenant'
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class AddTenant extends LightningElement {
    govtDocPicklist
    tenant = {
        name: '',
        phone: '',
        email: '',
        dob: '',
        gov_doc: '',
        gov_id_number: ''
    }

    @wire(getObjectInfo, {
        objectApiName: TENANT
    }) tenantMetadata

    @wire(getPicklistValues, {
        recordTypeId: '$tenantMetadata.data.defaultRecordTypeId',
        fieldApiName: GOV_DOC_TYPE
    }) govDocPickListVal({ data, error }) {
        if (data) {
            this.govtDocPicklist = data.values
            console.log('Data =>', this.govtDocPicklist)
        } else if (error) {
            console.log('Error =>', error)
        }
    }

    tenantDetailHandler(event) {

        let dataId = event.target.dataset.id
        let details = event.target.value
        switch (dataId) {
            case 'tenant_name': this.tenant.name = details
                break;
            case 'tenant_phone_number': this.tenant.phone = details
                break;
            case 'tenant_email': this.tenant.email = details
                break;
            case 'tenant_dob': this.tenant.dob = details
                break;
            case 'tenant_gov_doc_type': this.tenant.gov_doc = details
                break;
            case 'tenant_govt_id_proof': this.tenant.gov_id_number = details
                break;
        }
    }

    addTenantDetailHandler() {
        console.log('Tenant => ', this.tenant)
        addTenant({
            wrapperTenant: JSON.stringify(this.tenant)
        }).then(() => {
            this.dispatchEvent(new ShowToastEvent({
                title: this.tenant.name,
                message: 'was added successfully',
                variant: 'success'
            }))
        }).catch(err => {
            this.dispatchEvent(new ShowToastEvent({
                title: this.tenant.name,
                message: 'was not added successfully',
                variant: 'error'
            }))
            console.log(err)
        })
        this.template.querySelectorAll('lightning-input[data-id]').forEach(e => e.value = null)
    }
}