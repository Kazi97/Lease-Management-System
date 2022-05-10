import { LightningElement, wire } from 'lwc';
import { getPicklistValues } from 'lightning/uiObjectInfoApi'
import { getObjectInfo } from 'lightning/uiObjectInfoApi'
import LEASE_CONTRACT from '@salesforce/schema/Lease_Contract__c'
import STATUS from '@salesforce/schema/Lease_Contract__c.Status__c'
import getBuildings from '@salesforce/apex/BuildingHandler.getBuildings';
import getFlatsByBuildingId from '@salesforce/apex/BuildingHandler.getFlatsByBuildingIdAndFlatName';
import getTenants from '@salesforce/apex/BuildingHandler.getTenants';

export default class CreateContract extends LightningElement {

    enablePrevButton
    bttnLabel = 'Next'
    step = 1
    current_step = 1

    step1detail = true
    step2detail = false
    step3detail = false
    step4detail = false
    step5detail = false

    step1 = true
    step2 = false
    step3 = false
    step4 = false
    step5 = false


    @wire(getObjectInfo, {
        objectApiName : LEASE_CONTRACT
    })leaseContractMetadata

    @wire(getPicklistValues, {
        recordTypeId : '$leaseContractMetadata.data.defaultRecordTypeId',
        fieldApiName : STATUS
    })statusPicklist

    @wire(getBuildings, {
        buildingName : ''
    })wiredBuildingList({data,error}){
        if(data){

        }else if(error){

        }
    }

    @wire(getTenants, {
        name : ''
    })wiredTenantList({data,error}){
        
    }

    nextStateChangeHandler() {
        if (this.step == 1) {
            this.step++
            this.enablePrevButton = true
        }
        else if (this.step > 1 && this.step <= 4) {
            if (this.step == 4) {
                this.step++
                this.bttnLabel = 'Finish'
            }
            else {
                this.step++
                this.bttnLabel = 'Next'
            }
        }

        this.current_step = this.step.toString()
        console.log('next -> ', this.current_step)

        this.setSteps(this.step)
    }

    previousStateChangeHandler() {
        if (this.step == 2) {
            this.step--
            this.enablePrevButton = false
        }

        if (this.step >= 2) {
            this.step--
            this.bttnLabel = 'Next'
        }

        this.current_step = this.step.toString()
        console.log('prev -> ', this.current_step)

        this.setSteps(this.step)
    }

    setSteps(val) {
        switch (val) {
            case 1: {
                this.step1detail = true
                this.step2detail = false
                this.step3detail = false
                this.step4detail = false
                this.step5detail = false

                this.step1 = true
                this.step2 = false
                this.step3 = false
                this.step4 = false
                this.step5 = false
            } break
            case 2: {
                this.step1detail = false
                this.step2detail = true
                this.step3detail = false
                this.step4detail = false
                this.step5detail = false

                this.step1 = false
                this.step2 = true
                this.step3 = false
                this.step4 = false
                this.step5 = false
            } break
            case 3: {
                this.step1detail = false
                this.step2detail = false
                this.step3detail = true
                this.step4detail = false
                this.step5detail = false

                this.step1 = false
                this.step2 = false
                this.step3 = true
                this.step4 = false
                this.step5 = false
            } break
            case 4: {
                this.step1detail = false
                this.step2detail = false
                this.step3detail = false
                this.step4detail = true
                this.step5detail = false

                this.step1 = false
                this.step2 = false
                this.step3 = false
                this.step4 = true
                this.step5 = false
            } break
            case 5: {
                this.step1detail = false
                this.step2detail = false
                this.step3detail = false
                this.step4detail = false
                this.step5detail = true

                this.step1 = false
                this.step2 = false
                this.step3 = false
                this.step4 = false
                this.step5 = true
            }
        }
    }
}