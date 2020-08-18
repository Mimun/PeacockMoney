// used for generating list of evaluation item


export const generateHTML = (itemObjs, template, elementName) => {

  // if (document.querySelector('#item-list-container')) {
  //   console.log('item list container: ', document.querySelector('#item-list-container'))
  //   document.querySelector('#item-list-container').parentNode.innerHTML = ''
  // }
  // if (document.querySelector('.metadata-container')) {
  //   console.log('item list container: ', document.querySelector('.metadata-container'))

  //   document.querySelector('.metadata-container').parentNode.innerHTML = ''

  // }
  const clone = document.importNode(template.content, true)

  const itemListContainer = clone.querySelector('#item-list-container')
  if (itemListContainer.firstChild) {
    itemListContainer.innerHTML = ''
  }

  // for item metadata
  const metadataContainer = clone.querySelector('.metadata-container')
  if (metadataContainer.firstChild) {
    metadataContainer.innerHTML = ''
  }
  Object.keys(itemObjs[0].metadata).forEach((key, index) => {
    const keyDiv = document.createElement('div')
    keyDiv.style.margin = '5px'
    keyDiv.style.fontWeight = 'bold'
    keyDiv.innerHTML = key + ": " + itemObjs[0].metadata[key]
    metadataContainer.appendChild(keyDiv)

  })

  // item list
  itemObjs.map(itemObj => {
    // item container
    const objDiv = document.createElement('div')
    objDiv.className = "object-div"
    objDiv.C_DATA = itemObj
    // objDiv.setAttribute('custom_id', itemObj.infos.map(info => {
    //   return info.value
    // }).join("-"))

    objDiv.setAttribute('c_data', true)

    // create item info row
    for (var i = 0; i < objDiv.C_DATA.infos.length; i++) {
      // create a row div
      const row = document.createElement('div')
      row.style.display = 'flex'
      row.style.flexDirection = 'row'

      if (i != 0) {
        // body of table

        // body row
        row.className = 'mdc-data-table__row row-div'

        // label of info
        const label = document.createElement('input')
        label.className = 'mdc-data-table__cell cell-div form-control'

        label.setAttribute('value', objDiv.C_DATA.infos[i].name)
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

      } else {
        // header of table

        // header row
        row.className = 'mdc-data-table__header-row header-row-div'
        row.setAttribute('data-toggle', 'modal')
        row.setAttribute('data-target', '#itemModal')
        

        // info label
        const label = document.createElement('input')
        label.setAttribute('value', objDiv.C_DATA.infos[i].value)
        label.setAttribute('disabled', true)
        label.setAttribute('obj_property', 'value')
        label.className = 'mdc-data-table__header-cell header-cell-div'

        // append label and value of info into a row
        row.appendChild(label)

      }

      // append row into item container
      objDiv.appendChild(row)

      // append rows into detail container
      itemListContainer.appendChild(objDiv)
    }
  })

  // append clone table to table container
  document.body.querySelector('#'+elementName+'').appendChild(clone)

 

}

