export const generateContractTemplateHTML = (itemObj, template, elementName) => {
  const infoContainer = document.createElement('div')
  console.log('abc: ', itemObj.infos)
  itemObj.infos.map(info => {
    if(info.name == "image"){
      var img = document.createElement('img')
      img.src = info.value
      img.alt = info.value
      infoContainer.appendChild(img)
    } else {
      const clone = document.importNode(template.content, true)

      var input = clone.querySelector('input')
      input.value = info.value
      if(info.value !== null){
        input.removeAttribute('disabled')
  
      }
      input.type = info.c_type
      
      var label = clone.querySelector('label')
      label.innerHTML = info.name
      infoContainer.appendChild(clone)
    }
    
  })
  document.body.querySelector('#' + elementName + '').appendChild(infoContainer)

}