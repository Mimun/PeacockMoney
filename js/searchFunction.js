import {generateHTML} from "./generateHTML.js"
export const searchFunction = (originItemArray, searchItemArray, template, elementName)=>{
  if(searchItemArray.length !==0){
    document.querySelector('#'+ elementName +'').innerHTML = ''
    generateHTML(searchItemArray, template, elementName)

  } else {
    document.querySelector('#'+ elementName +'').innerHTML = ''
    generateHTML(originItemArray, template, elementName)
  }
 
}         