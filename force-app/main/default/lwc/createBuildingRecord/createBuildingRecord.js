import { LightningElement } from 'lwc';


export default class CreateBuildingRecord extends LightningElement {


    options = [{
        label: 'New Building', value: 'new_building'
    },
    {
        label: 'Flat', value: 'flat',
    }]

    building = false
    flat = false
    propertyTypeHandler(event){
        console.log(event.target.value)
        let val = event.target.value
        if(val === 'new_building'){
            this.flat = false
            this.building = true
        }
        else if(val === 'flat'){
            this.building = false
            this.flat = true            
        }
    }
}