import { findNestedObj } from './findNestedObj.js'
import { makeRequest } from './makeRequest.js'
const detailWarehouseTemplate = document.createElement('div')
detailWarehouseTemplate.innerHTML = `
<div class="modal-header text-center">
  <h4 class="modal-title w-100 font-weight-bold">Detail info</h4>
  <button type="button" class="close" data-dismiss="modal" aria-label="Close">
    <span aria-hidden="true">&times;</span>
  </button>
</div>
<div class="modal-body mx-3 object-div d-flex justify-content-between flex-wrap">
</div>
<div class="modal-footer d-flex justify-content-center">
  <button class="btn btn-raised btn-primary btn-sm" id="btn-edit">Edit</button>
  <button class="btn btn-danger btn-sm" id="btn-delete">Delete</button>
  <button class="btn btn-secondary btn-sm" id="btn-redirect">Properties</button>
  
</div>`

const detailInfoTemplate = document.createElement('div')
detailInfoTemplate.className = 'form-group'
detailInfoTemplate.innerHTML = `
  <label data-error="wrong" data-success="right" ></label>
  <input type="text" class="form-control" disabled>
`
var selectContainer = document.createElement('div')
selectContainer.className = 'select-container'

var select = document.createElement('select')
select.className = "browser-default custom-select"

var selectLabel = document.createElement('label')

const modalContent = document.querySelector('#modalContactForm').querySelector('.modal-content')
const modalBody = detailWarehouseTemplate.querySelector('.modal-body')
const modalFooter = detailWarehouseTemplate.querySelector('.modal-footer')

var param = {}

