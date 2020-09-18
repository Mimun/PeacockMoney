const tableTemplate = `
<template id="table-template">
  <link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css'>
  <link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/bootstrap-table/1.10.0/bootstrap-table.min.css'>
  <link rel='stylesheet'
    href='https://rawgit.com/vitalets/x-editable/master/dist/bootstrap3-editable/css/bootstrap-editable.css'>
  <style>
    h2{
      color: red;
      background-color: blue;
    }
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
import { findNestedObj } from './findNestedObj.js'
export const generatePropertyManagementList = async (itemObjs, elementName) => {

  // document.querySelector('#' + elementName + '').appendChild(tableContainer)
  const host = document.querySelector('#property-list-container')
  const root = host.attachShadow({ mode: 'closed' })
  root.innerHTML = tableTemplate
  root.appendChild(root.querySelector('#table-template').content.cloneNode(true))

  console.log('root: ', root)
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
    tr.addEventListener('click', (event)=>{
      console.log('event: ', event.target.closest('tr').C_DATA)
      var propertyData = event.target.closest('tr').C_DATA
      const modalBody = document.querySelector('.modal-body')
      const modalFooter = document.querySelector('.modal-footer')
      $("#centralModalSm").on('show.bs.modal', ()=>{
        var propertyInfoContainer = document.createElement('div')
        propertyInfoContainer.className = 'property-info-container d-flex flex-wrap justify-content-between'

        // property infos
        var h4 = document.createElement('h4')
        h4.innerHTML = "I. Property infos"
        h4.style.width = "100%"
        propertyInfoContainer.appendChild(h4)
        propertyData.infos.forEach(info=>{
          var detailInfoTemplateClone = detailInfoTemplate.cloneNode(true)
          detailInfoTemplateClone.querySelector('label').innerHTML = info.name
          detailInfoTemplateClone.querySelector('input').value = info.value
          propertyInfoContainer.appendChild(detailInfoTemplateClone)
        })
        // current warehouse
        var detailInfoTemplateClone = detailInfoTemplate.cloneNode(true)
        detailInfoTemplateClone.querySelector('label').innerHTML = findNestedObj(propertyData.currentWarehouse, 'name', 'warehouseName').dataVie
        detailInfoTemplateClone.querySelector('input').value =  findNestedObj(propertyData.currentWarehouse, 'name', 'warehouseName').value
        propertyInfoContainer.appendChild(detailInfoTemplateClone)

        modalBody.innerHTML = ""
        modalBody.appendChild(propertyInfoContainer)
        modalFooter.querySelector('#btn-move').addEventListener('click', (event)=>{

          modalBody.innerHTML = ""
        })
      })
      $("#centralModalSm").modal('show')
    })
    root.querySelector('#table>tbody').appendChild(tr)
  })

}