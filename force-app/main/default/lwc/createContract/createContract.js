import { LightningElement, wire } from 'lwc';
import { getPicklistValues } from 'lightning/uiObjectInfoApi'
import { getObjectInfo } from 'lightning/uiObjectInfoApi'
import LEASE_CONTRACT from '@salesforce/schema/Lease_Contract__c'
import STATUS from '@salesforce/schema/Lease_Contract__c.Status__c'
import getBuildings from '@salesforce/apex/BuildingHandler.getBuildings';
import getFlatsByBuildingIdAndFlatName from '@salesforce/apex/BuildingHandler.getFlatsByBuildingIdAndFlatName';
import getTenants from '@salesforce/apex/BuildingHandler.getTenants';
import getUnreservedRooms from '@salesforce/apex/BuildingHandler.getUnreservedRooms'
import createContract from '@salesforce/apex/BuildingHandler.createContract'
import { ShowToastEvent } from 'lightning/platformShowToastEvent'
import { NavigationMixin } from 'lightning/navigation'

export default class CreateContract extends NavigationMixin(LightningElement) {

    contract = {
        tenant: '',
        tenant_name: '',
        building: '',
        building_name: '',
        flat: '',
        flat_name: '',
        floor: '',
        room: '',
        status: '',
        startdate: '',
        enddate: ''
    }

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
        objectApiName: LEASE_CONTRACT
    }) leaseContractMetadata

    @wire(getPicklistValues, {
        recordTypeId: '$leaseContractMetadata.data.defaultRecordTypeId',
        fieldApiName: STATUS
    }) statusPicklist

    contractDetailHandler(event) {
        let dataId = event.target.dataset.id
        let detail = event.target.value
        switch (dataId) {
            case 'building_name': this.searchBuilding(detail)
                break;
            case 'flat_name': this.searchFlat(detail)
                break;
            case 'tenant_name': this.searchTenant(detail)
                break;
            case 'floor': this.contract.floor = detail
                break
            case 'room': this.contract.room = detail
                break
            case 'status': this.contract.status = detail
                break
            case 'start_date': this.contract.startdate = detail
                break
            case 'end_date': this.contract.enddate = detail
                break
        }
    }

    buildingList
    isBuildingListAvailable = false
    searchBuilding(val) {
        if (val.length > 0) {
            getBuildings({
                buildingName: val
            }).then(resp => {
                this.buildingList = resp
                this.isBuildingListAvailable = true
            }).catch(err => {
                console.log('err => ', err)
                this.buildingList = err
            })
        } else {
            this.isBuildingListAvailable = false
        }
    }

    isBuildingSelected = false
    selectedBuildingHandler(event) {
        let buildingName = ''
        let buildingId = event.target.dataset.id
        this.buildingList.every(e => {
            if (e.Id === buildingId) {
                buildingName = e.Name
                return false
            }
            return true
        })
        this.contract.building = buildingId
        this.contract.building_name = buildingName
        this.isBuildingSelected = true
    }

    changeBuildingHandler() {
        this.isBuildingSelected = false
        this.isBuildingListAvailable = false
        this.isFlatSelected = false
        this.isAvailableRooms = false
        this.contract.building = ''
        this.contract.building_name = ''
        this.buildingList = ''
        this.contract.flat_name = ''
        this.flatList = ''
        this.availableRooms = []
    }

    flatList
    isFlatListAvailable = false
    searchFlat(val) {
        if (val.length > 0) {
            getFlatsByBuildingIdAndFlatName({
                buildingId: this.contract.building,
                flatName: val
            }).then(resp => {
                this.flatList = resp
                this.isFlatListAvailable = true
            }).catch(err => {
                console.log(err)
            })
        } else {
            this.isFlatListAvailable = false
        }
    }

    isFlatSelected = false
    selectedFlatHandler(event) {
        let flat
        let flatId = event.target.dataset.id
        this.flatList.every(e => {
            if (flatId === e.Id) {
                flat = e.Name
                return false
            }
            return true
        })
        this.contract.flat = flatId
        this.contract.flat_name = flat
        this.isFlatSelected = true
        console.log('flat Id => ', this.contract.flat)
        console.log('flat name => ', this.contract.flat_name)
    }

    changeFlatHandler() {
        this.isFlatListAvailable = false
        this.isFlatSelected = false
        this.isAvailableRooms = false
        this.contract.flat = ''
        this.contract.flat_name = ''
        this.flatList = ''
        this.availableRooms = []
    }

    tenantList
    isTenantListAvailable = false
    searchTenant(val) {
        if (val.length > 0) {
            console.log('Val =>', val)
            getTenants({
                name: val
            }).then(resp => {
                this.tenantList = resp
                console.log('Tenant list => ', this.tenantList)
                this.isTenantListAvailable = true
            }).catch(err => {
                console.log(err)
            })
        } else {
            this.isTenantListAvailable = false
        }
    }

    isTenantSelected = false
    selectedTenantHandler(event) {
        let tenant
        let tenantId = event.target.dataset.id
        this.tenantList.every(e => {
            if (tenantId === e.Id) {
                tenant = e.Name
                return false
            }
            return true
        })
        this.contract.tenant = tenantId
        this.contract.tenant_name = tenant
        this.isTenantSelected = true
        console.log('tenant Id => ', this.contract.tenant)
        console.log('tenant name => ', this.contract.tenant_name)
    }

    changeTenantHandler() {
        this.isTenantListAvailable = false
        this.isTenantSelected = false
        this.contract.tenant = ''
        this.contract.tenant_name = ''
        this.tenantList = ''
    }

    availableRooms = []
    isAvailableRooms = false
    getavailableRoomHandler(){
        getUnreservedRooms({
            flatId : this.contract.flat
        }).then(resp => {
            if(resp != null){
                for(let key in resp){
                    this.availableRooms.push(
                        {
                            value: resp[key],
                            key : key
                        }
                    )
                }
                this.isAvailableRooms = true
            }
            console.log('Available rooms => ',this.availableRooms)
        }).catch(err => {
            console.log(err)
        })
    }

    submitContractRecord(){
        console.log('Contract Records => ',this.contract)

        createContract({
            wrapperContract : JSON.stringify(this.contract)
        }).then(resp => {
            console.log('Id => ',resp)
            
            this.dispatchEvent(new ShowToastEvent({
                title: 'Contract Created',
                message: resp,
                variant: 'success'
            }))
            
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: resp,
                    objectApiName: 'Lease_Contract__c',
                    actionName: 'view'
                },
            })
        }).catch(err => {
            console.log(err)
            this.dispatchEvent(new ShowToastEvent({
                title: 'Contract creation failed',
                message: 'Try Again',
                variant: 'error'
            }))
        })

        this.contract = {
            tenant: '',
            tenant_name: '',
            building: '',
            building_name: '',
            flat: '',
            flat_name: '',
            floor: '',
            room: '',
            status: '',
            startdate: '',
            enddate: ''
        }
        this.buildingList = ''
        this.isBuildingListAvailable = false
        this.isBuildingSelected = false
        this.flatList = ''
        this.isFlatListAvailable = false
        this.isFlatSelected = false
        this.tenantList = ''
        this.isTenantListAvailable = false
        this.isTenantSelected = false
        this.availableRooms = []
        this.isAvailableRooms = false
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
        else if (this.step == 5){
            alert('Are you sure?')
            this.submitContractRecord()
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