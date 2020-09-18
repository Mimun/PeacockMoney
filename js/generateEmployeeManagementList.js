import { findNestedObj } from './findNestedObj.js'
import { makeRequest } from './makeRequest.js'
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


var roleSelectOptions = `
  <option name="role" value="member" data-vie="chucVu" data-kor="koreanString" selected>Member</option>
  <option name="role" value="admin" data-vie="chucVu" data-kor="koreanString">Admin</option>
  <option name="role" value="superAdmin" data-vie="chucVu" data-kor="koreanString">Super Admin</option>
  <option name="role" value="root" data-vie="chucVu" data-kor="koreanString">Root</option>

`
const modalContent = document.querySelector('#modalContactForm').querySelector('.modal-content')
const modalBody = detailEmployeeTemplate.querySelector('.modal-body')


var param = {}
export const generateEmployeeManagementList = async (mainList, selectList, template, elementName, routerName, user, roleAbility) => {
  await Object.assign(param, { routerName, user, roleAbility })
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
          if (data.cType === 'image') {
            var imageContainer = document.createElement('div')
            imageContainer.className = 'img-container avatar-container'
            imageContainer.innerHTML = `<img src="${data.value}">`
            modalBody.appendChild(imageContainer)

          } else {
            if (data.cType !== 'select') {
              const detailInfoTemplateClone = detailInfoTemplate.cloneNode(true)
              var inputDiv = detailInfoTemplateClone.querySelector('input')
              var labelDiv = detailInfoTemplateClone.querySelector('label')
              setInfo(data, inputDiv)
              labelDiv.innerHTML = displayInfoLang(data.dataVie)
              modalBody.appendChild(detailInfoTemplateClone)
            }
          }
        })

        // store select options
        var storeSelectOptions = []
        storeSelectOptions.push('<option value="">No store</option>')
        if (selectList !== 0) {
          selectList.map(select => {
            var option = `<option name="store" data-vie="cuaHang" data-kor="koreanString" value=${select._id}>${select.fullName} - ${select.address}</option>`
            storeSelectOptions.push(option)
          })
        }
        if (findNestedObj(itemObj, 'name', 'store')) {
          if (selectList.includes(findNestedObj(itemObj, 'name', 'store')).value) {
            modalBody.appendChild(createSelect(select, findNestedObj(itemObj, 'name', 'store').value, 'store', 'cuaHang', 'koreanString', true, storeSelectOptions, selectLabel, 'Cua hang', selectContainer))
          } else {
            modalBody.appendChild(createSelect(select, '', 'store', 'cuaHang', 'koreanString', true, storeSelectOptions, selectLabel, 'Cua hang', selectContainer))
          }

        } else {
          modalBody.appendChild(createSelect(select, '', 'store', 'cuaHang', 'koreanString', true, storeSelectOptions, selectLabel, 'Cua hang', selectContainer))

        }
        if (findNestedObj(itemObj, 'name', 'role')) {
          modalBody.appendChild(createSelect(select, findNestedObj(itemObj, 'name', 'role').value, 'role', 'phanQuyen', 'koreanString', true, roleSelectOptions, selectLabel, 'Phan quyen', selectContainer))

        } else {
          modalBody.appendChild(createSelect(select, '', 'role', 'phanQuyen', 'koreanString', true, roleSelectOptions, selectLabel, 'Phan quyen', selectContainer))

        }
        modalBody.querySelector('#role').querySelectorAll('option').forEach(option => {
          if (!roleAbility.create.includes(option.getAttribute('value'))) {
            option.style.display = 'none'
          }
        })
        modalContent.appendChild(detailEmployeeTemplate)

      })
      $("#modalContactForm").modal('show')
      $("#modalContactForm").on('hidden.bs.modal', () => {
      })
    })
    document.querySelector('#' + elementName + '').appendChild(clone)
  })
}

console.log('param: ', param)

// edit button

detailEmployeeTemplate.querySelector('.modal-footer').querySelector('#btn-edit').addEventListener('click', event => {
  var { routerName, user, roleAbility } = param
  editBtnFunction(event, routerName, user, roleAbility)
})

// delete button
detailEmployeeTemplate.querySelector('.modal-footer').querySelector('#btn-delete').addEventListener('click', event => {
  var { routerName, user, roleAbility } = param
  deleteBtnFunction(event, routerName, user)
})

const editBtnFunction = (event, routerName, user, roleAbility) => {
  switch (event.target.textContent) {
    case "Edit":
      console.log('edit')
      if (roleAbility.editInfo === "all") {
        modalBody.querySelectorAll('input').forEach(input => {
          input.removeAttribute('disabled')
        })
        modalBody.querySelectorAll('select').forEach(select => {
          select.disabled = false
        })
      } else {
        modalBody.querySelector('input[name="password"]').disabled = false

      }

      break
    case "Update":
      console.log('update')

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

      modalBody.querySelectorAll('select').forEach(select => {
        updateObj.metadata.push({
          name: select.getAttribute('name'),
          value: select.value,
          dataVie: select.getAttribute('data-vie'),
          dataKor: select.getAttribute('data-kor'),
          cType: 'select'
        })
      })
      if (updateObj._id === user._id) {
        window.localStorage.setItem('user', JSON.stringify({
          userName: findNestedObj(updateObj, 'name', 'fullName').value,
          role: findNestedObj(updateObj, 'name', 'role').value,
          _id: updateObj._id,
          avatar: findNestedObj(updateObj, 'name', 'avatar').value
        }))
      }

      console.log('update obj: ', updateObj)
      makeRequest('PUT', routerName + "/" + event.target.closest('.modal-content').querySelector('.object-div').C_DATA._id,
        'application/json', JSON.stringify(updateObj), () => {
          window.location.reload()
        })

      break
    default:

  }
  event.target.textContent = event.target.textContent === "Edit" ? event.target.textContent = "Update" : event.target.textContent = "Edit"
}

const deleteBtnFunction = (event, routerName, user) => {
  if (user.role !== "member") {
    makeRequest('DELETE', routerName + '/' + event.target.closest('.modal-content').querySelector('.object-div').C_DATA._id,
      'application/json', {}, (result) => {
        if (event.target.closest('.modal-content').querySelector('.object-div').C_DATA._id === user._id) {
          window.localStorage.removeItem('user')
          window.localStorage.removeItem('accessToken')
          window.location.href = "/"
        } else {
          window.location.reload()

        }
      })

  } else {
    window.alert('You need to be beyond member to do that!')
  }

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

export const createSelect = (selectTemplate, selecteValue, selectId, selectVie, selectKor, disabled, selectOptions, labelTemplate, labelContent, selectContainer) => {
  var select = selectTemplate.cloneNode(true)
  select.id = selectId
  select.innerHTML = selectOptions
  select.value = selecteValue
  select.disabled = disabled
  select.setAttribute('name', selectId)
  select.setAttribute('data-vie', selectVie)
  select.setAttribute('data-kor', selectKor)

  var selectLabel = labelTemplate.cloneNode(true)
  selectLabel.setAttribute('for', selectId)
  selectLabel.innerHTML = labelContent

  var selectContainerClone = selectContainer.cloneNode(true)
  selectContainerClone.appendChild(selectLabel)
  selectContainerClone.appendChild(select)
  return selectContainerClone
}
