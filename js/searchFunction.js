import {generateHTML} from "./generateHTML.js"
export const searchFunction = (itemValue, itemArray, template, elementName)=>{
  var foundItems = []
  itemArray.map(obj => {
    obj.infos.forEach(info => {
      if (JSON.stringify(info.value.toLowerCase()) === JSON.stringify(itemValue.toLowerCase())) {
        foundItems.push(obj)
      }
    })
  })

  if (foundItems.length > 0) {
    document.querySelector('#'+ elementName +'').innerHTML = ''
    generateHTML(foundItems, template, elementName)
  } else {
    document.querySelector('#'+ elementName +'').innerHTML = ''
    generateHTML(itemArray, template, elementName)

  }
 
}