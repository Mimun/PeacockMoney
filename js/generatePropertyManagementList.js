import {findNestedObj} from './findNestedObj.js'
export const generatePropertyManagementList = async (itemObj, template, elementName)=>{
  var clone = template.content.cloneNode(true)
  console.log('clone: ', clone)
  var itemName = []
  await itemObj.evaluationItem.infos.forEach(info=>{
    itemName.push(info.value)
  })
  itemName.join(", ")
  // var itemName = findNestedObj(itemObj.evaluationItem.metadata, 'name', 'type')
  var itemType = findNestedObj(itemObj.evaluationItem.metadata, 'name', 'itemType')
  var itemStatus = []
  if(itemObj.status.length !==0){
    await itemObj.status.forEach(status=>{
      itemStatus.push(findNestedObj(status, 'name', 'type').value)
    })
    itemStatus = itemStatus.join(', ')
  
  } else {
    itemStatus = "No status"
  }
 
  clone.querySelector('.info-container').querySelector('.name').innerHTML = itemName
  clone.querySelector('.info-container').querySelector('.itemType').innerHTML = itemType.value
  clone.querySelector('.info-container').querySelector('.status').innerHTML = itemStatus
  document.querySelector('#' + elementName + '').appendChild(clone)

}