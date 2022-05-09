import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import createNewBuilding from '@salesforce/apex/BuildingHandler.createNewBuilding'


export default class AddNewBuilding extends LightningElement {
    building = {
        name: '',
        address1: '',
        address2: '',
        pincode: '',
        city: '',
        state: '',
        contact_name: '',
        contact_phone_number: '',
        contact_email: ''
    }

    buildingDetailsHandler(event) {
        let id = event.target.dataset.id
        let detail = event.target.value
        switch (id) {
            case 'building_name': this.building.name = detail
                break
            case 'address1': this.building.address1 = detail
                break
            case 'address2': this.building.address2 = detail
                break
            case 'pincode': this.building.pincode = detail
                break
            case 'state': this.building.state = detail
                break
            case 'city': this.building.city = detail
                break
            case 'contactName': this.building.contact_name = detail
                break
            case 'contatPhoneNumber': this.building.contact_phone_number = detail
                break
            case 'contatEmail': this.building.contact_email = detail
                break
        }
    }

    addBuildingHandler() {
        console.log('Building => ', this.building)
        createNewBuilding({
            buildWrap: JSON.stringify(this.building)
        }).then(resp => {
            this.dispatchEvent(new ShowToastEvent({
                title: this.building.name,
                message: 'was added successfully',
                variant: 'success'
            }))
        }).catch(err => {
            this.dispatchEvent(new ShowToastEvent({
                title: this.building.name,
                message: 'was not added successfully',
                variant: 'error'
            }))
            console.log(err)
        })
        this.template.querySelectorAll('lightning-input[data-id]').forEach(e => e.value = null);
    }
}