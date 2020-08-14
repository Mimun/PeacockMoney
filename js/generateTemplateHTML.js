export const generateTemplateHTML = (array, template, elementName) => {
  const infoContainer = document.createElement('div')
  infoContainer.className = array[0]

  const title = document.createElement('p')
  title.innerHTML = array[0]
  title.className = 'h4 mb-4'
  infoContainer.appendChild(title)


  console.log('array after split: ', array)
  // remove csv title
  array.shift(array[0])
  
  array.map(element => {
    const clone = document.importNode(template.content, true)

    var input = clone.querySelector('input')
    var label = clone.querySelector('label')
    label.innerHTML = element
    infoContainer.appendChild(clone)
  })
  document.body.querySelector('#' + elementName + '').appendChild(infoContainer)

}