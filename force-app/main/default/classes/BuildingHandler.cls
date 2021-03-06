public with sharing class BuildingHandler {

    @AuraEnabled
    public static void createNewBuilding(String buildWrap){

        System.debug('Wrapper Building=>'+buildWrap);
        BuildingWrapper wrapper = (BuildingWrapper)JSON.deserialize(buildWrap, BuildingWrapper.class);
        if(wrapper != null){  
            Building__c building = new Building__c();          
            building.Name = wrapper.name;
            building.Address_Line_1__c = wrapper.address1;
            building.Address_Line_2__c = wrapper.address2;
            building.State__c = wrapper.state;
            building.Pincode__c = wrapper.pincode;
            building.City__c = wrapper.city;
            building.Contact_Name__c = wrapper.contact_name;
            building.Contact_Phone_Number__c = wrapper.contact_phone_number;
            building.Contact_Email__c = wrapper.contact_email;
            System.debug('Building=>'+building);
            insert building;
        }
   }

   @AuraEnabled
   public static void createFlat(String wrapperFlat){
        FlatWrapper wrapper = (FlatWrapper)JSON.deserialize(wrapperFlat, FlatWrapper.class);
        if(wrapper != null){
            Flat__c flat = new Flat__c();
            flat.Name = wrapper.name;
            flat.Address_Line_1__c = wrapper.address1;
            flat.Address_Line_2__c = wrapper.address2;
            flat.Pincode__c = wrapper.pincode;
            flat.City__c = wrapper.city;
            flat.State__c = wrapper.state;
            flat.Building__c = wrapper.buildingId;
            flat.Number_of_Stories__c = wrapper.no_of_stories;
            flat.Rooms_per_Floor__c = wrapper.rooms_per_floor;
            flat.Flat_Owner_Name__c = wrapper.flat_owner_name;
            flat.Flat_Owner_Phone__c = wrapper.flat_owner_phone;
            flat.Flat_Owner_Email__c = wrapper.flat_owner_email;
            insert flat;
        }
   }

   @AuraEnabled
   public static void addTenant(String wrapperTenant){
       TenantWrapper wrapper = (TenantWrapper)JSON.deserialize(wrapperTenant, TenantWrapper.class);
       if(wrapper != null){
           Tenant__c tenant = new Tenant__c();
           tenant.Name = wrapper.name;
           tenant.Phone_Number__c = wrapper.phone;
           tenant.Email__c = wrapper.email;
           tenant.Date_of_Birth__c = wrapper.dob;
           tenant.Govt_Document_Type__c = wrapper.gov_doc;
           tenant.Govt_Id_Proof_Number__c = wrapper.gov_id_number;
           insert tenant;
       }
   }

   @AuraEnabled
   public static String createContract(String wrapperContract){
       String contractId = '';
       ContractWrapper wrapper = (ContractWrapper)JSON.deserialize(wrapperContract, ContractWrapper.class);
       System.debug('Wrapper => '+wrapper);
       if(wrapper != NULL){
           Lease_Contract__c contract = new Lease_Contract__c();
           contract.Tenant_Name__c = wrapper.tenant;
           contract.Building__c = wrapper.building;
           contract.Flat__c = wrapper.flat;
           contract.Floor__c = Decimal.valueOf(wrapper.floor);
           contract.Room__c = Decimal.valueOf(wrapper.room);
           contract.Status__c = wrapper.status;
           contract.Start_Date__c = Date.valueOf(wrapper.startdate);
           contract.End_Date__c = Date.valueOf(wrapper.enddate);
           insert contract;

           contractId = contract.Id;
        }
        
        System.debug('Contract => '+contractId);
        return contractId;
   }

   @AuraEnabled(cacheable=true)
   public static List<Building__c> getBuildings(String buildingName){

        if(String.isBlank(buildingName)){
            return [SELECT Id,Name,Building_Number__c,Address_Line_1__c,Address_Line_2__c,Pincode__c,City__c,State__c,Contact_Name__c,Contact_Phone_Number__c,Contact_Email__c
                    FROM Building__c 
                    ORDER BY Name
                    LIMIT 10];
        }else{
            buildingName = '%'+buildingName+'%';
            return [SELECT Id,Name,Building_Number__c,Address_Line_1__c,Address_Line_2__c,Pincode__c,City__c,State__c,Contact_Name__c,Contact_Phone_Number__c,Contact_Email__c
                    FROM Building__c
                    WHERE Name LIKE :buildingName
                    ORDER BY Name 
                    LIMIT 10];
        }
   }

   @AuraEnabled(cacheable=true)
   public static List<Flat__c> getFlatsByBuildingIdAndFlatName(String buildingId, String flatName){
       if(!String.isBlank(buildingId) && (String.isBlank(flatName) || flatName == NULL || flatName.length() <= 0)){
            return [SELECT Id,Name,Number_of_Stories__c,Rooms_per_Floor__c,Total_Rooms__c,Rooms_Booked__c,Rooms_Unbooked__c 
                    FROM Flat__c 
                    WHERE Building__c = :buildingId
                    ORDER BY Name
                    LIMIT 10];
       }else if(!String.isBlank(buildingId) && !String.isBlank(flatName)){
           flatName = '%'+flatName+'%';
           return [SELECT Id,Name,Number_of_Stories__c,Rooms_per_Floor__c,Total_Rooms__c,Rooms_Booked__c,Rooms_Unbooked__c 
                    FROM Flat__c 
                    WHERE Building__c = :buildingId
                    AND Name LIKE :flatName
                    ORDER BY Name
                    LIMIT 10];
       }else {
           return null;
       }
   }

   @AuraEnabled(cacheable=true)
   public static List<Tenant__c> getTenants(String name){
       if (!String.isBlank(name)) {
           name = '%'+name+'%';
           return [SELECT Id,Name,Phone_Number__c,Age__c
                    FROM Tenant__c 
                    WHERE Name LIKE :name
                    ORDER BY Name
                    LIMIT 10];
       }else{
           return [SELECT Id,Name,Phone_Number__c,Age__c 
                    FROM Tenant__c
                    ORDER BY Name
                    LIMIT 10];
       }
   }

   @AuraEnabled(cacheable=true)
   public static Map<Integer,List<Integer>> getUnreservedRooms(String flatId){
       List<Lease_Contract__c> contracts = [SELECT Id,Floor__c,Room__c FROM Lease_Contract__c WHERE Flat__c = :flatId];
       Flat__c flat = [SELECT Id,Number_of_Stories__c,Rooms_per_Floor__c FROM Flat__c WHERE Id = :flatId];

       Map<Integer,List<Integer>> availableRooms = new Map<Integer,List<Integer>>();
       if(flat != NULL){
            for(Integer i = 1; i <= flat.Number_of_Stories__c; i++){
                availableRooms.put(i,new List<Integer>());
                for(Integer j = 1; j<= Integer.valueOf(flat.Rooms_per_Floor__c); j++){
                    availableRooms.get(i).add(j);
                }
            }
        }

        if((availableRooms != NULL && !availableRooms.isEmpty()) && (contracts != NULL && !contracts.isEmpty())){
            for(Lease_Contract__c contract : contracts){
                List<Integer> temp = availableRooms.get(Integer.valueOf(contract.Floor__c));
                temp.remove(temp.indexOf(Integer.valueOf(contract.Room__c)));
                availableRooms.remove(Integer.valueOf(contract.Floor__c));
                availableRooms.put(Integer.valueOf(contract.Floor__c),temp);
            }
        }
        if(availableRooms != NULL && !availableRooms.isEmpty()){
            return availableRooms;
        }  
        return NULL;      
    }

    public class BuildingWrapper{
        @AuraEnabled
        public String name;
        @AuraEnabled
        public String address1;
        @AuraEnabled
        public String address2;
        @AuraEnabled
        public Integer pincode;
        @AuraEnabled
        public String city;
        @AuraEnabled
        public String state;
        @AuraEnabled
        public String contact_name;
        @AuraEnabled
        public String contact_phone_number;
        @AuraEnabled
        public String contact_email;
    }

    public class FlatWrapper{
        @AuraEnabled
        public String name;
        @AuraEnabled
        public String address1;
        @AuraEnabled
        public String address2;
        @AuraEnabled
        public Integer pincode;
        @AuraEnabled
        public String city;
        @AuraEnabled
        public String state;
        @AuraEnabled
        public String buildingId;
        @AuraEnabled
        public Integer no_of_stories;
        @AuraEnabled
        public Integer rooms_per_floor;
        @AuraEnabled
        public String flat_owner_name;
        @AuraEnabled
        public String flat_owner_phone;
        @AuraEnabled
        public String flat_owner_email;
    }

    public class TenantWrapper{
        @AuraEnabled
        public String name;
        @AuraEnabled
        public String phone;
        @AuraEnabled
        public String email;
        @AuraEnabled
        public Date dob;
        @AuraEnabled
        public String gov_doc;
        @AuraEnabled
        public String gov_id_number;
    }

    public class ContractWrapper{
        @AuraEnabled
        public String tenant;	
        @AuraEnabled
        public String tenant_name;
        @AuraEnabled	
        public String building;	
        @AuraEnabled
        public String building_name;
        @AuraEnabled
        public String flat;
        @AuraEnabled
        public String flat_name;	
        @AuraEnabled
        public String floor;	
        @AuraEnabled
        public String room;	
        @AuraEnabled
        public String status;	
        @AuraEnabled
        public String startdate;	
        @AuraEnabled
        public String enddate;
    }
}
