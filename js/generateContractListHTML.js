import { findNestedObj } from './findNestedObj.js'
import { makeRequest } from './makeRequest.js'


export const generateContractListHTML = (itemObj, template, elementName, payload, roleAbility) => {
  console.log('item obj from contract list: ', itemObj)
  const clone = template.content.cloneNode(true)
  clone.querySelector('.object-div').C_DATA = itemObj
  // contract status
  var contractStatus = itemObj["contractStatus"]
  clone.querySelector('.object-div').setAttribute('data-status', contractStatus)

  // contract image
  var contractImage = findNestedObj(itemObj, 'name', 'image')
  clone.querySelector('img').setAttribute('src', contractImage.value)

  // contract name
  var contractName = findNestedObj(itemObj, 'name', 'templateName')
  clone.querySelector('.contract-title').innerHTML = contractName ? contractName.value : "Contract name"

  // contract id
  var contractId = itemObj.id
  clone.querySelector('.contract-id').innerHTML = `Ma hop dong: ${contractId}`

  // contract info
  itemObj.contractMetadata.forEach(item => {
    if (item.name === "creator" || item.name === "customer" || item.name === "createdDate") {
      const infoDiv = document.createElement('div')
      infoDiv.innerHTML = item.name.charAt(0).toUpperCase() + item.name.slice(1) + ': ' + item.value
      clone.querySelector('.contract-info').appendChild(infoDiv)
    }
  })

  const button = clone.querySelector('.object-div').querySelector('button')
  // const completeBtn = clone.querySelector('.object-div').querySelector('button[id="btn-complete]')

  if (button) {
    switch (contractStatus) {
      case ("waiting"):
        button.id = 'btn-approve'
        button.innerHTML = 'approve'
        break
      case ("approved"):
        button.id = 'btn-complete'
        button.className = 'btn btn-raised btn-primary btn-sm'
        button.innerHTML = 'complete'
        break
      case ("completed"):
        clone.querySelector('.object-div').querySelector('.btn-options').removeChild(clone.querySelector('.object-div').querySelector('button'))

        break
      default:
        button.id = 'btn-waiting'
        button.innerHTML = 'waiting'
    }
    button.addEventListener('click', (event) => {
      let textContent = event.target.textContent
      if (textContent === "approve") {
        makeRequest('PUT', 'contracts/' + itemObj._id, 'application/json', JSON.stringify({ contractStatus: 'approved', contract: itemObj }), (result) => {
          event.target.closest('.object-div').C_DATA = result.result
          console.log('event: ', event.target.closest('.object-div').C_DATA)
          event.target.closest('.object-div').setAttribute('data-status', 'approved')
          event.target.innerHTML = 'complete'
          event.target.className = 'btn btn-raised btn-primary btn-sm'
        })

      } else if (textContent === "complete") {
        makeRequest('PUT', 'contracts/' + itemObj._id, 'application/json', JSON.stringify({ contractStatus: 'completed', contract: itemObj }), async (result) => {
          event.target.closest('.object-div').C_DATA = result.result
          console.log('event: ', event.target.closest('.object-div').C_DATA)
          event.target.closest('.object-div').setAttribute('data-status', 'completed')
          // event.target.style.display = 'none'
          event.target.closest('.object-div').querySelector('.btn-options').removeChild(event.target)
        })

      }
      event.stopPropagation()
    })
  }

  // add delete contract buutton
  if (payload.role === "root") {
    var delBtn = document.createElement('button')
    delBtn.className = 'btn btn-danger btn-raised btn-sm'
    delBtn.innerHTML = "delete contract"
    delBtn.addEventListener('click', (event) => {
      console.log('event: ', event.target.closest('.object-div').C_DATA._id)
      event.stopPropagation()
      makeRequest('DELETE', `contracts/${event.target.closest('.object-div').C_DATA._id}`, 'application/json', {}, () => {
        window.location.reload()
      })

    })
    clone.querySelector('.btn-options').appendChild(delBtn)

  }
  document.body.querySelector('#' + elementName + '').appendChild(clone)
}