export const generateWarehouseManagementList = async (mainList, optionsForSingleSelect, optionsForMultipleSelects, elementName, routerName) => {
  await Object.assign(param, { routerName })

  mainList.forEach(itemObj => {
    var id = findNestedObj(itemObj.metadata, 'name', 'id') ? findNestedObj(itemObj.metadata, 'name', 'id').value : 'None'
    var name = findNestedObj(itemObj.metadata, 'name', 'name') ? findNestedObj(itemObj.metadata, 'name', 'name').value : 'None'
    var address = findNestedObj(itemObj.metadata, 'name', 'address') ? findNestedObj(itemObj.metadata, 'name', 'address').value : 'None'
    var representative = findNestedObj(itemObj.representatives[0], 'name', 'name') ? findNestedObj(itemObj.representatives[0], 'name', 'name').value : 'None'
    var phoneNumber = findNestedObj(itemObj.metadata, 'name', 'phoneNumber') ? findNestedObj(itemObj.metadata, 'name', 'phoneNumber').value : 'None'

    var tr = displayInfoToTable(transformToSimpleObject(id, name, address, representative, phoneNumber), elementName)
    tr.C_DATA = itemObj
    
    // check box
    var td = document.createElement('td')
    var checkbox = document.createElement('div')
    checkbox.className = "checkbox"
    checkbox.innerHTML = `
      <label>
        <input type="checkbox">
      </label>`
    itemObj.deactive ? checkbox.querySelector('input').setAttribute('checked', true) : checkbox.querySelector('input').removeAttribute('checked')
    checkbox.addEventListener('click', (event) => {
      event.stopPropagation()

    })
    var input = checkbox.querySelector('input')
    input.addEventListener('change', (event) => {
      console.log('event for checkbox: ', event.target.checked)
      makeRequest('PUT', `warehouses/${event.target.closest('tr').C_DATA._id}`, 'application/json',
        JSON.stringify({ ...event.target.closest('tr').C_DATA, deactive: event.target.checked }), () => {
          window.location.reload()
        })
    })

    td.appendChild(checkbox)
    tr.appendChild(td)

    document.querySelector('#' + elementName + '').querySelector('tbody').appendChild(tr)


    tr.addEventListener('click', (event) => {
      const cData = event.target.closest('tr').C_DATA
      console.log('event: ', cData)
      detailWarehouseTemplate.querySelector('.object-div').C_DATA = cData

      $("#modalContactForm").on('show.bs.modal', () => {
        modalContent.innerHTML = ''
        modalBody.innerHTML = ''
        detailWarehouseTemplate.querySelector('#btn-edit').textContent = "Edit"
        cData.metadata.forEach(data => {
          if (data.cType !== 'select') {
            const detailInfoTemplateClone = detailInfoTemplate.cloneNode(true)
            var inputDiv = detailInfoTemplateClone.querySelector('input')
            var labelDiv = detailInfoTemplateClone.querySelector('label')
            setInfo(data, inputDiv)
            labelDiv.innerHTML = displayInfoLang(data.dataVie)
            modalBody.appendChild(detailInfoTemplateClone)
          }
        })

        if (cData.store) {
          typeof cData.store === "object" ?
            createSelect(select, cData.store._id, 'store-select', 'select-store',
              optionsForSingleSelect, selectLabel, 'Cửa hàng', selectContainer, modalBody, true)
            :
            createSelect(select, cData.store, 'store-select', 'select-store',
              optionsForSingleSelect, selectLabel, 'Cửa hàng', selectContainer, modalBody, true)
        } else {
          createSelect(select, '', 'store-select', 'select-store',
            optionsForSingleSelect, selectLabel, 'Cửa hàng', selectContainer, modalBody, true)
        }


        if (cData.representatives.length !== 0) {
          cData.representatives.forEach(representative => {
            typeof representative === "object" ?
              createSelect(select, representative._id, 'representative-select', 'select-representative',
                optionsForMultipleSelects, selectLabel, 'Người liên hệ', selectContainer, modalBody, true)
              : createSelect(select, representative, 'representative-select', 'select-representative',
                optionsForMultipleSelects, selectLabel, 'Người liên hệ', selectContainer, modalBody, true)
          })

        } else {
          createSelect(select, '', 'representative-select', 'select-representative',
            optionsForMultipleSelects, selectLabel, 'Người liên hệ', selectContainer, modalBody, true)

        }


        modalContent.appendChild(detailWarehouseTemplate)

      })
      $("#modalContactForm").modal('show')
      $('#modalContactForm').on('hidden.bs.modal', () => {
        console.log('this is called befor hidding')
        if (modalFooter.querySelector('#btn-add-representative')) {
          modalFooter.removeChild(modalFooter.querySelector('#btn-add-representative'))
        }
      })
    })
  })
}

// edit button
modalFooter.querySelector('#btn-edit').addEventListener('click', event => {
  var { routerName } = param
  switch (event.target.textContent) {
    case "Edit":
      console.log('event edit: ', modalBody.C_DATA)
      if (modalBody.C_DATA.deactive === true) {
        window.alert('You cannot edit this warehouse because of the warehouse deactivation!')
        event.target.textContent = 'Edit'
      } else {
        modalBody.querySelectorAll('input').forEach(input => {
          input.removeAttribute('disabled')
        })
        if (modalBody.querySelectorAll('select').length === 0) {
          createSelect(select, '', 'representative-select', 'select-representative',
            representativeSelectOptions, selectLabel, 'Người liên hệ', selectContainer, modalBody, true)

        }
        modalBody.querySelectorAll('select').forEach(select => {
          select.disabled = false
        })
        var addRepresentativeButton = event.target.cloneNode(true)
        addRepresentativeButton.classList.remove('btn-raised', 'btn-primary')
        addRepresentativeButton.classList.add('btn-outline-primary')

        addRepresentativeButton.id = 'btn-add-representative'
        addRepresentativeButton.innerHTML = "Add representative"
        modalFooter.prepend(addRepresentativeButton)
        addEventForAddRepresentativeButton()
        event.target.textContent = event.target.textContent === "Edit" ? event.target.textContent = "Update" : event.target.textContent = "Edit"

      }


      break
    case "Update":
      var updateObj = {
        ...event.target.closest('.modal-content').querySelector('.object-div').C_DATA,
        metadata: [], representatives: [], store: null, deactive: false
      }
      modalBody.querySelectorAll('input').forEach(input => {
        input.setAttribute('disabled', true)
        updateObj.metadata.push(getInfo(input))
      })
      if (modalBody.querySelector('select.select-store').value) {
        updateObj.store = modalBody.querySelector('select.select-store').value
      }

      modalBody.querySelectorAll('select.select-representative').forEach(select => {
        if (select.value) {
          updateObj.representatives.push(select.value)
        }
      })

      console.log('update obj: ', updateObj)
      makeRequest('PUT', routerName + "/" + event.target.closest('.modal-content').querySelector('.object-div').C_DATA._id,
        'application/json', JSON.stringify(updateObj), () => {
          window.location.reload()
        })
      event.target.textContent = event.target.textContent === "Edit" ? event.target.textContent = "Update" : event.target.textContent = "Edit"

      break
    default:

  }


})

