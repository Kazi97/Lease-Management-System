import { LightningElement } from 'lwc';
import getBuildings from '@salesforce/apex/BuildingHandler.getBuildings';
import getFlatsByBuildingId from '@salesforce/apex/BuildingHandler.getFlatsByBuildingId';

export default class CreateContract extends LightningElement {
    contractDetails = {
        building_id: '',
        flat_id: '',
        tenant_name: ''
    }
    isFlat = false
    buildingList
    flatList
    flatOptions = {}
    selectedFlatDetails


    contractDatahandler(event) {
        let dataId = event.target.dataset.id
        let data
        if (event.keyCode === 13) {
            data = event.target.value
            if (dataId === 'building_name') {
                this.getBuildingDetails(data)
            }
        } else {
            data = event.target.value
            if (dataId === 'selected_flat') {
                console.log('Flat Id ---> ', data)
                this.searchSelectedFlatDetails(data)
            }
        }
    }

    getBuildingDetails(building) {
        getBuildings({
            buildingName: building
        }).then(resp => {
            this.buildingList = resp
        }).catch(err => {
            console.log('error ---> ', err)
        })
    }

    setBuildingId(event) {
        this.contractDetails.building_id = event.target.dataset.id
        console.log('Building Id --> ', this.contractDetails.building_id)
        this.getFlatDetails(this.contractDetails.building_id)
    }

    getFlatDetails(buildingId) {
        getFlatsByBuildingId({
            buildingId: buildingId
        }).then(resp => {
            console.log('Flats ---> ', resp)
            this.flatList = resp
            this.createFlatOptions(resp)
        }).catch(err => {
            console.log(err)
        })
    }

    createFlatOptions(data) {       
        data.forEach(e => {
            this.flatOptions.label = e.Name
            this.flatOptions.value = e.Id
        })
        this.isFlat = true
    }

    searchSelectedFlatDetails(data){
        this.flatList.every(e => {
            if(e.Id === data){
                this.selectedFlatDetails = e
                return false
            }
            return true
        })
        console.log('Selected Flat ---> ',this.selectedFlatDetails)
    }
}