import { findNestedObj } from './findNestedObj.js'

const detailEmployeeTemplate = document.createElement('div')
detailEmployeeTemplate.innerHTML = `
<div class="modal-header text-center">
  <h4 class="modal-title w-100 font-weight-bold">Detail info</h4>
  <button type="button" class="close" data-dismiss="modal" aria-label="Close">
    <span aria-hidden="true">&times;</span>
  </button>
</div>
<div class="modal-body mx-3 object-div d-flex justify-content-between flex-wrap">
</div>
<div class="modal-footer d-flex justify-content-center">
  <button class="btn btn-raised btn-primary btn-sm" id="btn-edit">Edit</button>
  <button class="btn btn-danger btn-sm" id="btn-delete">Delete</button>
</div>`

const detailInfoTemplate = document.createElement('div')
// detailInfoTemplate.className = 'form-group md-form'
// detailInfoTemplate.innerHTML = `
//   <input type="text" class="form-control" disabled placeholder="abc">
//   <label data-error="wrong" data-success="right" ></label>

// `
detailInfoTemplate.className = 'form-group'
detailInfoTemplate.innerHTML = `
  <label data-error="wrong" data-success="right" ></label>
  <input type="text" class="form-control" disabled placeholder="abc">
`

// select
var selectContainer = document.createElement('div')
selectContainer.className = 'select-container'

var select = document.createElement('select')
select.className = "browser-default custom-select"

var selectLabel = document.createElement('label')


var employeeSelectOptions = `
  <option name="role" value="member" data-vie="chucVu" data-kor="koreanString" selected>Member</option>
  <option name="role" value="admin" data-vie="chucVu" data-kor="koreanString">Admin</option>
  <option name="role" value="superAdmin" data-vie="chucVu" data-kor="koreanString">Super Admin</option>
  <option name="role" value="root" data-vie="chucVu" data-kor="koreanString">Root</option>

`

const modalContent = document.querySelector('#modalContactForm').querySelector('.modal-content')
const modalBody = detailEmployeeTemplate.querySelector('.modal-body')