// delete button
modalFooter.querySelector('#btn-delete').addEventListener('click', event => {
  var { routerName } = param
  makeRequest('DELETE', routerName + "/" + event.target.closest('.modal-content').querySelector('.object-div').C_DATA._id,
    'application/json', {}, () => {
      window.location.reload()
    })

})

// redirect button
modalFooter.querySelector('#btn-redirect').addEventListener('click', event => {
  console.log('event: ', modalBody.C_DATA)
  window.location.href = 'warehouses/' + modalBody.C_DATA._id + '/properties?token=' + window.localStorage.getItem('accessToken')
})

// add representative button
const addEventForAddRepresentativeButton = () => {
  modalFooter.querySelector('#btn-add-representative').addEventListener('click', (event) => {
    console.log('Event: ', event.target)
    var clone = modalBody.querySelector("select.select-representative").closest('.select-container').cloneNode(true)
    clone.querySelector('select').value = ""
    modalBody.appendChild(clone)
  })
}

const displayInfoLang = (info) => {
  if (typeof info === "string") {
    // // re-uppercase
    // var infoLang = info.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
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

const getInfo = (input) => {
  return {
    cType: input.type,
    dataKor: input.getAttribute('data-kor'),
    dataVie: input.getAttribute('data-vie'),
    name: input.getAttribute('name'),
    value: input.value
  }
}

const setInfo = (data, inputDiv) => {
  inputDiv.type = data.cType
  inputDiv.value = data.value
  inputDiv.setAttribute('name', data.name)
  inputDiv.setAttribute('data-vie', data.dataVie)
  inputDiv.setAttribute('data-kor', data.dataKor)
}

export const createSelect = (selectTemplate, selecteValue, selectId,
  selectClassName, selectOptions, labelTemplate, labelContent, selectContainer, divAppend, disabled) => {
  var select = selectTemplate.cloneNode(true)
  select.id = selectId
  select.innerHTML = selectOptions
  select.value = selecteValue
  select.classList.add(selectClassName)
  select.disabled = disabled

  var selectLabel = labelTemplate.cloneNode(true)
  selectLabel.setAttribute('for', selectId)
  selectLabel.innerHTML = labelContent

  var selectContainerClone = selectContainer.cloneNode(true)
  selectContainerClone.appendChild(selectLabel)
  selectContainerClone.appendChild(select)
  divAppend.appendChild(selectContainerClone)

}

// create simple object
const transformToSimpleObject = (id = "None", name = "None", address = "None", representative = "None",
  phoneNumber = "None") => {
  return {
    id, name, address, representative, phoneNumber
  }
}

// display table
const displayInfoToTable = (itemObj, elementName) => {
  var tr = document.createElement('tr')
  for (var prop in itemObj) {
    var td = document.createElement('td')
    td.innerHTML = itemObj[prop]
    tr.appendChild(td)
  }

  document.querySelector('#' + elementName + '').querySelector('tbody').appendChild(tr)
  return tr
}