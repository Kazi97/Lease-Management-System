import { LightningElement } from 'lwc';
import getBuildings from '@salesforce/apex/BuildingHandler.getBuildings'
import createFlat from '@salesforce/apex/BuildingHandler.createFlat'
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class AddNewFlat extends LightningElement {
    isBuilding = false
    getBuildings = false
    buildingList
    building = {}
    flat = {
        name: '',
        address1: '',
        address2: '',
        pincode: '',
        city: '',
        state: '',
        no_of_stories: '',
        rooms_per_floor: '',
        flat_owner_name: '',
        flat_owner_phone: '',
        flat_owner_email: '',
        buildingId: ''
    }

    handleSearch(event) {
        if (event.keyCode === 13) {
            let searchTerm = event.target.value
            if (searchTerm.length > 0) this.searchBuilding(searchTerm)
            else this.buildingList = []
        }
    }

    searchBuilding(searchTerm) {
        console.log('Search Term -> ', searchTerm)
        getBuildings({
            buildingName: searchTerm
        }).then(resp => {
            this.buildingList = resp
            console.log('Building List => ', this.buildingList)
        }).catch(err => {
            this.buildingList = undefined
            console.log(err)
        })
    }

    getBuildingDetail(event) {
        let buildingId = event.target.dataset.id
        console.log('Building Id => ', buildingId)
        let tempArr = this.buildingList
        let selectedBuilding = ''
        tempArr.every(e => {
            if (e.Id === buildingId) {
                selectedBuilding = e
                return false
            }
            return true
        })
        console.log('Selected Building => ', selectedBuilding)

        this.building.name = selectedBuilding.Name
        this.building.building_number = selectedBuilding.Building_Number__c
        this.building.city = selectedBuilding.City__c
        this.building.state = selectedBuilding.State__c
        this.building.pincode = selectedBuilding.Pincode__c
        this.building.contact_person = selectedBuilding.Contact_Name__c
        this.building.phone = selectedBuilding.Contact_Phone_Number__c
        this.building.id = selectedBuilding.Id

        this.isBuilding = true
    }

    buildingChangeHandler() {
        this.isBuilding = false
    }

    flatDetailsHandler(event) {
        let dataId = event.target.dataset.id
        let detail = event.target.value
        switch (dataId) {
            case 'flat_name': this.flat.name = detail
                break;
            case 'address1': this.flat.address1 = detail
                break;
            case 'address2': this.flat.address2 = detail
                break;
            case 'pincode': this.flat.pincode = detail
                break;
            case 'city': this.flat.city = detail
                break;
            case 'state': this.flat.state = detail
                break;
            case 'no_of_stories': this.flat.no_of_stories = detail
                break
            case 'rooms_per_floor': this.flat.rooms_per_floor = detail
                break
            case 'flat_owner_name': this.flat.flat_owner_name = detail
                break
            case 'flat_owner_phone': this.flat.flat_owner_phone = detail
                break
            case 'flat_owner_email': this.flat.flat_owner_email = detail
                break
        }
    }

    addFlatHandler(){
        this.flat.buildingId = this.building.id
        console.log('Flat Details => ',this.flat)
        createFlat({
            wrapperFlat : JSON.stringify(this.flat)
        }).then(() => {
            this.dispatchEvent(new ShowToastEvent({
                title: this.flat.name,
                message: 'was added successfully',
                variant: 'success'
            }))
        }).catch(err => {
            this.dispatchEvent(new ShowToastEvent({
                title: this.flat.name,
                message: 'was not added successfully',
                variant: 'error'
            }))
            console.log(err)
        })

        this.template.querySelectorAll('lightning-input[data-id]').forEach(e => e.value = null);
        this.building = {}
        this.isBuilding = false
    }

}