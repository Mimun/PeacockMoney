import { findNestedObj } from './findNestedObj.js'
export const generateContractListHTML = (itemObj, template, elementName) => {
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

  if (contractStatus === "waiting") {
    button.id = 'btn-approve'
    button.innerHTML = 'Approve'
    // clone.querySelector('.object-div').querySelector('.btn-options').removeChild(clone.querySelector('.object-div').querySelector('button[id="btn-complete"]'))
  } else if (contractStatus === "approved") {
    button.id = 'btn-complete'
    button.className = 'btn btn-raised btn-primary btn-sm'
    button.innerHTML = 'Complete'
  } else if (contractStatus === "completed") {
    clone.querySelector('.object-div').querySelector('.btn-options').removeChild(clone.querySelector('.object-div').querySelector('button'))
  }

  button.addEventListener('click', (event) => {
    let textContent = event.target.textContent
    if (textContent.toLowerCase() === "approve") {
      $.ajax({
        type: "PUT",
        url: 'contracts/' + itemObj._id,
        contentType: 'application/json',
        data: JSON.stringify({ contractStatus: 'approved' }),
        success: result => {
          console.log(result)
        }
      })
      event.target.closest('.object-div').setAttribute('data-status', 'approved')
      event.target.innerHTML = 'Complete'
      event.target.className = 'btn btn-raised btn-primary btn-sm'
    } else if (textContent.toLowerCase() === "complete") {
      $.ajax({
        type: "PUT",
        url: 'contracts/' + itemObj._id,
        contentType: 'application/json',
        data: JSON.stringify({ contractStatus: 'completed' }),
        success: result => {
          console.log(result)
        }
      })
      event.target.closest('.object-div').setAttribute('data-status', 'completed')
      event.target.closest('.object-div').querySelector('.btn-options').removeChild(event.target)
    }
    event.stopPropagation()
  })

  document.body.querySelector('#' + elementName + '').appendChild(clone)
}
