import {findNestedObj} from './findNestedObj.js'
export const generateContractDetailHTML = (itemObj, template, elementName) => {
  const clone = template.content.cloneNode(true)

  const infoTemplate = document.querySelector('#info-template')

  const contractDetail = itemObj;

  // contract image
  const image = findNestedObj(contractDetail, 'name', 'image')
  clone.querySelector('#contract-image').setAttribute('src', image.value)

  // a side info
  var aSideInfo = findNestedObj(contractDetail, 'name', 'creator')
  const cloneASide = infoTemplate.content.cloneNode(true)
  cloneASide.querySelector('label').innerHTML = aSideInfo.name.charAt(0).toUpperCase() + aSideInfo.name.slice(1)
  cloneASide.querySelector('input').value = aSideInfo.value
  clone.querySelector('.a-side-info-container').querySelector('div[class="section"]').appendChild(cloneASide)

  // // b side info
  // var bSideInfo = findNestedObj(contractDetail, 'name', 'customer')
  // var bSideId = findNestedObj(contractDetail, 'name', 'customerId')
  // var bSideIdProvidingPlace = findNestedObj(contractDetail, 'name', 'customerIdProvidingPlace')
  // var bSideIdProvidingDate = findNestedObj(contractDetail, 'name', 'customerIdProvidingDate')

  

  // contract infos
  // metadata
  for (const property in contractDetail.metadata) {
    const name = contractDetail.metadata[property].name
    const value = contractDetail.metadata[property].value
    const infoLang = contractDetail.metadata[property].dataVie
    if(name === "customer" || name === "customerId" || name === "customerIdProvidingPlace" || name === "customerIdProvidingDate" || name === "customerAddress" || name === "customerPhoneNumber" || name === "customerFamilyRegister"){
      const cloneBSide = infoTemplate.content.cloneNode(true)
      cloneBSide.querySelector('label').innerHTML = displayInfoLang(infoLang)
      cloneBSide.querySelector('input').value = value
      clone.querySelector('.b-side-info-container').querySelector('div[class="section"]').appendChild(cloneBSide)
    } else {
      if (name.toLowerCase() !== "templateName" && name.toLowerCase() !== "image" && name.toLowerCase() !== "creator" && name.toLowerCase() !== "customer" && name !== "contractContent") {
        const infoTemplatelone = infoTemplate.content.cloneNode(true)
        infoTemplatelone.querySelector('label').innerHTML = displayInfoLang(infoLang)
        infoTemplatelone.querySelector('input').value = value
        clone.querySelector('.contract-info-container').querySelector('div[class="section"]').appendChild(infoTemplatelone)
  
      }
    }
    

  }
  // info
  contractDetail.items.forEach(item => {
    const itemDiv = clone.querySelector('.item-info-container').querySelector('.section').cloneNode(true)

    item.infos.forEach(info => {
      const infoTemplatelone = infoTemplate.content.cloneNode(true)
      infoTemplatelone.querySelector('.form-group').className = "form-group"
      infoTemplatelone.querySelector('label').innerHTML = info.name.charAt(0).toUpperCase() + info.name.slice(1)
      infoTemplatelone.querySelector('input').value = info.value

      itemDiv.querySelector('.item-info').appendChild(infoTemplatelone)
      // clone.querySelector('.contract-info-container').querySelector('div[class="section"]').appendChild(infoTemplatelone)
    })

    item.status.forEach(status => {
      const statusName = findNestedObj(status, 'name', 'type')
      const infoTemplatelone = infoTemplate.content.cloneNode(true)
      infoTemplatelone.querySelector('.form-group').className = "form-group"

      infoTemplatelone.querySelector('label').innerHTML = statusName.name === "type"? displayInfoLang('tinhTrang'): displayInfoLang(statusName.dataVie)
      infoTemplatelone.querySelector('input').value = statusName.value

      itemDiv.querySelector('.item-status').appendChild(infoTemplatelone)
      status.infos.forEach(info => {
        const infoTemplatelone = infoTemplate.content.cloneNode(true)
        infoTemplatelone.querySelector('.form-group').className = "form-group"

        infoTemplatelone.querySelector('label').innerHTML = info.name.toLowerCase() === "loai" ? "Tinh trang" : info.name.charAt(0).toUpperCase() + info.name.slice(1)
        infoTemplatelone.querySelector('input').value = info.value

        itemDiv.querySelector('.item-status').appendChild(infoTemplatelone)

      })
    })

    clone.querySelector('.item-info-container').appendChild(itemDiv)


  })

  // handle event click to pdf button
  clone.querySelector('.get-pdf').addEventListener('click', (event) => {
    event.preventDefault()
    $.ajax({
      type: 'GET',
      url: 'contracts/'+itemObj._id,
      contentType: 'application/json',
      success: result=>{
        console.log(result)
        window.location.href = 'contracts/' + itemObj._id
      }
    })
  })


  document.body.querySelector('#' + elementName + '').appendChild(clone)

 
}

const displayInfoLang = (info) => {
  if (typeof info === "string") {
    // // re-uppercase
    // var infoLang = info.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    // uppercase the first letter
    var infoLang = info.charAt(0).toUpperCase() + info.slice(1)
    // split based on uppercase letters
    infoLang = infoLang.match(/[A-Z][a-z]+|[0-9]+/g).join(" ")
    return infoLang

  } 
  return info

}