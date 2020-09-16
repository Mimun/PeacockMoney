import { findNestedObj } from './findNestedObj.js'

const detailItemButtonOptions = `
<button class="btn btn-primary btn-sm" id="edit">edit</button>
<button class="btn btn-danger btn-sm" id="delete">delete</button>
`

const removeFieldIcon = `<span class="material-icons">remove</span>`
var buttonRemoveField = document.createElement('button')
buttonRemoveField.className = 'btn btn-secondary btn-sm'
buttonRemoveField.innerHTML = removeFieldIcon
buttonRemoveField.id = "removeField"

var modalBody = document.querySelector('#exampleModal').querySelector('.modal-body')
var modalFooter = document.querySelector('#exampleModal').querySelector('.modal-footer')

// used for generating list of evaluation item
export const generateListHTML = (itemObj, template, elementName) => {
  const templateClone = template.content.cloneNode(true)

  const itemContainer = document.createElement('div')
  itemContainer.className = 'object-div'
  itemContainer.C_DATA = itemObj

  // header of item
  const itemType = findNestedObj(itemObj.metadata, 'name', 'type')
  insertValue(templateClone.cloneNode(true), itemType.dataVie, itemType.value, itemContainer, 'info header', true, 'form-control-plaintext')
  itemContainer.querySelector('div.form-inline').style.backgroundColor = 'lightgrey'
  // header of item onclick function
  itemContainer.querySelector('div.form-inline').addEventListener('click', (event) => {
    $('#exampleModal').on('show.bs.modal', () => {
      // append item info into modal body
      const objectDivClone = event.target.closest('.object-div').cloneNode(true)
      objectDivClone.C_DATA = event.target.closest('.object-div').C_DATA
      objectDivClone.removeChild(objectDivClone.querySelector('div.metadata'))
      modalBody.innerHTML = ''
      modalBody.appendChild(objectDivClone)
      modalFooter.innerHTML = detailItemButtonOptions

      // add event for edit button
      modalFooter.querySelector('button#edit').addEventListener('click', (event) => {
        switch (event.target.textContent) {
          case ("edit"):
            modalBody.querySelectorAll('div.row').forEach(div => {
              div.querySelectorAll('input').forEach(input => {
                input.disabled = false
              })
              // add remove field button for each row
              div.appendChild(buttonRemoveField.cloneNode(true))

            })

            // create add field button when clicking edit button
            var addFieldButton = modalFooter.querySelector('button').cloneNode(true)
            addFieldButton.id = 'addField'
            addFieldButton.innerHTML = 'add field'
            addFieldButton.classList.replace('btn-primary', 'btn-info')
            addFieldButton.addEventListener('click', (event) => {
              insertValue(templateClone.cloneNode(true), '', '', objectDivClone, 'info row', false, 'form-control')
              // add remove field button for each row
              objectDivClone.lastElementChild.appendChild(buttonRemoveField.cloneNode(true))
              // add function to remove field buttons
              removeFieldFunction(modalBody)
            })
            modalFooter.prepend(addFieldButton)
            // add function to remove field buttons
            removeFieldFunction(modalBody)

            break

          case ("update"):
            modalBody.querySelectorAll('div.row').forEach(div => {
              div.querySelectorAll('input').forEach(input => {
                input.disabled = true
                input.removeAttribute('class')
                input.setAttribute('class', 'form-control-plaintext')

              })
              if (div.querySelector('button')) {
                div.removeChild(div.querySelector('button'))
              }
            })
            modalFooter.removeChild(modalFooter.querySelector('button#addField'))

            var updateObj = { ...event.target.closest('.modal-content').querySelector('.object-div').C_DATA, infos: [] }
            modalBody.querySelectorAll('div.form-inline.row').forEach(div => {
              updateObj.infos.push({
                cType: 'text',
                name: div.querySelector('input[name="name"]').value,
                value: div.querySelector('input[name="value"]').value,
              })
            })
            console.log('updateObj: ', updateObj)
            $.ajax({
              type: "PUT",
              url: 'items/' + updateObj._id,
              contentType: 'application/json',
              data: JSON.stringify(updateObj),
              success: result => {
                console.log('result')
              }
            })

            break

          default:

        }
        event.target.textContent === "edit" ? event.target.textContent = "update" : event.target.textContent = "edit"
      })

      // add event for delete button
      modalFooter.querySelector('button#delete').addEventListener('click', (event) => {
        $.ajax({
          type: 'DELETE',
          url: 'items/' + event.target.closest('.modal-content').querySelector('.object-div').C_DATA._id,
          contentType: 'application/json',
          success: result => {
            console.log('result: ', result)
          }
        })
      })

    })
    $('#exampleModal').modal('show')
  })
  // body of item
  // evaluating price
  const itemEvaluatingPrice = findNestedObj(itemObj.metadata, 'name', 'evaluatingPrice')
  insertValue(templateClone.cloneNode(true), itemEvaluatingPrice.dataVie, itemEvaluatingPrice.value, itemContainer, 'metadata row', true, 'form-control-plaintext')

  // item info
  itemObj.infos.forEach(info => {
    insertValue(templateClone.cloneNode(true), info.name, info.value, itemContainer, 'info row', true, 'form-control-plaintext')
  })

  // append clone table to table container
  document.body.querySelector('#' + elementName + '').appendChild(itemContainer)
}

// function to insert value to input div
export const insertValue = (template, name, value, divContainer, divName, disabled, inputClassName) => {
  const itemInfo = template.cloneNode(true)
  divName.split(" ").forEach(name => {
    if (name !== "") {
      itemInfo.querySelector('div.form-inline').classList.add(name)
    }
  })
  itemInfo.querySelector('div.name').querySelector('input').value = name
  itemInfo.querySelector('div.name').querySelector('input').disabled = disabled
  itemInfo.querySelector('div.name').querySelector('input').classList.add(inputClassName)

  itemInfo.querySelector('div.value').querySelector('input').value = value
  itemInfo.querySelector('div.value').querySelector('input').disabled = disabled
  itemInfo.querySelector('div.value').querySelector('input').classList.add(inputClassName)

  divContainer.appendChild(itemInfo)
}

// function to remove field
export const removeFieldFunction = (div) => {
  console.log('div: ', div)
  console.log('row: ', div.querySelectorAll('div.form-inline.row'))
  div.querySelectorAll('div.form-inline.row').forEach(div => {
    if (div.querySelector('button#removeField')) {
      div.querySelector('button#removeField').onclick = (event) => {
        event.target.closest('.object-div').removeChild(event.target.closest('div.form-inline'))
      }
    }

  })
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

