
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

const modalBody = document.querySelector('.modal-body')
const modalFooter = document.querySelector('.modal-footer')

import { findNestedObj } from './findNestedObj.js'
import { createSelect } from './createSelect.js'
import { makeRequest } from './makeRequest.js'

var params = {}

export const generateImportingReport = async (itemObjs, warehouseList, elementName) => {
  await Object.assign(params, { itemObjs, warehouseList })
  document.querySelector('#' + elementName + '').querySelector('tbody').innerHTML = ""

  // var tableContainer = document.createElement('div')
  // tableContainer.innerHTML = tableTemplate

  if (itemObjs.length !== 0) {
    // table header
    itemObjs.forEach(itemObj => {
      var tr = document.createElement('tr')
      document.querySelector('thead').querySelectorAll('th').forEach(th => {
        var td = document.createElement('td')
        if(th.getAttribute('data-resizable-column-id') === "contractId"){
          var a = document.createElement('a')
          a.href = `/contractMng/contracts/${itemObj.contract_Id}?token=${window.localStorage.getItem('accessToken')}`
          a.innerHTML = itemObj[th.getAttribute('data-resizable-column-id')]
          td.appendChild(a)
        } else {
          td.innerHTML = itemObj[th.getAttribute('data-resizable-column-id')]

        }
        tr.appendChild(td)
      })
      document.querySelector('#' + elementName + '').querySelector('tbody').appendChild(tr)

      tr.C_DATA = itemObj
      document.querySelector('#' + elementName + '').querySelector('tbody').appendChild(tr)

    })

  }


}

export const generateExportingReport = async (itemObjs, warehouseList, elementName) => {
  await Object.assign(params, { itemObjs, warehouseList })
  document.querySelector('#' + elementName + '').querySelector('tbody').innerHTML = ""

  // var tableContainer = document.createElement('div')
  // tableContainer.innerHTML = tableTemplate

  if (itemObjs.length !== 0) {
    // table header
    itemObjs.forEach(itemObj => {
      var tr = document.createElement('tr')
      document.querySelector('thead').querySelectorAll('th').forEach(th => {
        var td = document.createElement('td')
        if(th.getAttribute('data-resizable-column-id') === "contractId"){
          var a = document.createElement('a')
          a.href = `/contractMng/contracts/${itemObj.contract_Id}?token=${window.localStorage.getItem('accessToken')}`
          a.innerHTML = itemObj[th.getAttribute('data-resizable-column-id')]
          td.appendChild(a)
        } else {
          td.innerHTML = itemObj[th.getAttribute('data-resizable-column-id')]

        }
        tr.appendChild(td)
      })
      document.querySelector('#' + elementName + '').querySelector('tbody').appendChild(tr)

      tr.C_DATA = itemObj
      document.querySelector('#' + elementName + '').querySelector('tbody').appendChild(tr)

    })

  }

}

// create simple object
const transformToSimpleObject = (storeId = "None", storeName = "None", contractId = "None",
  itemTypeId = "None", propertyId = "None", propertyName = 'None') => {
  return {
    storeId, storeName, contractId, itemTypeId, propertyId, propertyName
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