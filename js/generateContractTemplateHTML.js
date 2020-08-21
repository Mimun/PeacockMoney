// used when user clicks to "create contract button"
export const generateContractTemplateHTML = (itemObj, template, elementName) => {
  console.log('itemobjs from generaete contract template htlm: ', itemObj)
  const infoContainer = document.createElement('div')
  infoContainer.className = 'object-div'
  infoContainer.setAttribute('c_data', true)
  infoContainer.C_DATA = itemObj
  itemObj.infos.map(info => {
    if (info.name == "image") {
      var imgContainer = document.createElement('div')
      imgContainer.style.width = "320px"
      imgContainer.style.height = "180px"
      imgContainer.style.margin = "auto"

      var img = document.createElement('img')
      img.style.width = "100%"
      img.style.height = "auto"
      img.src = info.value
      img.alt = info.value
      imgContainer.appendChild(img)
      infoContainer.appendChild(imgContainer)

    } else {
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
  document.body.querySelector('#' + elementName + '').appendChild(infoContainer)

}