// used when user clicks to "create contract button"
export const generateContractTemplateHTML = (itemObj, template, elementName) => {
  console.log('itemobjs from generaete contract template htlm: ', itemObj)
  const infoContainer = document.createElement('div')
  infoContainer.className = 'object-div'
  infoContainer.setAttribute('c_data', true)
  infoContainer.C_DATA = itemObj


  // contract image 
  const imageInfo = findNestedObj(itemObj, 'name', 'image')
  console.log('image: ', imageInfo)
  var imgContainer = document.createElement('div')
  imgContainer.style.width = "320px"
  imgContainer.style.height = "180px"
  imgContainer.style.margin = "auto"

  var img = document.createElement('img')
  img.style.width = "100%"
  img.style.height = "auto"
  img.src = imageInfo.value
  img.alt = imageInfo.value
  imgContainer.appendChild(img)
  infoContainer.appendChild(imgContainer)

  // contract metadata
  itemObj.contractMetadata.map(info => {
    if(info.name !== 'image'){
      const clone = document.importNode(template.content, true)

      var input = clone.querySelector('input')
      if (info.value === null || info.value === "") {
        input.removeAttribute('disabled')
  
      } else {
        input.value = info.value
  
      }
      input.type = info.c_type
  
      var label = clone.querySelector('label')
      label.innerHTML = info.name.charAt(0).toUpperCase() + info.name.slice(1)
      infoContainer.appendChild(clone)
    }
    
  })

  // contract template metadata
  itemObj.templateMetadata.map(info=>{
    if(info.name !== 'image'){
      const clone = document.importNode(template.content, true)

      var input = clone.querySelector('input')
      if (info.value === null || info.value === "") {
        input.removeAttribute('disabled')
  
      } else {
        input.value = info.value.charAt(0).toUpperCase() + info.value.slice(1)
  
      }
      if(info.c_type && info.c_type !== "default value"){
        input.type = info.c_type

      } else {
        input.type = "text"
      }
  
      var label = clone.querySelector('label')
      label.innerHTML = info.name.charAt(0).toUpperCase() + info.name.slice(1)
      infoContainer.appendChild(clone)
    }
  })

  // contract custom infos
  itemObj.infos.map(info => {
    if (info.name !== "image") {
      const clone = document.importNode(template.content, true)
      var input = clone.querySelector('input')

      if (info.value === null || info.value === "") {
        input.removeAttribute('disabled')

      } else {
        input.value = info.value

      }
      input.type = info.c_type

      var label = clone.querySelector('label')
      label.innerHTML = info.name.charAt(0).toUpperCase() + info.name.slice(1)
      document.querySelector('.contract-item-container').querySelector('span').innerHTML = "1"
      document.querySelector('#custom-info').appendChild(clone)
    }

  })

  document.body.querySelector('#' + elementName + '').appendChild(infoContainer)

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