import { findNestedObj } from './findNestedObj.js'
export const generateContractDetailHTML = (itemObj, template, elementName) => {
  const clone = template.content.cloneNode(true)

  const infoTemplate = document.querySelector('#info-template')

  const contractDetail = itemObj;

  // contract image
  const image = findNestedObj(contractDetail, 'name', 'image')
  clone.querySelector('#contract-image').setAttribute('src', image.value)

  // contract infos
  // contractMetadata
  for (const property in contractDetail) {
    switch (property) {
      case ("contractMetadata"):
        for (const property in contractDetail.contractMetadata) {
          const name = contractDetail.contractMetadata[property].name
          const value = contractDetail.contractMetadata[property].value
          const infoLang = contractDetail.contractMetadata[property].dataVie
          if (name === "customer" || name === "customerId" || name === "customerIdProvidingPlace"
            || name === "customerIdProvidingDate" || name === "customerAddress"
            || name === "customerPhoneNumber" || name === "customerFamilyRegister") {
            // B side info
            const cloneBSide = infoTemplate.content.cloneNode(true)
            cloneBSide.querySelector('label').innerHTML = displayInfoLang(infoLang)
            cloneBSide.querySelector('input').value = value
            clone.querySelector('.b-side-info-container').querySelector('.section').appendChild(cloneBSide)
          } else {
            if (name !== "templateName" && name !== "image" && name !== "employee" && name !== 'store' && name !== "customer" && name !== "contractContent") {
              // contract info
              const infoTemplatelone = infoTemplate.content.cloneNode(true)
              infoTemplatelone.querySelector('label').innerHTML = displayInfoLang(infoLang)
              infoTemplatelone.querySelector('input').value = value
              clone.querySelector('.contract-info-container').querySelector('.section').appendChild(infoTemplatelone)
            }
          }
        }
        break
      case ("store"): {
        const name = contractDetail[property].name
        const value = contractDetail[property].value
        const infoLang = contractDetail[property].dataVie
        // A side info
        const cloneASide = infoTemplate.content.cloneNode(true)
        cloneASide.querySelector('label').innerHTML = displayInfoLang(infoLang)
        cloneASide.querySelector('input').value = typeof value === "object" ?
          (findNestedObj(value, 'name', 'name') ? findNestedObj(value, 'name', 'name').value : 'No store') : value
        clone.querySelector('.a-side-info-container').querySelector('.section').appendChild(cloneASide)
        break
      }

      case ("employee"): {
        const name = contractDetail[property].name
        const value = contractDetail[property].value
        const infoLang = contractDetail[property].dataVie
        // A side info
        const cloneASide = infoTemplate.content.cloneNode(true)
        cloneASide.querySelector('label').innerHTML = displayInfoLang(infoLang)
        cloneASide.querySelector('input').value = typeof value === "object" ?
          (findNestedObj(value, 'name', 'fullName') ? findNestedObj(value, 'name', 'fullName').value : 'No employee') : value
        clone.querySelector('.a-side-info-container').querySelector('.section').appendChild(cloneASide)
        break
      }

      default:


    }

  }

  // info items
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

      infoTemplatelone.querySelector('label').innerHTML = statusName.name === "type" ? displayInfoLang('tinhTrang') : displayInfoLang(statusName.dataVie)
      infoTemplatelone.querySelector('input').value = statusName.value

      itemDiv.querySelector('.item-status').appendChild(infoTemplatelone)
      status.infos.forEach(info => {
        const infoTemplatelone = infoTemplate.content.cloneNode(true)
        infoTemplatelone.querySelector('.form-group').className = "form-group"

        infoTemplatelone.querySelector('label').innerHTML = info.name === "loai" ? "Tinh trang" : info.name.charAt(0).toUpperCase() + info.name.slice(1)
        infoTemplatelone.querySelector('input').value = info.value

        itemDiv.querySelector('.item-status').appendChild(infoTemplatelone)

      })
    })

    clone.querySelector('.item-info-container').appendChild(itemDiv)
  })

  // handle event click to pdf button
  clone.querySelector('.get-pdf').addEventListener('click', (event) => {
    event.preventDefault()
    window.location.href = 'contracts/' + itemObj._id + '?token=' + window.localStorage.getItem('accessToken')
  })

  document.body.querySelector('#' + elementName + '').appendChild(clone)

}

const displayInfoLang = (info) => {
  if (typeof info === "string") {
    // uppercase the first letter
    var infoLang = info.charAt(0).toUpperCase() + info.slice(1)
    // split based on uppercase letters
    if (infoLang.match(/[A-Z][a-z]+|[0-9]+/g) !== null) {
      infoLang = infoLang.match(/[A-Z][a-z]+|[0-9]+/g).join(" ")
    }
    return infoLang

  }
  return info

}