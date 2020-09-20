import {findNestedObj} from './findNestedObj.js'
import { addSeparator } from './addSeparatorOnInputChange.js'
// used for generating list of evaluation item
export const generateHTML = (itemObjs, template, elementName) => {
  const clone = document.importNode(template.content, true)

  const itemListContainer = clone.querySelector('#item-list-container')
  if (itemListContainer.firstChild) {
    itemListContainer.innerHTML = ''
  }

  // item list
  itemObjs.map(itemObj => {
    // item container
    const objDiv = document.createElement('div')
    objDiv.className = "object-div"
    objDiv.C_DATA = itemObj
    objDiv.setAttribute('c_data', true)

    // header of obj div container
    const rowHeader = document.createElement('div')
    rowHeader.style.display = 'flex'
    rowHeader.style.flexDirection = 'rowHeader'
    // header rowHeader
    rowHeader.className = 'mdc-data-table__header-row header-row-div'
    rowHeader.setAttribute('data-toggle', 'modal')
    rowHeader.setAttribute('data-target', '#itemModal')


    // info label
    const labelHeader = document.createElement('input')
    labelHeader.setAttribute('value', findNestedObj(itemObj, 'name', 'type').value)
    labelHeader.setAttribute('disabled', true)
    labelHeader.setAttribute('obj_property', 'value')
    labelHeader.className = 'mdc-data-table__header-cell header-cell-div'

    // append label and value of info into a row
    rowHeader.appendChild(labelHeader)
    objDiv.appendChild(rowHeader)
    itemListContainer.appendChild(objDiv)

    // evaluating price
    var evaluatingPrice = findNestedObj(itemObj, 'name', 'evaluatingPrice')
    if (evaluatingPrice) {
      const row = document.createElement('div')
      row.style.display = 'flex'
      row.style.flexDirection = 'row'
      // body row
      row.className = 'mdc-data-table__row row-div'

      // label of info
      const label = document.createElement('input')
      label.className = 'mdc-data-table__cell cell-div form-control'

      label.setAttribute('value', displayInfoLang(evaluatingPrice.dataVie))
      label.setAttribute('disabled', true)
      label.setAttribute('obj_property', 'name')
      // label.obj_property = 'name'

      // value of info
      const value = document.createElement('input')
      value.className = 'mdc-data-table__cell cell-div form-control'

      value.setAttribute('value', addSeparator(evaluatingPrice.value))
      value.setAttribute('disabled', true)
      value.setAttribute('obj_property', 'value')
      // value.obj_property = 'value'

      row.appendChild(label)
      row.appendChild(value)
      // append row into item container
      objDiv.appendChild(row)

      // append rows into detail container
      itemListContainer.appendChild(objDiv)
    }


    for (var i = 0; i < objDiv.C_DATA.infos.length; i++) {
      const row = document.createElement('div')
      row.style.display = 'flex'
      row.style.flexDirection = 'row'
      // body row
      row.className = 'mdc-data-table__row row-div'

      // label of info
      const label = document.createElement('input')
      label.className = 'mdc-data-table__cell cell-div form-control'

      label.setAttribute('value', objDiv.C_DATA.infos[i].dataVie? objDiv.C_DATA.infos[i].dataVie : objDiv.C_DATA.infos[i].name)
      label.setAttribute('disabled', true)
      label.setAttribute('obj_property', 'name')
      // label.obj_property = 'name'

      // value of info
      const value = document.createElement('input')
      value.className = 'mdc-data-table__cell cell-div form-control'

      value.setAttribute('value', objDiv.C_DATA.infos[i].value)
      value.setAttribute('disabled', true)
      value.setAttribute('obj_property', 'value')
      // value.obj_property = 'value'

      row.appendChild(label)
      row.appendChild(value)
      // append row into item container
      objDiv.appendChild(row)

      // append rows into detail container
      itemListContainer.appendChild(objDiv)
    }
  })

  // append clone table to table container
  document.body.querySelector('#' + elementName + '').appendChild(clone)



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

