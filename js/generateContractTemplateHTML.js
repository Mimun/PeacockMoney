var selectContainer = document.createElement('div')
selectContainer.className = 'select-container'

var select = document.createElement('select')
select.className = "browser-default custom-select"

var selectLabel = document.createElement('label')


import { findNestedObj } from './findNestedObj.js'
import { makeRequest } from './makeRequest.js'
import { addSeparator, removeSeperator } from './addSeparatorOnInputChange.js'
// used when user clicks to "create contract button"
export const generateContractTemplateHTML = (itemObj, template, elementName, storeList) => {
  var storeSelectOptions = []
  if (storeList.length !== 0) {
    storeList.map(store => {
      var name = findNestedObj(store, 'name', 'name')
      var option = `<option value=${store._id} name='${findNestedObj(store, 'name', 'name') ? findNestedObj(store, 'name', 'id').value : 'None'}'>${findNestedObj(store, 'name', 'name') ?
        findNestedObj(store, 'name', 'name').value : (findNestedObj(store, 'name', 'storeName') ? findNestedObj(store, 'name', 'storeName').value : 'None')}</option>`
      storeSelectOptions.push(option)
    })
  }
  storeSelectOptions.unshift('<option value="">No store</option>')

  const infoContainer = document.createElement('div')
  // contract template image 
  const imageInfo = findNestedObj(itemObj, 'name', 'image')
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
  aSideInfoDiv.className = 'a-side-info info-container'
  aSideInfoDiv.innerHTML = `<div class="title">I. Thông tin bên A</div>`
  infoContainer.appendChild(aSideInfoDiv)

  // contract B side
  const bSideInfoDiv = document.createElement('div')
  bSideInfoDiv.className = 'b-side-info-container info-container'
  bSideInfoDiv.innerHTML = `<div class="title">II. Thông tin bên B</div>
    <div class="b-side-info d-flex flex-wrap justify-content-start info-div"></div>
  `
  infoContainer.appendChild(bSideInfoDiv)

  // contract Info 
  const contractInfoDiv = document.createElement('div')
  contractInfoDiv.className = 'contract-info-container info-container'
  contractInfoDiv.innerHTML = `<div class="title">III. Thông tin hợp đồng</div>
    <div class="contract-info d-flex flex-wrap justify-content-start info-div"></div>
  `

  infoContainer.appendChild(contractInfoDiv)

  // contract metadata
  itemObj.contractMetadata.map(info => {
    if (info.name !== "creator" && info.name !== 'store') {
      const clone = document.importNode(template.content, true)
      var input = clone.querySelector('input')
      if(info.cType === 'date'){
        console.log('info date: ', clone.querySelector('.form-group'))
        $(clone.querySelector('.form-group')).addClass('is-filled')
      }

      if (info.value === null || info.value === "") {
        input.removeAttribute('disabled')

      } else {
        info.name === "min" || "max" ? input.value = addSeparator(info.value) : input.value = info.value
      }

      if (info.name === "loan" || info.name === "min" || info.name === "max") {
        input.setAttribute('data-type', 'currency')
        input.type = 'text'
        input.setAttribute('name', info.name)
        input.setAttribute('data-vie', info.dataVie)
        input.setAttribute('data-kor', info.dataKor)

      } else {
        input.type = info.cType
        input.setAttribute('name', info.name)
        input.setAttribute('data-vie', info.dataVie)
        input.setAttribute('data-kor', info.dataKor)
      }

      if (info.name === "contractCreatedDate") {
        // calculate contract ending date
        input.addEventListener('change', (event) => {
          var numberOfAcceptanceTerms = findNestedObj(itemObj, 'name', 'numberOfAcceptanceTerms') ?
            findNestedObj(itemObj, 'name', 'numberOfAcceptanceTerms').value : 0
          var numberOfDaysPerTerm = findNestedObj(itemObj, 'name', 'numberOfDaysPerTerm') ?
            findNestedObj(itemObj, 'name', 'numberOfDaysPerTerm').value : 0
          var contractEndingDate = new Date(new Date(event.target.value).getTime() + numberOfAcceptanceTerms * numberOfDaysPerTerm * 24 * 60 * 60 * 1000)
          contractInfoDiv.querySelector('input[name="contractEndingDate"]').value = formatDate(contractEndingDate)
        })
      }

      var label = clone.querySelector('label')
      label.innerHTML = info.dataVie
      if (info.name === 'customer' || info.name === 'customerId' || info.name === 'customerIdProvidingPlace' || info.name === 'customerIdProvidingDate' || info.name === 'customerAddress' || info.name === 'customerPhoneNumber' || info.name === 'customerFamilyRegister') {
        bSideInfoDiv.querySelector('.b-side-info').appendChild(clone)
      } else {
        contractInfoDiv.querySelector('.contract-info').appendChild(clone)
      }
    } else if (info.name === 'store') {
      var selectContainerClone = createSelect(select, '', 'store', 'select-store', 'cuaHang',
        'koreanString', storeSelectOptions, selectLabel, 'Cửa hàng', selectContainer)
      aSideInfoDiv.appendChild(selectContainerClone)

      var selectContainerClone2 = createSelect(select, '', 'employee', 'select-employee', 'nhanVien',
        'koreanString', [], selectLabel, 'Người đại diện', selectContainer)
      selectContainerClone2.querySelector('#employee').disabled = true
      aSideInfoDiv.appendChild(selectContainerClone2)

      aSideInfoDiv.querySelector('#store').addEventListener('change', (event) => {
        makeRequest('POST', '/contractMng/getStores', 'application/json', JSON.stringify({ data: event.target.value }), (result) => {
          var employeeSelectOptions = []
          employeeSelectOptions.unshift('<option value="">No employee</option>')
          if (result.employeeList.length !== 0) {
            result.employeeList.map(employee => {
              // var employeeName = findNestedObj(employee, 'name', 'name')
              // var employeeRole = findNestedObj(employee, 'name', 'role')
              var option = `<option value=${employee._id}>${employee.name}-${employee.role}</option>`
              employeeSelectOptions.push(option)
            })
          }
          aSideInfoDiv.querySelector('#employee').innerHTML = employeeSelectOptions
          aSideInfoDiv.querySelector('#employee').disabled = false
        })

      })
    }
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

  // prevent typing the loan from getting over the max or under the min
  contractInfoDiv.querySelector('input[name="loan"]').addEventListener('change', (event) => {
    var loan = parseFloat(removeSeperator(event.target.value))
    var min = parseFloat(removeSeperator(contractInfoDiv.querySelector('input[name="min"]').value))
    var max = parseFloat(removeSeperator(contractInfoDiv.querySelector('input[name="max"]').value))
    if (loan < min || loan > max) {
      window.alert('You cannot enter the loan being out of min-max range')
      contractInfoDiv.querySelector('input[name="loan"]').value = 0
    }

  })

  document.body.querySelector('#' + elementName + '').appendChild(infoContainer)


  // // fixed label rendering wrongly 
  // document.querySelector('div#contract-template-container').querySelectorAll('input[type="date"]').forEach(input => {
  //   console.log('date input: ', input.closest('.form-group'))
  //   input.closest('div.form-group').className = 'form-group is-filled'
  //   console.log('date input: ', input.closest('.form-group').classList)

  // })
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

function formatDate(date) {
  var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2)
    month = '0' + month;
  if (day.length < 2)
    day = '0' + day;

  return [year, month, day].join('-');
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

