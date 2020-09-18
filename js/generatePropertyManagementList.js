const tableTemplate = `
<template id="table-template">

  <style>
  @import url('https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css')
  @import url('https://cdnjs.cloudflare.com/ajax/libs/bootstrap-table/1.10.0/bootstrap-table.min.css')
  @import url('https://rawgit.com/vitalets/x-editable/master/dist/bootstrap3-editable/css/bootstrap-editable.css')
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
 
  <script src='https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js'></script>
  <script src='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js'></script>
  <script src='https://cdnjs.cloudflare.com/ajax/libs/bootstrap-table/1.10.0/bootstrap-table.js'></script>
  <script
    src='https://cdnjs.cloudflare.com/ajax/libs/bootstrap-table/1.9.1/extensions/editable/bootstrap-table-editable.js'></script>
  <script
    src='https://cdnjs.cloudflare.com/ajax/libs/bootstrap-table/1.9.1/extensions/export/bootstrap-table-export.js'></script>
  <script src='https://rawgit.com/hhurz/tableExport.jquery.plugin/master/tableExport.js'></script>
  <script
    src='https://cdnjs.cloudflare.com/ajax/libs/bootstrap-table/1.9.1/extensions/filter-control/bootstrap-table-filter-control.js'></script>
  <script src="./script.js"></script>
</template>
`

const detailInfoTemplate = document.createElement('div')
detailInfoTemplate.className = 'form-group'
detailInfoTemplate.innerHTML = `
  <label data-error="wrong" data-success="right" ></label>
  <input type="text" class="form-control" disabled placeholder="abc">
`

var selectContainer = document.createElement('div')
selectContainer.className = 'select-container'

var select = document.createElement('select')
select.className = "browser-default custom-select"

var selectLabel = document.createElement('label')

import { findNestedObj } from './findNestedObj.js'
import { createSelect } from './createSelect.js'
import { makeRequest } from './makeRequest.js'
export const generatePropertyManagementList = async (itemObjs, warehouseList, elementName) => {
  var warehouseSelectOptions = warehouseList.map(warehouse => {
    var option = `<option value="${warehouse._id}">${warehouse.name}-${warehouse.address}</option>`
    return option
  })

  // document.querySelector('#' + elementName + '').appendChild(tableContainer)
  const host = document.querySelector('#property-list-container')
  const root = host.attachShadow({ mode: 'closed' })
  root.innerHTML = tableTemplate
  root.appendChild(root.querySelector('#table-template').content.cloneNode(true))

  console.log('root: ', root)
  if (itemObjs.length !== 0) {
    // table header
    var trHeader = document.createElement('tr')
    itemObjs[0].evaluationItem.metadata.forEach(metadata => {
      var th = document.createElement('th')
      th.setAttribute('data-field', metadata.name)
      th.setAttribute('data-sortable', true)
      th.innerHTML = metadata.name
      trHeader.appendChild(th)
    })
    root.querySelector('#table>thead').appendChild(trHeader)

    itemObjs.forEach(itemObj => {
      var tr = document.createElement('tr')
      tr.C_DATA = itemObj
      itemObj.evaluationItem.metadata.forEach(metadata => {
        var td = document.createElement('td')
        td.innerHTML = metadata.value
        tr.appendChild(td)
      })
      tr.addEventListener('click', (event) => {
        console.log('event: ', event.target.closest('tr').C_DATA)
        var propertyData = event.target.closest('tr').C_DATA
        const modalBody = document.querySelector('.modal-body')
        const modalFooter = document.querySelector('.modal-footer')
        $("#centralModalSm").on('show.bs.modal', () => {
          var propertyInfoContainer = document.createElement('div')
          propertyInfoContainer.className = 'property-info-container d-flex flex-wrap justify-content-between'

          // property infos
          var h4 = document.createElement('h4')
          h4.innerHTML = "I. Property infos"
          h4.style.width = "100%"
          propertyInfoContainer.appendChild(h4)
          propertyData.infos.forEach(info => {
            var detailInfoTemplateClone = detailInfoTemplate.cloneNode(true)
            detailInfoTemplateClone.querySelector('label').innerHTML = info.name
            detailInfoTemplateClone.querySelector('input').value = info.value
            propertyInfoContainer.appendChild(detailInfoTemplateClone)
          })
          // current warehouse
          var detailInfoTemplateClone = detailInfoTemplate.cloneNode(true)
          detailInfoTemplateClone.querySelector('label').innerHTML = findNestedObj(propertyData.currentWarehouse, 'name', 'name').dataVie

          detailInfoTemplateClone.querySelector('input').value = findNestedObj(propertyData.currentWarehouse, 'name', 'name').value

          propertyInfoContainer.appendChild(detailInfoTemplateClone)

          modalBody.innerHTML = ""
          modalBody.appendChild(propertyInfoContainer)
          modalFooter.querySelector('#btn-move').addEventListener('click', (event) => {
            console.log('text content: ', event.target.textContent)
            switch (event.target.textContent) {
              case ("change warehouse"):
                modalBody.innerHTML = ""
                const currentWarehouseContainer = document.createElement('div')
                currentWarehouseContainer.className = "current-warehouse"

                const currentWarehouseLabel = document.createElement('label')
                currentWarehouseLabel.className = "current-warehouse-label"
                currentWarehouseLabel.innerHTML = "Current warehouse"
                currentWarehouseContainer.appendChild(currentWarehouseLabel)

                const currentWarehouse = document.createElement('p')
                currentWarehouse.className = 'text-center'
                currentWarehouse.innerHTML = `${findNestedObj(itemObj.currentWarehouse, 'name', 'name').value}
           -${findNestedObj(itemObj.currentWarehouse, 'name', 'address').value}`
                currentWarehouseContainer.appendChild(currentWarehouse)
                modalBody.appendChild(currentWarehouseContainer)

                createSelect(select, warehouseList[0]._id, 'warehouse-select', 'select-warehouse',
                  warehouseSelectOptions, selectLabel, 'Move to: ', selectContainer, modalBody, false)
                break
              case ("change"):
                var updateObj = {
                  currentWarehouse: null,
                  movement: itemObj.movement
                }
                if (modalBody.querySelector('select.select-warehouse').value === itemObj.currentWarehouse._id) {
                  window.alert("Property's already in this warehouse!")
                } else {
                  if (modalBody.querySelector('select.select-warehouse').value ||
                    modalBody.querySelector('select.select-warehouse').value !== "") {
                    updateObj.currentWarehouse = modalBody.querySelector('select.select-warehouse').value
                    updateObj.movement.push(modalBody.querySelector('select.select-warehouse').value)
                    makeRequest("PUT", '/systemMng/properties/' + itemObj._id, 'application/json', JSON.stringify(updateObj), (result) => {
                      // window.location.href = `/systemMng/warehouses/${result.result.currentWarehouse}/properties?token=${window.localStorage.getItem('accessToken')}`
                      window.location.reload()
                    })
                  }
                }
                console.log('updateObj: ', updateObj)
                break
              default:
            }
            event.target.textContent === "change warehouse" ? event.target.textContent = "change" : event.target.textContent = "change"

          })
        })
        $("#centralModalSm").modal('show')
      })
      root.querySelector('#table>tbody').appendChild(tr)
    })
  }


}