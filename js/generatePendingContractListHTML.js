import { findNestedObj } from './findNestedObj.js'
import { makeRequest } from './makeRequest.js'

function checkObjInArray(obj, list) {
  var i;
  for (i = 0; i < list.length; i++) {
    if (JSON.stringify(list[i]) === JSON.stringify(obj)) {
      return true;
    }
  }

  return false;
}

function containsObject(obj, list) {

  return list.some(elem => JSON.stringify(elem) === JSON.stringify)
}

export const generatePendingContractListHTML = (itemObj, template, elementName, payload, roleAbility, isCheckMember, isApproveMember) => {
  console.log('item obj from contract list: ', itemObj)
  const clone = template.content.cloneNode(true)
  clone.querySelector('.object-div').C_DATA = itemObj
  // contract status
  var contractStatus = itemObj["contractStatus"]
  clone.querySelector('.object-div').setAttribute('data-status', contractStatus)

  // contract image
  var contractImage = findNestedObj(itemObj, 'name', 'image')
  clone.querySelector('img').setAttribute('src', contractImage.value)

  // contract name
  var contractName = findNestedObj(itemObj, 'name', 'templateName')
  clone.querySelector('.contract-title').innerHTML = contractName ? contractName.value : "Contract name"

  // contract id
  var contractId = itemObj.id
  clone.querySelector('.contract-id').innerHTML = `Mã hợp đồng: ${contractId}`

  // contract like
  var contractLikes = itemObj.likes
  var a = document.createElement('a')
  a.style.color = 'grey'
  a.innerHTML = `${contractLikes.length} người đồng ý với hợp đồng này.`
  clone.querySelector('.contract-likes').appendChild(a)


  // contract info
  itemObj.contractMetadata.forEach(item => {
    if (item.name === "creator" || item.name === "customer" || item.name === "createdDate") {
      const infoDiv = document.createElement('div')
      infoDiv.innerHTML = item.name.charAt(0).toUpperCase() + item.name.slice(1) + ': ' + item.value
      clone.querySelector('.contract-info').appendChild(infoDiv)
    }
  })

  const button = clone.querySelector('.object-div').querySelector('button')
  isApproveMember ? button.style.visibility = 'box' : button.style.visibility = 'hidden'
  // const completeBtn = clone.querySelector('.object-div').querySelector('button[id="btn-complete]')

  if (button) {
    switch (contractStatus) {
      case ("pending"):
      case ("waiting"):
        button.id = 'btn-approve'
        button.innerHTML = 'approve'
        break
      case ("approved"):
        button.id = 'btn-complete'
        button.className = 'btn btn-raised btn-primary btn-sm'
        button.innerHTML = 'complete'
        break
      case ("completed"):
        clone.querySelector('.object-div').querySelector('.btn-options').removeChild(clone.querySelector('.object-div').querySelector('button'))

        break
      default:
        button.id = 'btn-waiting'
        button.innerHTML = 'waiting'
    }
    button.addEventListener('click', (event) => {
      let textContent = event.target.textContent
      if (textContent === "waiting") {
        makeRequest('PUT', 'contracts/' + itemObj._id, 'application/json', JSON.stringify({ contractStatus: 'waiting', contract: itemObj }), (result) => {
          console.log('waiting: ', window.location)

          window.location.reload()
          // event.target.closest('.object-div').C_DATA = result.result
          // console.log('event: ', event.target.closest('.object-div').C_DATA)
          // event.target.closest('.object-div').setAttribute('data-status', 'waiting')
          // event.target.innerHTML = 'approve'
          // event.target.className = 'btn btn-raised btn-primary btn-sm'
        })
      } else if (textContent === "approve") {
        makeRequest('PUT', 'contracts/' + itemObj._id, 'application/json', JSON.stringify({ contractStatus: 'approved', contract: itemObj }), (result) => {
          event.target.closest('.object-div').C_DATA = result.result
          console.log('ABC: ', event.target.closest('.object-div').C_DATA)
          event.target.closest('.object-div').setAttribute('data-status', 'approved')
          // event.target.innerHTML = 'complete'
          // event.target.className = 'btn btn-raised btn-primary btn-sm'
          event.target.closest('.object-div').querySelector('.btn-options').removeChild(event.target)

        })

      } else if (textContent === "complete") {
        makeRequest('PUT', 'contracts/' + itemObj._id, 'application/json', JSON.stringify({ contractStatus: 'completed', contract: itemObj }), async (result) => {
          event.target.closest('.object-div').C_DATA = result.result
          console.log('event: ', event.target.closest('.object-div').C_DATA)
          event.target.closest('.object-div').setAttribute('data-status', 'completed')
          // event.target.style.display = 'none'
          event.target.closest('.object-div').querySelector('.btn-options').removeChild(event.target)
        })

      }
      event.stopPropagation()
    })
  }

  // add delete contract buutton
  var delBtn = document.createElement('button')
  delBtn.className = 'btn btn-danger btn-raised btn-sm'
  delBtn.innerHTML = "delete contract"
  delBtn.addEventListener('click', (event) => {
    console.log('event: ', event.target.closest('.object-div').C_DATA._id)
    event.stopPropagation()
    makeRequest('DELETE', `contracts/${event.target.closest('.object-div').C_DATA._id}`, 'application/json', {}, () => {
      window.location.reload()
    })

  })
  clone.querySelector('.btn-options').appendChild(delBtn)
  var user = JSON.parse(window.localStorage.getItem('user'))
  var obj = clone.querySelector('.object-div').C_DATA
  // like contract button
  var likeBtn = document.createElement('button')
  likeBtn.className = 'btn btn-info btn-raised btn-sm'
  likeBtn.innerHTML = checkObjInArray(user, obj.likes) ? 'dislike' : 'like'
  isCheckMember ? likeBtn.style.visibility = 'box' : likeBtn.style.visibility = 'hidden'
  likeBtn.addEventListener('click', (event) => {
    // console.log('event: ', event.target.closest('.object-div').C_DATA._id)
    event.stopPropagation()

    var index = obj.likes.indexOf(user)
    console.log('index: ', index)
    switch (event.target.textContent) {
      case 'like':
        if (!checkObjInArray(user, obj.likes)) {
          obj.likes.push(user)
        }
        break;
      case 'dislike':
        obj.likes = obj.likes.filter(like => {
          return like._id !== user._id
        });
        break;

      default:
        break;
    }
    console.log('array: ', obj)
    likeBtn.innerHTML = event.target.textContent === 'like' ? 'dislike' : 'like'

    makeRequest('PUT', 'contracts/' + itemObj._id, 'application/json', JSON.stringify({ contractStatus: itemObj.contractStatus, likes: obj.likes, contract: itemObj }), (result) => {
      window.location.reload()
    })
    // makeRequest('DELETE', `contracts/${event.target.closest('.object-div').C_DATA._id}`, 'application/json', {}, () => {
    //   window.location.reload()
    // })

  })
  clone.querySelector('.btn-options').appendChild(likeBtn)

  document.body.querySelector('#' + elementName + '').appendChild(clone)
}
