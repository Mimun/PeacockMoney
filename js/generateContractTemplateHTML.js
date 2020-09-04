import { findNestedObj } from './findNestedObj.js'
// used when user clicks to "create contract button"
export const generateContractTemplateHTML = (itemObj, template, elementName) => {
  console.log('itemobjs from generaete contract template htlm: ', itemObj)
  const infoContainer = document.createElement('div')
  // contract image 
  const imageInfo = findNestedObj(itemObj, 'name', 'image')
  console.log('image: ', imageInfo)
  var imgContainer = document.createElement('div')
  imgContainer.style.width = "320px"
  imgContainer.style.height = "180px"
  imgContainer.style.margin = "auto"

  var img = document.createElement('img')
  img.style.width = "100%"
  img.style.height = "auto"
  img.src = imageInfo.value
  img.alt = imageInfo.value
  imgContainer.appendChild(img)
  infoContainer.appendChild(imgContainer)

  infoContainer.className = 'object-div'
  infoContainer.setAttribute('c_data', true)
  infoContainer.C_DATA = itemObj

  const aSideInfoDiv = document.createElement('div')
  aSideInfoDiv.className = 'a-side-info'
  aSideInfoDiv.innerHTML = `<strong>I. Thong tin ben A</strong>`
  infoContainer.appendChild(aSideInfoDiv)

  const bSideInfoDiv = document.createElement('div')
  bSideInfoDiv.className = 'b-side-info'
  bSideInfoDiv.innerHTML = `<strong>II. Thong tin ben B</strong>`

  infoContainer.appendChild(bSideInfoDiv)

  const contractInfoDiv = document.createElement('div')
  contractInfoDiv.className = 'contract-info'
  contractInfoDiv.innerHTML = `<strong>III. Thong tin hop dong</strong>`

  infoContainer.appendChild(contractInfoDiv)



  // contract metadata
  itemObj.contractMetadata.map(info => {
    if (info.name !== 'image' && info.name !== 'contractContent') {
      const clone = document.importNode(template.content, true)

      var input = clone.querySelector('input')

      if (info.value === null || info.value === "") {
        input.removeAttribute('disabled')

      } else {
        input.value = info.value

      }
      input.type = info.cType
      input.setAttribute('data-eng', info.name)
      input.setAttribute('data-vie', info.dataVie)


      var label = clone.querySelector('label')
      label.innerHTML = displayInfoLang(info.dataVie)

      if (info.name === 'creator') {
        aSideInfoDiv.appendChild(clone)
      } else if (info.name === 'customer' || info.name === 'customerId' || info.name === 'customerIdProvidingPlace' || info.name === 'customerIdProvidingDate' || info.name === 'customerAddress' || info.name === 'customerPhoneNumber' || info.name === 'customerFamilyRegister') {
        bSideInfoDiv.appendChild(clone)
      } else {
        contractInfoDiv.appendChild(clone)
      }
    }

  })

  // contract template metadata
  itemObj.templateMetadata.map(info => {
    if (info.name !== 'image') {
      const clone = document.importNode(template.content, true)

      var input = clone.querySelector('input')
      if (info.value === null || info.value === "") {
        input.removeAttribute('disabled')

      } else {
        input.value = info.value
      }
      input.type = info.cType
      input.setAttribute('data-eng', info.name)
      input.setAttribute('data-vie', info.dataVie)

      var label = clone.querySelector('label')
      label.innerHTML = displayInfoLang(info.dataVie)
      infoContainer.appendChild(clone)
    }
  })

  // contract custom infos
  itemObj.infos.map(info => {
    if (info.name !== "image") {
      const clone = document.importNode(template.content, true)
      var input = clone.querySelector('input')

      if (info.value === null || info.value === "") {
        input.removeAttribute('disabled')

      } else {
        input.value = info.value

      }
      input.type = info.cType

      var label = clone.querySelector('label')
      label.innerHTML = info.name.charAt(0).toUpperCase() + info.name.slice(1)
      document.querySelector('.contract-item-container').querySelector('span').innerHTML = "1"
      document.querySelector('#custom-info').appendChild(clone)
    }

  })

  document.body.querySelector('#' + elementName + '').appendChild(infoContainer)

}

const displayInfoLang = (info) => {
  if (typeof info === "string") {
    // uppercase the first letter
    var infoLang = info.charAt(0).toUpperCase() + info.slice(1)
    // split based on uppercase letters
    infoLang = infoLang.match(/[A-Z][a-z]+|[0-9]+/g).join(" ")
    return infoLang

  }
  return info

}