import { findNestedObj } from './findNestedObj.js'

const detailwarehouseTemplate = document.createElement('div')
detailwarehouseTemplate.innerHTML = `
<div class="modal-header text-center">
  <h4 class="modal-title w-100 font-weight-bold">Detail info</h4>
  <button type="button" class="close" data-dismiss="modal" aria-label="Close">
    <span aria-hidden="true">&times;</span>
  </button>
</div>
<div class="modal-body mx-3 object-div">
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

const modalContent = document.querySelector('#modalContactForm').querySelector('.modal-content')
const modalBody = detailwarehouseTemplate.querySelector('.modal-body')




export const generateWarehouseManagementList = (mainList, selectList, template, elementName, routerName) => {
  var representativeSelect = document.createElement('select')
  representativeSelect.className = 'browser-default custom-select select-representative'
  representativeSelect.disabled = true
  representativeSelect.innerHTML = `<option value="">No employee</option>`
  selectList.forEach(select => {
    console.log('select id: ', typeof select._id)
    var option = document.createElement('option')
    option.value = select._id
    option.innerHTML = select.fullName + ' - ' + select.role
    representativeSelect.appendChild(option)
  })
  mainList.forEach(itemObj => {
    const clone = template.content.cloneNode(true)
    clone.querySelector('.info-container').C_DATA = itemObj
    clone.querySelector('.info-container').setAttribute('cData', true)

    let name = findNestedObj(itemObj.metadata, 'name', 'warehouseName').value
    let phoneNumber = findNestedObj(itemObj.metadata, 'name', 'phoneNumber').value
    let email = findNestedObj(itemObj.metadata, 'name', 'email').value
    let id = itemObj._id

    clone.querySelector('.name').innerHTML = name
    clone.querySelector('.phone-number').innerHTML = phoneNumber
    clone.querySelector('.email').innerHTML = email
    clone.querySelector('.id').innerHTML = id


    clone.querySelector('.info-container').addEventListener('click', (event) => {
      const cData = event.target.closest('.info-container').C_DATA
      console.log('event: ', cData)
      detailwarehouseTemplate.querySelector('.object-div').C_DATA = cData

      $("#modalContactForm").on('show.bs.modal', () => {
        modalContent.innerHTML = ''
        modalBody.innerHTML = ''
        detailwarehouseTemplate.querySelector('#btn-edit').textContent = "Edit"
        cData.metadata.forEach(data => {
          if (data.cType !== 'select') {
            const detailInfoTemplateClone = detailInfoTemplate.cloneNode(true)
            var inputDiv = detailInfoTemplateClone.querySelector('input')
            var labelDiv = detailInfoTemplateClone.querySelector('label')
            setInfo(data, inputDiv)
            labelDiv.innerHTML = displayInfoLang(data.dataVie)
            const script = document.createElement('script')
            script.src = '/mdbootstrap/js/mdb.min.js'
            detailInfoTemplateClone.prepend(script)
            modalBody.appendChild(detailInfoTemplateClone)
          }
        })
        if (cData.representatives.length !== 0) {
          cData.representatives.forEach(representative => {
            console.log('representative: ', representative === selectList[0]._id)
            var representativeSelectClone = representativeSelect.cloneNode(true)
            representativeSelectClone.value = representative
            modalBody.appendChild(representativeSelectClone)
          })

        }


        modalContent.appendChild(detailwarehouseTemplate)

      })
      $("#modalContactForm").modal('show')

    })
    document.querySelector('#' + elementName + '').appendChild(clone)


  })

  // edit button
  detailwarehouseTemplate.querySelector('.modal-footer').querySelector('#btn-edit').addEventListener('click', event => {
    switch (event.target.textContent) {
      case "Edit":
        modalBody.querySelectorAll('input').forEach(input => {
          input.removeAttribute('disabled')
        })
        if (modalBody.querySelectorAll('select').length === 0) {
          var representativeSelectClone = representativeSelect.cloneNode(true)
          representativeSelectClone.value = ''
          representativeSelectClone.disabled = false
          modalBody.appendChild(representativeSelectClone)
        } else {
          modalBody.querySelectorAll('select').forEach(select => {
            select.disabled = false
          })
        }

        break
      case "Update":
        var updateObj = { ...event.target.closest('.modal-content').querySelector('.object-div').C_DATA, metadata: [], representatives: [] }
        modalBody.querySelectorAll('input').forEach(input => {
          input.setAttribute('disabled', true)
          updateObj.metadata.push(getInfo(input))
        })
        modalBody.querySelectorAll('select').forEach(select => {
          if (select.value) {
            updateObj.representatives.push(select.value)
          }
        })

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
  detailwarehouseTemplate.querySelector('.modal-footer').querySelector('#btn-delete').addEventListener('click', event => {
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
    // // re-uppercase
    // var infoLang = info.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
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