const User = require('../models/user');
const PollingUnit = require('../models/pollingunit')

function fetchNthPage(array, pageNumber) {
    const pageSize = 20; // Number of items per page
    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return array.slice(startIndex, endIndex);
  }
const register = {
    key: 'register',
    prompts: [
        {
            template: 'welcome',
            needs_response: true,
            handler: function (response, conversation) {
                return response.trim().toLowerCase() === 'hello';
            }
        },
        {
            template: 'know_your_pu',
            needs_response: true,
            handler: async function (response, conversation) {
                let result = {
                    valid: false,
                    next_prompt: 'collect_pu'
                }
                if (response.trim().toLowerCase() === 'yes') {
                    result.valid = true;
                } else if (response.trim().toLowerCase() === 'no') {
                    let lgas = await PollingUnit.aggregate( [ { $group : { _id : "$lga" } } ] )
                    lgas = JSON.parse(JSON.stringify(lgas));
                    lgas = lgas.map((lga,index)=>{
                        lga.index = index+1;
                        return lga;
                    })
                    result = {
                        valid: true,
                        next_prompt: 'collect_lga',
                        data: {lgas}
                    }
                } else {
                    return false;
                }
                return result;
            }
        },
        {
            template: 'collect_pu',
            needs_response: true,
            handler: async function(response, conversation) {
                const { user } = conversation;
                const puCode = response.trim().replace(/-/g,'/');
                const pattern = /^\d{2}\/\d{2}\/\d{2}\/\d{3}$/;
                switch (puCode) {
                  case "00":
                    return {
                      valid: true,
                      next_prompt: 'know_your_pu',
                      data: user
                    };
                  default:
                    if (!pattern.test(puCode)) {
                      throw new Error(`Polling Unit code ${puCode} is invalid`);
                    }
                    try {
                      const storedPU = await PollingUnit.findOne({ pu_code: puCode });
              
                      if (storedPU) {
                        const { pu_name, lga, ward_name } = storedPU;
                        // Use destructuring to simplify code
                        return {
                          valid: true,
                          next_prompt: 'confirm_details',
                          data: {name: user.name, pu_code: puCode, pu_address: pu_name, lga, ward: ward_name}
                        };
                      } else {
                        return {
                          valid: false,
                          message: `Polling Unit code ${puCode} is not a valid polling unit in Lagos`
                        };
                      }
                    } catch (error) {
                      console.error(`An error occurred while querying the database: ${error.message}`);
                    }
                }
              },
        },
        {
            template: 'collect_lga',
            needs_response: true,
            handler: async function (response, conversation) {
                if(response === "00"){
                    return {
                        valid:true,
                        next_prompt:'know_your_pu',
                        data:conversation.user
                    }
                }
                if(!Number.isInteger(Number(response))){
                    return false;
                }
                response = Number(response);
                let lgas = conversation.lastMessage.data.lgas;
                let selectedLGA;
                if(lgas && Array.isArray(lgas)){
                    for(let i = 0; i < lgas.length; i++){
                        if(response === lgas[i].index){
                            selectedLGA = lgas[i]._id;
                            console.log(selectedLGA);
                            break;
                        }
                    }
                }
                if(!selectedLGA){
                    return false;
                }
                let wards = await  PollingUnit.aggregate( [{ $match: { lga: selectedLGA}}, { $group : { _id : "$ward_name" } } ] );
                if(wards){
                    wards = JSON.parse(JSON.stringify(wards));
                    wards = wards.map((ward,index)=>{
                        ward.index = index+1;
                        return ward;
                    })
                    return {
                        valid: true,
                        next_prompt:'collect_ward',
                        data:{lga:selectedLGA, wards}
                    }
                }
                return false;
            }
        },
        {
            template: 'collect_ward',
            needs_response: true,
            handler: async function (response, conversation) {
                if(response === "00"){
                    let lgas = await PollingUnit.aggregate( [ { $group : { _id : "$lga" } } ] )
                    lgas = JSON.parse(JSON.stringify(lgas));
                    lgas = lgas.map((lga,index)=>{
                        lga.index = index+1;
                        return lga;
                    })
                    result = {
                        valid: true,
                        next_prompt: 'collect_lga',
                        data: {lgas}
                    }
                    return result;
                }
                if(!Number.isInteger(Number(response))){
                    return false;
                }
                response = Number(response);
                let wards = conversation.lastMessage.data.wards;
                let selectedWard;
                if(wards && Array.isArray(wards)){
                    for(let i = 0; i < wards.length; i++){
                        if(response === wards[i].index){
                            selectedWard = wards[i]._id;
                            console.log(selectedWard);
                            break;
                        }
                    }
                }
                if(!selectedWard){
                    return false;
                }
                let pus = await  PollingUnit.aggregate( [{ $match: { ward_name: selectedWard}}, { $group : { _id : "$pu_name" } } ] );
                if(pus){
                    pus = JSON.parse(JSON.stringify(pus));
                    pus = pus.map((pu,index)=>{
                        pu.index = index+1;
                        return pu;
                    })
                    let all_pus = pus;
                    if(pus.length > 20){
                        pus = pus.slice(0, 20);
                    }
                    return {
                        valid: true,
                        next_prompt:'collect_pu_name',
                        data:{ pus, lga: conversation.lastMessage.data.lga, selectedWard, meta:{all: all_pus, page:1} }
                    }
                }
                return false;
            }
        },
        {
            template: 'collect_pu_name',
            needs_response: true,
            handler: async function (response, conversation) {
                let previousMessageData = conversation.lastMessage.data;
                let previousPage = previousMessageData.meta.page;
                let allPUs = previousMessageData.meta.all;
                if(response == '00' && (previousPage === 1)){
                    let wards = await  PollingUnit.aggregate( [{ $match: { lga: previousMessageData.lga}}, { $group : { _id : "$ward_name" } } ] );
                if(wards){
                    wards = JSON.parse(JSON.stringify(wards));
                    wards = wards.map((ward,index)=>{
                        ward.index = index+1;
                        return ward;
                    })
                    return {
                        valid: true,
                        next_prompt:'collect_ward',
                        data:{lga:previousMessageData.lga, wards}
                    }
                }
                return false;
                }
                console.log('page', previousPage)
               
                if(response == '00' && (previousPage > 1)){
                    let pus = fetchNthPage(allPUs, previousPage - 1);
                    return {
                        valid: true,
                        next_prompt:'collect_pu_name',
                        data:{pus,lga: previousMessageData.lga, selectedWard: previousMessageData.selectedWard, meta:{all: allPUs, page:(previousPage-1)} }
                    }
                }
                if(response == '99' && previousPage < Math.ceil(allPUs.length/20)){
                    let pus = fetchNthPage(allPUs, previousPage+1);
                    return {
                        valid: true,
                        next_prompt:'collect_pu_name',
                        data:{pus,lga: previousMessageData.lga, selectedWard: previousMessageData.selectedWard, meta:{all: allPUs, page:(previousPage+1)} }
                    }
                }
                if(!Number.isInteger(Number(response))){
                    return false;
                }
                response = Number(response);
                let pus = conversation.lastMessage.data.pus;
                let selectedPU;
                if(pus && Array.isArray(pus)){
                    for(let i = 0; i < pus.length; i++){
                        if(response === pus[i].index){
                            selectedPU = pus[i]._id;
                            break;
                        }
                    }
                }
                if(!selectedPU){
                    return false;
                }
                let puFromDB =await PollingUnit.findOne({pu_name:selectedPU});
                if(!puFromDB){
                    return false;
                }
                puFromDB = JSON.parse(JSON.stringify(puFromDB));
                console.log(puFromDB)
                if(puFromDB.pu_code){
                    return {
                        valid: true,
                        next_prompt:'confirm_details',
                        data: {name: conversation.user.name, ward: puFromDB.ward_name, pu_code: puFromDB.pu_code, pu_address: puFromDB.pu_name, lga: puFromDB.lga} 
                    }
                }
                
                return false;
            }
        },
        {
            template: 'confirm_details',
            needs_response: true,
            handler:async function (response, conversation) {
                if(response.trim().toLowerCase() === 'yes'){
                    let PU = conversation.lastMessage.data;
                    let updateResult = await User.updateOne({ phone: conversation.user.phone }, { pu_code: PU.pu_code, pu_address: PU.pu_address });
                    if(updateResult){
                        return {
                            valid: true,
                            next_prompt:'registration_complete',
                            data: {
                                name: conversation.user.name,
                                pu_code: PU.pu_code,
                                pu_address: PU.pu_address,
                                ward: PU.ward,
                                lga:PU.lga
                            }
                        };
                    }
                    return false;
                }else if(response.trim().toLowerCase() === 'no'){
                    let previousMessage = conversation.messages[conversation.messages.length - 1]
                    // console.log(previousMessage.data)
                    return {
                        valid: true,
                        next_prompt:previousMessage.prompt,
                        data: previousMessage.data
                    }
                }else{
                    return false;
                }
            }
        },
        {
            template: 'registration_complete',
            needs_response: false,
            handler: function () {
                return true
            }
        }
    ]
}

module.exports = register;