// used when rendering "Quan ly va Tao mau hop dong" page
export const generateContractTemplateCard = (itemObj, template, elementName) => {
  const clone = template.content.cloneNode(true)

  // image
  var contractTemplateImage = findNestedObj(itemObj, 'name', 'image').value
  clone.querySelector('img').setAttribute('src', contractTemplateImage)

  // title
  const title = findNestedObj(itemObj, 'name', 'template name')
  clone.querySelector('.card-title').innerHTML = title.value ? title.value.charAt(0).toUpperCase() + title.value.slice(1) : "Template name"

  // short info
  var cardText = clone.querySelector('.card-text')
  itemObj.templateMetadata.map(info=>{
    var cardTextClone = cardText.cloneNode(true)
    cardTextClone.innerHTML = info.name.charAt(0).toUpperCase() + info.name.slice(1) + ": "+ info.value
    clone.querySelector('.card-body').appendChild(cardTextClone)
  })

  clone.querySelector('.object-div').addEventListener('click', function (evt) {
    $("#centralModalSm").modal('show');
    var modalBody = document.querySelector('modal-body')

    while (modalBody.firstChild) {
      modalBody.removeChild(modalBody.lastChild)
    }

    const container = document.createElement('div')
    container.className = 'container'
    container.innerHTML = `<div class="row">
      <div class="col-4 template-preview"></div>
      <div class="col template-info"></div>
    
    </div>`
    modalBody.appendChild(container)

    const buttonOptions = document.createElement('div')
    buttonOptions.className = 'btn-options'
    buttonOptions.style.display = 'flex'
    buttonOptions.style.flexDirection = 'column'

    const createNewContractButton = document.createElement('button')
    createNewContractButton.id = 'btn-create-new-contract'
    createNewContractButton.className = "btn btn-primary btn-sm"
    createNewContractButton.innerHTML = "Create new contract"
    // createNewContractButton.addEventListener('click', ()=>{
    //   console.log('this is called from create new contract button')
    //   fetch('http://localhost:3000/contractMng/createNewContract', {
    //     method: "POST",
    //     body: JSON.stringify(itemObj),
    //     headers: {
    //       'Content-Type': 'application/json'
    //     },
    //     redirect: 'follow'
    //   }).then(result=>{
    //     console.log('result after posting: ', result)
    //     window.location.href = result.url
    //   })
    // })
    buttonOptions.appendChild(createNewContractButton)


    const deleteContractTemplateButton = document.createElement('button')
    deleteContractTemplateButton.id = 'btn-delete-contract-template'
    deleteContractTemplateButton.className = "btn btn-secondary btn-sm"
    deleteContractTemplateButton.innerHTML = "Delete template"
    buttonOptions.appendChild(deleteContractTemplateButton)
    modalBody.querySelector('.template-preview').appendChild(buttonOptions)

    var cardClone = this.cloneNode(true)
    cardClone.C_DATA = this.C_DATA
    cardClone.className = "d-flex align-items-stretch object-div"
    modalBody.querySelector('.template-preview').prepend(cardClone)

    const templateInfoContainer = document.createElement('div')
    templateInfoContainer.className = "template-info-container list-group"
    templateInfoContainer.style.margin = '14px 0'
    

    itemObj.infos.map(info=>{
      if(info.name !== "image"){
        const infoContainer = document.createElement('div')
        infoContainer.className = 'info-container list-group-item'
        infoContainer.style.display = 'flex'
        infoContainer.style.flexDirection = 'row'

        const label = document.createElement('div')
        label.className = 'label'
        label.style.fontWeight = 'bold'
        label.innerHTML = info.name.charAt(0).toUpperCase() + info.name.slice(1) + ": "+ info.value
        infoContainer.appendChild(label)
  
        // const value = document.createElement('div')
        // value.className = 'value'
        // value.innerHTML = info.value
        // infoContainer.appendChild(value)
        
        templateInfoContainer.appendChild(infoContainer)
      }

      
    })
    modalBody.querySelector('.template-info').appendChild(templateInfoContainer)

  })

  clone.querySelector('.object-div').C_DATA = itemObj

  // clone.setAttribute('id',i)
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