export const generateEmployeeManagementList = (mainList, selectList, template, elementName, routerName) => {
  mainList.forEach(itemObj => {
    const clone = template.content.cloneNode(true)
    clone.querySelector('.info-container').C_DATA = itemObj
    clone.querySelector('.info-container').setAttribute('cData', true)

    let name = findNestedObj(itemObj.metadata, 'name', 'fullName').value
    let phoneNumber = findNestedObj(itemObj.metadata, 'name', 'phoneNumber').value
    let email = findNestedObj(itemObj.metadata, 'name', 'email').value
    let id = itemObj._id
    let role = findNestedObj(itemObj.metadata, 'name', 'role').value

    clone.querySelector('.name').innerHTML = name
    clone.querySelector('.phone-number').innerHTML = phoneNumber
    clone.querySelector('.email').innerHTML = email
    clone.querySelector('.id').innerHTML = id
    clone.querySelector('.role').innerHTML = role

    clone.querySelector('.info-container').addEventListener('click', (event) => {
      const cData = event.target.closest('.info-container').C_DATA
      console.log('event: ', cData)
      detailEmployeeTemplate.querySelector('.object-div').C_DATA = cData

      $("#modalContactForm").on('show.bs.modal', () => {
        modalContent.innerHTML = ''
        modalBody.innerHTML = ''
        detailEmployeeTemplate.querySelector('#btn-edit').textContent = "Edit"
        cData.metadata.forEach(data => {
          if (data.cType === 'select') {
            createSelect(select, data.value, 'employee-select', 'select-role', employeeSelectOptions, selectLabel, 'Phan quyen', selectContainer)
          } else if (data.cType === 'image') {
            var imageContainer = document.createElement('div')
            imageContainer.className = 'img-container avatar-container'
            imageContainer.innerHTML = `<img src="${data.value}">`
            modalBody.appendChild(imageContainer)

          } else {
            const detailInfoTemplateClone = detailInfoTemplate.cloneNode(true)
            var inputDiv = detailInfoTemplateClone.querySelector('input')
            var labelDiv = detailInfoTemplateClone.querySelector('label')
            setInfo(data, inputDiv)
            labelDiv.innerHTML = displayInfoLang(data.dataVie)
            // const script = document.createElement('script')
            // script.src = '/mdbootstrap/js/mdb.min.js'
            // detailInfoTemplateClone.prepend(script)
            modalBody.appendChild(detailInfoTemplateClone)
          }
        })
        var storeSelectOptions = selectList.map(select => {
          var option = `<option value=${select._id}>${select.fullName} - ${select.address}</option>`
          return option
        })
        storeSelectOptions.unshift('<option value="">No store</option>')
        if (cData.store) {
          createSelect(select, cData.store, 'store-select', 'select-store', storeSelectOptions, selectLabel, 'Cua hang', selectContainer)

        } else {
          createSelect(select, '', 'store-select', 'select-store', storeSelectOptions, selectLabel, 'Cua hang', selectContainer)

        }
        modalContent.appendChild(detailEmployeeTemplate)

      })
      $("#modalContactForm").modal('show')
      $("#modalContactForm").on('hidden.bs.modal', () => {

      })


    })
    document.querySelector('#' + elementName + '').appendChild(clone)
  })

  // edit button
  detailEmployeeTemplate.querySelector('.modal-footer').querySelector('#btn-edit').addEventListener('click', event => {
    switch (event.target.textContent) {
      case "Edit":
        modalBody.querySelectorAll('input').forEach(input => {
          input.removeAttribute('disabled')
        })
        modalBody.querySelectorAll('select').forEach(select => {
          select.disabled = false
        })
        break
      case "Update":
        var updateObj = { ...event.target.closest('.modal-content').querySelector('.object-div').C_DATA, metadata: [] }
        updateObj.metadata.push({
          cType: 'image',
          dataKor: 'koreanString',
          name: 'avatar',
          value: modalBody.querySelector('img').getAttribute('src'),
          dataVie: 'anhDaiDien'
        })

        modalBody.querySelectorAll('input').forEach(input => {
          input.setAttribute('disabled', true)
          updateObj.metadata.push(getInfo(input))
        })
        var roleSelect = modalBody.querySelector('.select-role')
        var roleOption = roleSelect.options[roleSelect.selectedIndex]
        updateObj.metadata.push({ ...getInfo(roleOption), cType: 'select' })
        roleSelect.disabled = true

        var storeSelect = modalBody.querySelector('.select-store')
        var storeOption = storeSelect.options[storeSelect.selectedIndex]
        updateObj.store = storeOption.value
        storeSelect.disabled = true

        console.log('update obj: ', updateObj)
        $.ajax({
          type: "PUT",
          url: routerName + "/" + event.target.closest('.modal-content').querySelector('.object-div').C_DATA._id,
          contentType: 'application/json',
          data: JSON.stringify(updateObj),
          success: result => {
            console.log('result: ', result)
            window.location.reload()
          }
        })
        break
      default:

    }
    event.target.textContent = event.target.textContent === "Edit" ? event.target.textContent = "Update" : event.target.textContent = "Edit"
  })

  // delete button
  detailEmployeeTemplate.querySelector('.modal-footer').querySelector('#btn-delete').addEventListener('click', event => {
    $.ajax({
      type: "DELETE",
      url: routerName + '/' + event.target.closest('.modal-content').querySelector('.object-div').C_DATA._id,
      contentType: 'application/json',
      success: result => {
        console.log('result: ', result)
        window.location.reload()
      }
    })
  })
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

const getInfo = (input) => {
  return {
    cType: input.type,
    dataKor: input.getAttribute('data-kor'),
    dataVie: input.getAttribute('data-vie'),
    name: input.getAttribute('name'),
    value: input.value
  }
}

const setInfo = (data, inputDiv) => {
  inputDiv.type = data.cType
  inputDiv.value = data.value
  inputDiv.setAttribute('name', data.name)
  inputDiv.setAttribute('data-vie', data.dataVie)
  inputDiv.setAttribute('data-kor', data.dataKor)
}

const createSelect = (selectTemplate, selecteValue, selectId, selectClassName, selectOptions, labelTemplate, labelContent, selectContainer) => {
  var select = selectTemplate.cloneNode(true)
  select.id = selectId
  select.innerHTML = selectOptions
  select.value = selecteValue
  select.classList.add(selectClassName)
  select.disabled = true

  var selectLabel = labelTemplate.cloneNode(true)
  selectLabel.setAttribute('for', selectId)
  selectLabel.innerHTML = labelContent

  var selectContainerClone = selectContainer.cloneNode(true)
  selectContainerClone.appendChild(selectLabel)
  selectContainerClone.appendChild(select)
  modalBody.appendChild(selectContainerClone)

}