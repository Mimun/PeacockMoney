var selectContainer = document.createElement('div')
selectContainer.className = 'select-container'

var select = document.createElement('select')
select.className = "browser-default custom-select"

var selectLabel = document.createElement('label')


import { findNestedObj } from './findNestedObj.js'
import { makeRequest } from './makeRequest.js'
// used when user clicks to "create contract button"
export const generateContractTemplateHTML = (itemObj, template, elementName, storeList) => {
  console.log('itemobjs from generaete contract template htlm: ', itemObj)
  var storeSelectOptions = []
  if (storeList.length !== 0) {
    storeList.map(store => {
      var name = findNestedObj(store, 'name', 'name')
      var option = `<option value=${store._id}>${findNestedObj(store, 'name', 'name') ? 
      findNestedObj(store, 'name', 'name').value : (findNestedObj(store, 'name', 'storeName')? findNestedObj(store, 'name', 'storeName').value : 'None')}</option>`
      storeSelectOptions.push(option)
    })
  }
  storeSelectOptions.unshift('<option value="">No store</option>')

  const infoContainer = document.createElement('div')
  // contract template image 
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

  // contract A side
  const aSideInfoDiv = document.createElement('div')
  aSideInfoDiv.className = 'a-side-info'
  aSideInfoDiv.innerHTML = `<strong>I. Thong tin ben A</strong>`
  infoContainer.appendChild(aSideInfoDiv)

  // contract B side
  const bSideInfoDiv = document.createElement('div')
  bSideInfoDiv.className = 'b-side-info'
  bSideInfoDiv.innerHTML = `<strong>II. Thong tin ben B</strong>`
  infoContainer.appendChild(bSideInfoDiv)

  // contract Info 
  const contractInfoDiv = document.createElement('div')
  contractInfoDiv.className = 'contract-info'
  contractInfoDiv.innerHTML = `<strong>III. Thong tin hop dong</strong>`

  infoContainer.appendChild(contractInfoDiv)



  // contract metadata
  itemObj.contractMetadata.map(info => {
    if (info.name !== "creator" && info.name !== 'store') {
      const clone = document.importNode(template.content, true)
      var input = clone.querySelector('input')

      if (info.value === null || info.value === "") {
        input.removeAttribute('disabled')

      } else {
        input.value = info.value
      }

      if (info.name === "loan" || info.name === "min" || info.name === "max") {
        input.setAttribute('data-type', 'currency')
      }
      input.type = info.cType
      input.setAttribute('name', info.name)
      input.setAttribute('data-vie', info.dataVie)
      input.setAttribute('data-kor', info.dataKor)

      var label = clone.querySelector('label')
      label.innerHTML = displayInfoLang(info.dataVie)
      if (info.name === 'customer' || info.name === 'customerId' || info.name === 'customerIdProvidingPlace' || info.name === 'customerIdProvidingDate' || info.name === 'customerAddress' || info.name === 'customerPhoneNumber' || info.name === 'customerFamilyRegister') {
        bSideInfoDiv.appendChild(clone)
      } else {
        contractInfoDiv.appendChild(clone)
      }
    } else if (info.name === 'store') {
      var selectContainerClone = createSelect(select, '', 'store', 'select-store', 'cuaHang', 'koreanString', storeSelectOptions, selectLabel, 'Cua hang', selectContainer)
      aSideInfoDiv.appendChild(selectContainerClone)
      var selectContainerClone2 = createSelect(select, '', 'employee', 'select-employee', 'nhanVien', 'koreanString', [], selectLabel, 'Nhan vien', selectContainer)
      selectContainerClone2.querySelector('#employee').disabled = true
      aSideInfoDiv.appendChild(selectContainerClone2)

      aSideInfoDiv.querySelector('#store').addEventListener('change', (event) => {
        console.log('event: ', event.target.value)
        makeRequest('POST', 'getStores', 'application/json', JSON.stringify({ data: event.target.value }), (result) => {
          var employeeSelectOptions = []
          employeeSelectOptions.unshift('<option value="">No employee</option>')
          if (result.employeeList.length !== 0) {
            result.employeeList.map(employee => {
              var employeeName = findNestedObj(employee, 'name', 'fullName')
              var employeeRole = findNestedObj(employee, 'name', 'role')
              var option = `<option value=${employee._id}>${employeeName.value}-${employeeRole.value}</option>`
              employeeSelectOptions.push(option)
            })
          }
          aSideInfoDiv.querySelector('#employee').innerHTML = employeeSelectOptions
          aSideInfoDiv.querySelector('#employee').disabled = false
        })

      })
    }


    // if (info.name === 'creator' || info.name === 'store') {
    //   aSideInfoDiv.appendChild(clone)
    // } else 

  })

  // contract custom infos
  if (itemObj.infos.length != 0) {
    itemObj.infos.map(info => {
      if (info.name !== "image") {
        const clone = document.importNode(template.content, true)
        var input = clone.querySelector('input')

        if (info.value === null || info.value === "") {
          input.removeAttribute('disabled')

        } else {
          input.value = info.value

        }
        // cannot add dataVie|dataKor because custom infos depends on what user import to
        input.type = info.cType

        var label = clone.querySelector('label')
        label.innerHTML = info.name.charAt(0).toUpperCase() + info.name.slice(1)
        document.querySelector('.contract-item-container').querySelector('span').innerHTML = "1"
        document.querySelector('#custom-info').appendChild(clone)
      }

    })
  }


  document.body.querySelector('#' + elementName + '').appendChild(infoContainer)

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

const createSelect = (selectTemplate, selecteValue, selectId, selectClassName, dataVie, dataKor, selectOptions, labelTemplate, labelContent, selectContainer) => {
  var select = selectTemplate.cloneNode(true)
  select.id = selectId
  select.setAttribute('data-vie', dataVie)
  select.setAttribute('data-kor', dataKor)
  select.setAttribute('name', selectId)
  select.innerHTML = selectOptions
  select.value = selecteValue
  select.classList.add(selectClassName)
  select.disabled = false


  var selectLabel = labelTemplate.cloneNode(true)
  selectLabel.setAttribute('for', selectId)
  selectLabel.innerHTML = labelContent

  var selectContainerClone = selectContainer.cloneNode(true)
  selectContainerClone.appendChild(selectLabel)
  selectContainerClone.appendChild(select)
  return selectContainerClone
}