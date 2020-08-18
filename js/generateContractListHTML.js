export const generateContractListHTML = (itemObj, template, elementName) => {
  const clone = template.content.cloneNode(true)
  clone.querySelector('.object-div').C_DATA = itemObj
  // contract status
  var contractStatus = itemObj["contractStatus"]
  clone.querySelector('.object-div').setAttribute('data-status', contractStatus)

  // contract image
  var contractImage = findNestedObj(itemObj, 'name', 'image')
  clone.querySelector('img').setAttribute('src', contractImage.value)

  // contract name
  var contractName = itemObj["metadata"]["template name"]
  clone.querySelector('.contract-title').innerHTML = contractName ? contractName : "Contract name"

  const button = clone.querySelector('.object-div').querySelector('button')
  // const completeBtn = clone.querySelector('.object-div').querySelector('button[id="btn-complete]')

  if (contractStatus === "waiting") {
    button.id = 'btn-approve'
    button.innerHTML = 'Approve'
    // clone.querySelector('.object-div').querySelector('.btn-options').removeChild(clone.querySelector('.object-div').querySelector('button[id="btn-complete"]'))
  } else if (contractStatus === "approved") {
    button.id = 'btn-complete'
    button.className = 'btn btn-secondary btn-sm'
    button.innerHTML = 'Complete'
  } else if(contractStatus === "completed"){
    clone.querySelector('.object-div').querySelector('.btn-options').removeChild(clone.querySelector('.object-div').querySelector('button'))
  }

  document.body.querySelector('#' + elementName + '').appendChild(clone)
}

function findNestedObj(entireObj, keyToFind, valToFind) {
  let foundObj;
  JSON.stringify(entireObj, (_, nestedValue) => {
    if (nestedValue && nestedValue[keyToFind] === valToFind) {
      foundObj = nestedValue;
    }
    return nestedValue;
  });
  return foundObj;
};