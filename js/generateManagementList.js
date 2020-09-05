import { findNestedObj } from './findNestedObj.js'

const detailTemplate = document.createElement('div')
detailTemplate.innerHTML = `
<div class="modal-header text-center">
  <h4 class="modal-title w-100 font-weight-bold">Detail info</h4>
  <button type="button" class="close" data-dismiss="modal" aria-label="Close">
    <span aria-hidden="true">&times;</span>
  </button>
</div>
<div class="modal-body mx-3">

</div>
<div class="modal-footer d-flex justify-content-center">
  <button class="btn btn-default btn-sm" id="btn-edit">Edit</button>
  <button class="btn btn-danger btn-sm" id="btn-delete">Delete</button>
</div>`

const detailInfoTemplate = document.createElement('div')
detailInfoTemplate.className = 'md-form form-group mb-5'
detailInfoTemplate.innerHTML = `
  <input type="text" class="form-control" disabled>
  <label data-error="wrong" data-success="right" ></label>
`
const script = document.createElement('script')
script.src = '/mdbootstrap/js/mdb.min.js'
detailInfoTemplate.prepend(script)

export const generateManagementList = (itemObjs, template, elementName) => {

  itemObjs.forEach(itemObj => {
    const clone = template.content.cloneNode(true)
    clone.querySelector('.info-container').C_DATA = itemObj
    clone.querySelector('.info-container').setAttribute('cData', true)

    let name = findNestedObj(itemObj, 'name', 'fullName').value
    let phoneNumber = findNestedObj(itemObj, 'name', 'phoneNumber').value
    let email = findNestedObj(itemObj, 'name', 'email').value
    let id = itemObj._id

    clone.querySelector('.name').innerHTML = name
    clone.querySelector('.phone-number').innerHTML = phoneNumber
    clone.querySelector('.email').innerHTML = email
    clone.querySelector('.id').innerHTML = id

    clone.querySelector('.info-container').addEventListener('click', (event) => {
      const cData = event.target.closest('.info-container').C_DATA
      console.log('event: ', cData)

      $("#modalContactForm").on('show.bs.modal', () => {
        const modalContent = document.querySelector('#modalContactForm').querySelector('.modal-content')
        modalContent.innerHTML = ''
        const modalBody = detailTemplate.querySelector('.modal-body')
        modalBody.innerHTML = ''

        cData.metadata.forEach(data => {
          const detailInfoTemplateClone = detailInfoTemplate.cloneNode(true)
          var inputDiv = detailInfoTemplateClone.querySelector('input')
          var labelDiv = detailInfoTemplateClone.querySelector('label')
          setInfo(data, inputDiv)
          labelDiv.innerHTML = displayInfoLang(data.dataVie)

          modalBody.appendChild(detailInfoTemplateClone)

        })

        // edit button
        detailTemplate.querySelector('.modal-footer').querySelector('#btn-edit').addEventListener('click', event=>{
          switch(event.target.textContent){
            case "Edit":
              modalBody.querySelectorAll('input').forEach(input=>{
                input.removeAttribute('disabled')
              })
              break
            case "Update":
              var updateObj = {...itemObj, metadata: []}
              modalBody.querySelectorAll('input').forEach(input=>{
                input.setAttribute('disabled', true)
                updateObj.metadata.push(getInfo(input))
              })
              console.log('update obj: ', updateObj)
              $.ajax({
                type: "PUT",
                url: "employees/"+ itemObj._id,
                contentType: 'application/json',
                data: JSON.stringify(updateObj),
                success: result=>{
                  console.log('result: ', result)
                  window.location.reload()
                }
              })
              break
            default:

          }
          event.target.textContent = event.target.textContent === "Edit"? event.target.textContent = "Update" : event.target.textContent = "Edit"

         
        })

        // delete button
        detailTemplate.querySelector('.modal-footer').querySelector('#btn-delete').addEventListener('click', event=>{
          $.ajax({
            type: "DELETE",
            url: 'employees/'+itemObj._id,
            contentType: 'application/json',
            success: result=>{
              console.log('result: ', result)
              window.location.reload()
            }
          })
        })

        modalContent.appendChild(detailTemplate)


      })
      $("#modalContactForm").modal('show')

    })
    document.querySelector('#' + elementName + '').appendChild(clone)


  })

}

const displayInfoLang = (info) => {
  if (typeof info === "string") {
    // // re-uppercase
    // var infoLang = info.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    // uppercase the first letter
    var infoLang = info.charAt(0).toUpperCase() + info.slice(1)
    // split based on uppercase letters
    if(infoLang.match(/[A-Z][a-z]+|[0-9]+/g) !== null){
      infoLang = infoLang.match(/[A-Z][a-z]+|[0-9]+/g).join(" ")
    } 
    return infoLang

  }
  return info

}

const getInfo = (input)=>{
  return {
    cType: input.type,
    dataKor: input.getAttribute('data-kor'),
    dataVie: input.getAttribute('data-vie'),
    name: input.getAttribute('name'),
    value: input.value
  }
}

const setInfo = (data, inputDiv)=>{
  inputDiv.type = data.cType
  inputDiv.value = data.value
  inputDiv.setAttribute('name', data.name)
  inputDiv.setAttribute('data-vie', data.dataVie)
  inputDiv.setAttribute('data-kor', data.dataKor)
}