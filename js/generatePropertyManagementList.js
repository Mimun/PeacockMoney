const tableTemplate = `
  <style>
    tbody>tr:hover{
      cursor: pointer;
    }
  </style>
  <h2>This is table</h2>
  <div class="table-container ">
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
// property div
const propertyDiv = modalBody.querySelector('div#property')
// property options div
const propertyOptionsDiv = modalBody.querySelector('div#property-options')

import { findNestedObj } from './findNestedObj.js'
import { createSelect } from './createSelect.js'
import { makeRequest } from './makeRequest.js'

var params = {}

export const generatePropertyManagementList = async (itemObjs, originItemObjs, warehouseList, elementName) => {
  await Object.assign(params, { itemObjs, warehouseList })

  // var tableContainer = document.createElement('div')
  // tableContainer.innerHTML = tableTemplate

  if (itemObjs.length !== 0) {
    // table header
    itemObjs.forEach(itemObj => {
      var originItemObj = originItemObjs.find(object => object._id === itemObj._id)
      var tr = document.createElement('tr')
      document.querySelector('table').querySelector('thead').querySelectorAll('th').forEach(th => {
        var td = document.createElement('td')
        td.innerHTML = itemObj[th.getAttribute('data-resizable-column-id')]
        tr.appendChild(td)

        document.querySelector('#' + elementName + '').querySelector('tbody').appendChild(tr)
      })

      tr.C_DATA = originItemObj
      tr.addEventListener('click', (event) => {
        console.log('event: ', event.target.closest('tr').C_DATA)
        var propertyData = event.target.closest('tr').C_DATA
        modalBody.C_DATA = propertyData
        console.log('current warehouse: ', modalBody.C_DATA.currentWarehouse)

        if (modalBody.C_DATA.currentWarehouse !== null) {
          modalFooter.querySelector('#btn-move').removeAttribute('disabled')
          modalFooter.querySelector('#btn-export').removeAttribute('disabled')
        } else {
          modalFooter.querySelector('#btn-move').setAttribute('disabled', true)
          modalFooter.querySelector('#btn-export').setAttribute('disabled', true)
        }

        $("#centralModalSm").on('show.bs.modal', () => {
          modalFooter.querySelector('#btn-move').innerHTML = 'change warehouse'
          modalFooter.querySelector('#btn-export').innerHTML = 'export property'
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
          propertyIdClone.querySelector('input').value = itemObj.propertyId
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

          propertyDiv.querySelector('div#property-infos').innerHTML = ""
          propertyDiv.querySelector('div#property-infos').appendChild(propertyInfoContainer)

          // property movement
          propertyDiv.querySelector('div#property-movement').innerHTML = ""

          var h4_2 = document.createElement('h4')
          h4_2.innerHTML = "II. Property movement"
          h4_2.style.width = "100%"
          propertyDiv.querySelector('div#property-movement').appendChild(h4_2)

          itemObj.movement.forEach(movement => {
            var propertyMovementContainer = document.createElement('div')
            propertyMovementContainer.className = 'property-info-container d-flex flex-wrap justify-content-between'
            for (var prop in movement) {
              if (prop === 'warehouseFrom' || prop === 'warehouseTo') {
                var detailInfoTemplateClone = detailInfoTemplate.cloneNode(true)
                detailInfoTemplateClone.querySelector('label').innerHTML = prop
                detailInfoTemplateClone.querySelector('input').value = movement[prop]
                propertyMovementContainer.appendChild(detailInfoTemplateClone)
              }
            }
            propertyDiv.querySelector('div#property-movement').appendChild(propertyMovementContainer)

          })


        })
        $("#centralModalSm").modal('show')
        $("#centralModalSm").on('hidden.bs.modal', () => {
          propertyDiv.style.display = 'block'
          propertyOptionsDiv.style.display = 'none'
        })
      })
      // tableContainer.querySelector('#table>tbody').appendChild(tr)
      document.querySelector('#' + elementName + '').querySelector('tbody').appendChild(tr)

    })

  }


}

// move property button
modalFooter.querySelector('#btn-move').addEventListener('click', (event) => {
  var itemObj = event.target.closest('.modal-content').querySelector('.modal-body').C_DATA
  console.log('text content: ', itemObj)
  modalFooter.querySelector('#btn-export').setAttribute('disabled', true)

  // create warehouse selector options
  var { warehouseList } = params
  var warehouseSelectOptions = []
  if (warehouseList.length !== 0) {
    warehouseList.map(warehouse => {
      var option = `<option value="${warehouse._id}" storeid="${warehouse.storeId}" warehouseid="${warehouse.warehouseId}" 
      warehousename="${warehouse.warehouseName}">${warehouse.warehouseName}-${warehouse.warehouseAddress}</option>`
      warehouseSelectOptions.push(option)
    })
  } else {
    warehouseSelectOptions.push(`<option value="">No store</option>`)
  }

  switch (event.target.textContent) {
    case ("change warehouse"):
      // current warehouse
      propertyDiv.style.display = "none"
      propertyOptionsDiv.style.display = "block"
      propertyOptionsDiv.innerHTML = ''
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
      propertyOptionsDiv.appendChild(currentWarehouseContainer)

      // warehouse selector
      createSelect(select, warehouseList[0]._id, 'warehouse-select', 'select-warehouse',
        warehouseSelectOptions, selectLabel, 'Move to: ', selectContainer, propertyOptionsDiv, false)


      break
    case ("change"):
      if (itemObj.currentWarehouse &&
        modalBody.querySelector('select.select-warehouse').value === itemObj.currentWarehouse._id) {
        window.alert("Property's already in this warehouse!")
      } else {
        var warehouseSelect = modalBody.querySelector('select.select-warehouse')
        if (warehouseSelect.value || warehouseSelect.value !== "") {

          var updateObj = {
            ...modalBody.C_DATA,
            currentWarehouse: warehouseSelect.value,
            movement: modalBody.C_DATA.movement.slice(),
          }
          updateObj.movement.push({
            storeId: warehouseSelect.options[warehouseSelect.selectedIndex].getAttribute('storeid'),
            warehouseFrom: findNestedObj(modalBody.C_DATA.currentWarehouse.metadata, 'name', 'name') ?
              findNestedObj(modalBody.C_DATA.currentWarehouse.metadata, 'name', 'name').value : 'None',
            warehouseTo: warehouseSelect.options[warehouseSelect.selectedIndex].getAttribute('warehousename'),
            importDate: new Date(Date.now()).toISOString(),
            importNote: 'Nhap dieu chuyen',
            exportDate: new Date(Date.now()).toISOString(),
            exportNote: 'Xuat dieu chuyen',
          })

          console.log('updateObj: ', updateObj)
          makeRequest("PUT", '/systemMng/properties/' + updateObj._id, 'application/json', JSON.stringify(updateObj), (result) => {
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

// export property button
modalFooter.querySelector('#btn-export').addEventListener('click', (event) => {
  console.log('event: ', event.target.textContent)
  modalFooter.querySelector('#btn-move').setAttribute('disabled', true)

  switch (event.target.textContent) {
    case ("export property"):
      propertyDiv.style.display = "none"
      propertyOptionsDiv.style.display = "block"
      propertyOptionsDiv.innerHTML = ''
      // create exporting reason selector
      const exportingReasonOptions = `
        <option value="0">Xuat tra giai chap</option>
        <option value="1">Xuat gui thanh ly</option>
      `
      createSelect(select, '0', 'exporting-reason-select', 'select-exporting-reason',
        exportingReasonOptions, selectLabel, 'Reason to export ', selectContainer, propertyOptionsDiv, false)

      break
    case ("export"):
      var updateObj = {
        ...modalBody.C_DATA,
        isIn: false,
        lastWarehouse: modalBody.C_DATA.currentWarehouse,
        currentWarehouse: null,
        movement: modalBody.C_DATA.movement.slice()
      }

      // exporting reason select
      var exportingSelect = modalBody.querySelector('select.select-exporting-reason')
      updateObj.movement.push({
        storeId: '',
        warehouseFrom: findNestedObj(modalBody.C_DATA.currentWarehouse.metadata, 'name', 'name') ?
          findNestedObj(modalBody.C_DATA.currentWarehouse.metadata, 'name', 'name').value : 'None',
        warehouseTo: '',
        importDate: '',
        importNote: '',
        exportDate: new Date(Date.now()).toISOString(),
        exportNote: exportingSelect.options[exportingSelect.selectedIndex].text,
      })

      console.log('update obj: ', updateObj)
      makeRequest("PUT", '/systemMng/properties/' + updateObj._id, 'application/json', JSON.stringify(updateObj), (result) => {
        // window.location.href = `/systemMng/warehouses/${result.result.currentWarehouse}/properties?token=${window.localStorage.getItem('accessToken')}`
        window.location.reload()
      })
      break
    default:
  }
  event.target.textContent === "export property" ? event.target.textContent = "export" : event.target.textContent = "export"

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

// get nested value
const getNestedValue = (obj) => {
  var value = obj ? (obj.value !== '' ? obj.value : 'None') : 'None'
  return value
}