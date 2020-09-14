import { findNestedObj } from './findNestedObj.js'
// used when rendering "Quan ly va Tao mau hop dong" page
export const generateContractTemplateCard = (itemObj, template, elementName) => {
  const clone = template.content.cloneNode(true)
  var modalBody = document.querySelector('.modal-body')
  var modalFooter = document.querySelector('.modal-footer')
  // image
  var contractTemplateImage = findNestedObj(itemObj, 'name', 'image').value
  clone.querySelector('img').setAttribute('src', contractTemplateImage)

  // title
  const title = findNestedObj(itemObj, 'name', 'templateName')
  clone.querySelector('.card-title').innerHTML = title.value ? title.value : "Template name"

  // short info
  var cardText = clone.querySelector('.card-text')
  const createCardText = (info, sourceDiv) => {
    var cardTextClone = sourceDiv.cloneNode(true)
    cardTextClone.innerHTML = displayInfoLang(info.dataVie) + ": " + info.value
    clone.querySelector('.card-body').appendChild(cardTextClone)
  }
  var min = findNestedObj(itemObj, 'name', 'min')
  var max = findNestedObj(itemObj, 'name', 'max')
  if (min) {
    createCardText(min, cardText)
  }
  if (max) {
    createCardText(max, cardText)
  }

  clone.querySelector('.object-div').addEventListener('click', function (evt) {
    $("#centralModalSm").modal('show');
    
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

    const buttonOptions = modalFooter.querySelector('.btn-options')
    while (buttonOptions.firstChild){
      buttonOptions.removeChild(buttonOptions.lastChild)
    }
    const createNewContractButton = document.createElement('button')
    createNewContractButton.id = 'btn-create-new-contract'
    createNewContractButton.className = "btn btn-primary btn-sm"
    createNewContractButton.innerHTML = "Create new contract"
    createNewContractButton.addEventListener('click', () => {
      var evaluatingItem = JSON.parse(window.localStorage.getItem('evaluatingItem'))
      $.redirect("createNewContract", { data: JSON.stringify(itemObj), evaluatingItem: JSON.stringify(evaluatingItem) }, "POST");
      window.localStorage.removeItem('evaluatingItem')
    })
    buttonOptions.appendChild(createNewContractButton)

    const deleteContractTemplateButton = document.createElement('button')
    deleteContractTemplateButton.id = 'btn-delete-contract-template'
    deleteContractTemplateButton.className = "btn btn-outline-danger btn-sm"
    deleteContractTemplateButton.innerHTML = "Delete template"
    deleteContractTemplateButton.addEventListener('click', (event) => {
      $.ajax({
        type: "DELETE",
        url: 'deleteContractTemplate/' + itemObj._id,
        contentType: 'application/json',
        success: (result) => {
          console.log(result)
          window.location.reload()
        }

      })
    })
    buttonOptions.appendChild(deleteContractTemplateButton)
    modalFooter.appendChild(buttonOptions)

    var cardClone = this.querySelector('img').cloneNode(true)
    // cardClone.C_DATA = this.C_DATA
    // cardClone.className = "d-flex align-items-stretch object-div"
    modalBody.querySelector('.template-preview').prepend(cardClone)

    const templateInfoContainer = document.createElement('div')
    templateInfoContainer.className = "template-info-container list-group"
    templateInfoContainer.style.margin = '14px 0'

    itemObj.templateMetadata.map(info => {
      if (info.name !== "image" && info.name !== "contractContent") {
        const infoContainer = document.createElement('div')
        infoContainer.className = 'info-container list-group-item'
        infoContainer.style.display = 'flex'
        infoContainer.style.flexDirection = 'row'

        const label = document.createElement('div')
        label.className = 'label'
        label.innerHTML = displayInfoLang(info.dataVie) + ": " + info.value
        infoContainer.appendChild(label)
        templateInfoContainer.appendChild(infoContainer)
      }
    })
    modalBody.querySelector('.template-info').appendChild(templateInfoContainer)
  })
  clone.querySelector('.object-div').C_DATA = itemObj

  document.body.querySelector('#' + elementName + '').appendChild(clone)
}

const displayInfoLang = (info) => {
  if (typeof info === "string") {
    // uppercase the first letter
    var infoLang = info.charAt(0).toUpperCase() + info.slice(1)
    // split based on uppercase letters
    if (infoLang.match(/[A-Z][a-z]+|[0-9]+/g) !== null) {
      infoLang = infoLang.match(/[A-Z][a-z]+|[0-9]+/g).join(" ")
    }
    return infoLang

  }
  return info

}