const tableTemplate = `
  <style>
    tbody>tr:hover{
      cursor: pointer;
    }
  </style>
  <h2>This is table</h2>
  <div class="table-container table-responsive">
    <div id="toolbar">

    </div>

    <table 
      class="table table-hover"
      id="table" 
      data-toggle="table"
      data-search="true"
      data-filter-control="true" 
      data-show-export="true"
      data-click-to-select="true"
      data-toolbar="#toolbar">
      <thead>

      </thead>
      <tbody>

      </tbody>
    </table>
  </div>
`

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

export const generatePropertyManagementList = async (itemObjs, warehouseList, elementName) => {
  await Object.assign(params, { itemObjs, warehouseList })

  // var tableContainer = document.createElement('div')
  // tableContainer.innerHTML = tableTemplate

  if (itemObjs.length !== 0) {
    // table header
    itemObjs.forEach(itemObj => {
      var storeId = findNestedObj(itemObj.currentWarehouse.metadata, 'name', 'id') ? findNestedObj(itemObj.currentWarehouse.metadata, 'name', 'id').value : 'None'
      var storeName = findNestedObj(itemObj.currentWarehouse.metadata, 'name', 'name') ? findNestedObj(itemObj.currentWarehouse.metadata, 'name', 'name').value : 'None'
      var contractId = itemObj.contract ? itemObj.contract.id : 'None'
      var itemTypeId = findNestedObj(itemObj.contract.templateMetadata, 'name', 'itemTypeId') ? findNestedObj(itemObj.contract.templateMetadata, 'name', 'itemTypeId').value : 'None'
      var propertyId = itemObj.id
      var propertyName = itemObj.infos[0] ? (itemObj.infos[0].value !== '' ? itemObj.infos[0].value : 'None') : 'None'
      var tr = displayInfoToTable(transformToSimpleObject(storeId, storeName, contractId, itemTypeId, propertyId, propertyName), elementName)
      tr.C_DATA = itemObj
      tr.addEventListener('click', (event) => {
        console.log('event: ', event.target.closest('tr').C_DATA)
        var propertyData = event.target.closest('tr').C_DATA

        $("#centralModalSm").on('show.bs.modal', () => {
          modalBody.C_DATA = propertyData
          modalFooter.querySelector('#btn-move').innerHTML = 'change warehouse'

          var propertyInfoContainer = document.createElement('div')
          propertyInfoContainer.className = 'property-info-container d-flex flex-wrap justify-content-between'

          // property infos
          var h4 = document.createElement('h4')
          h4.innerHTML = "I. Property infos"
          h4.style.width = "100%"
          propertyInfoContainer.appendChild(h4)
          // property id
          var propertyIdClone = detailInfoTemplate.cloneNode(true)
          propertyIdClone.querySelector('label').innerHTML = 'ID'
          propertyIdClone.querySelector('input').value = propertyId
          propertyInfoContainer.appendChild(propertyIdClone)
          // property infos
          propertyData.infos.forEach(info => {
            var detailInfoTemplateClone = detailInfoTemplate.cloneNode(true)
            detailInfoTemplateClone.querySelector('label').innerHTML = info.name
            detailInfoTemplateClone.querySelector('input').value = info.value
            propertyInfoContainer.appendChild(detailInfoTemplateClone)
          })



          // current warehouse
          var detailInfoTemplateClone = detailInfoTemplate.cloneNode(true)
          detailInfoTemplateClone.querySelector('label').innerHTML = findNestedObj(propertyData.currentWarehouse, 'name', 'name') ?
            findNestedObj(propertyData.currentWarehouse, 'name', 'name').dataVie : 'Ten kho'

          detailInfoTemplateClone.querySelector('input').value = findNestedObj(propertyData.currentWarehouse, 'name', 'name') ?
            findNestedObj(propertyData.currentWarehouse, 'name', 'name').value : 'No warehouse/store'

          propertyInfoContainer.appendChild(detailInfoTemplateClone)

          modalBody.innerHTML = ""
          modalBody.appendChild(propertyInfoContainer)

        })
        $("#centralModalSm").modal('show')
      })
      // tableContainer.querySelector('#table>tbody').appendChild(tr)
      document.querySelector('#' + elementName + '').querySelector('tbody').appendChild(tr)

    })

  }


}

modalFooter.querySelector('#btn-move').addEventListener('click', (event) => {
  var itemObj = event.target.closest('.modal-content').querySelector('.modal-body').C_DATA
  console.log('text content: ', itemObj)

  // create warehouse selector options
  var { warehouseList } = params
  var warehouseSelectOptions = []
  if (warehouseList.length !== 0) {
    warehouseList.map(warehouse => {
      var option = `<option value="${warehouse._id}">${warehouse.name}-${warehouse.address}</option>`
      warehouseSelectOptions.push(option)
    })
  } else {
    warehouseSelectOptions.push(`<option value="">No store</option>`)
  }

  switch (event.target.textContent) {
    case ("change warehouse"):
      modalBody.innerHTML = ""
      // current warehouse
      const currentWarehouseContainer = document.createElement('div')
      currentWarehouseContainer.className = "current-warehouse"

      const currentWarehouseLabel = document.createElement('label')
      currentWarehouseLabel.className = "current-warehouse-label"
      currentWarehouseLabel.innerHTML = "Current warehouse"
      currentWarehouseContainer.appendChild(currentWarehouseLabel)

      const currentWarehouse = document.createElement('p')
      currentWarehouse.className = 'text-center'

      findNestedObj(itemObj.currentWarehouse, 'name', 'name') ?
        currentWarehouse.innerHTML = `${findNestedObj(itemObj.currentWarehouse, 'name', 'name').value}
 -${findNestedObj(itemObj.currentWarehouse, 'name', 'address').value}` : currentWarehouse.innerHTML = `No warehouse/store`
      currentWarehouseContainer.appendChild(currentWarehouse)
      modalBody.appendChild(currentWarehouseContainer)

      // warehouse selector
      createSelect(select, warehouseList[0]._id, 'warehouse-select', 'select-warehouse',
        warehouseSelectOptions, selectLabel, 'Move to: ', selectContainer, modalBody, false)
      break
    case ("change"):
      var updateObj = {
        currentWarehouse: null,
        movement: itemObj.movement,
        importDate: new Date(Date.now())
      }
      if (itemObj.currentWarehouse &&
        modalBody.querySelector('select.select-warehouse').value === itemObj.currentWarehouse._id) {
        window.alert("Property's already in this warehouse!")
      } else {
        if (modalBody.querySelector('select.select-warehouse').value ||
          modalBody.querySelector('select.select-warehouse').value !== "") {
          updateObj.currentWarehouse = modalBody.querySelector('select.select-warehouse').value
          updateObj.movement.push(modalBody.querySelector('select.select-warehouse').value)
          console.log('updateObj: ', updateObj)
          makeRequest("PUT", '/systemMng/properties/' + itemObj._id, 'application/json', JSON.stringify(updateObj), (result) => {
            // window.location.href = `/systemMng/warehouses/${result.result.currentWarehouse}/properties?token=${window.localStorage.getItem('accessToken')}`
            window.location.reload()
          })
        }
      }

      break
    default:
  }
  event.target.textContent === "change warehouse" ? event.target.textContent = "change" : event.target.textContent = "change"

})

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