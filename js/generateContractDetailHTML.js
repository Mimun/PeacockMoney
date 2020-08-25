export const generateContractDetailHTML = (itemObj, template, elementName) => {
  const clone = template.content.cloneNode(true)

  const infoTemplate = document.querySelector('#info-template')

  const contractDetail = itemObj;

  // contract image
  const image = findNestedObj(contractDetail, 'name', 'image')
  clone.querySelector('#contract-image').setAttribute('src', image.value)

  // a side info
  var aSideInfo = findNestedObj(contractDetail, 'name', 'nguoi lap')
  const cloneASide = infoTemplate.content.cloneNode(true)
  cloneASide.querySelector('label').innerHTML = aSideInfo.name.charAt(0).toUpperCase() + aSideInfo.name.slice(1)
  cloneASide.querySelector('input').value = aSideInfo.value
  clone.querySelector('.a-side-info-container').querySelector('div[class="section"]').appendChild(cloneASide)

  // b side info
  var bSideInfo = findNestedObj(contractDetail, 'name', 'nguoi lap')
  const cloneBSide = infoTemplate.content.cloneNode(true)
  cloneBSide.querySelector('label').innerHTML = bSideInfo.name.charAt(0).toUpperCase() + bSideInfo.name.slice(1)
  cloneBSide.querySelector('input').value = bSideInfo.value
  clone.querySelector('.b-side-info-container').querySelector('div[class="section"]').appendChild(cloneBSide)

  // contract infos
  // metadata
  for (const property in contractDetail.metadata) {
    const name = contractDetail.metadata[property].name
    const value = contractDetail.metadata[property].value
    if (name.toLowerCase() !== "template name" && name.toLowerCase() !== "image") {
      const infoTemplatelone = infoTemplate.content.cloneNode(true)
      infoTemplatelone.querySelector('label').innerHTML = name.charAt(0).toUpperCase() + name.slice(1)
      infoTemplatelone.querySelector('input').value = value
      clone.querySelector('.contract-info-container').querySelector('div[class="section"]').appendChild(infoTemplatelone)

    }

  }
  // info
  contractDetail.items.forEach(item => {
    const itemDiv = clone.querySelector('.item-info-container').querySelector('.section').cloneNode(true)

    item.infos.forEach(info => {
      const infoTemplatelone = infoTemplate.content.cloneNode(true)
      infoTemplatelone.querySelector('.form-group').className = "form-group"
      infoTemplatelone.querySelector('label').innerHTML = info.name.charAt(0).toUpperCase() + info.name.slice(1)
      infoTemplatelone.querySelector('input').value = info.value

      itemDiv.querySelector('.item-info').appendChild(infoTemplatelone)
      // clone.querySelector('.contract-info-container').querySelector('div[class="section"]').appendChild(infoTemplatelone)
    })

    item.status.forEach(status => {
      status.infos.forEach(info => {
        const infoTemplatelone = infoTemplate.content.cloneNode(true)
        infoTemplatelone.querySelector('.form-group').className = "form-group"

        infoTemplatelone.querySelector('label').innerHTML = info.name.toLowerCase() === "loai" ? "Tinh trang" : info.name.charAt(0).toUpperCase() + info.name.slice(1)
        infoTemplatelone.querySelector('input').value = info.value

        itemDiv.querySelector('.item-status').appendChild(infoTemplatelone)

      })
    })

    clone.querySelector('.item-info-container').appendChild(itemDiv)


  })

  // handle event click to pdf button
  clone.querySelector('.get-pdf').addEventListener('click', (event) => {
    event.preventDefault()
    PDF1()
  })


  document.body.querySelector('#' + elementName + '').appendChild(clone)

  const PDF1 = () => {
    html2canvas(document.querySelector('.contract-detail-container'), {
      scrollX: 0,
      scrollY: 0
    }).then(function (canvas) {
      var doc = new jsPDF('p', 'mm', 'a4')
      var image = canvas.toDataURL("image/jpeg")
      doc.addImage(image, 'JPEG', 40, 20, 120, 270)
      doc.save('contract.pdf')
    })

  }
}



function findNestedObj(entireObj, keyToFind, valToFind) {
  let foundObj;
  JSON.stringify(entireObj, (_, nestedValue) => {
    if (nestedValue && nestedValue[keyToFind] === valToFind) {
      foundObj = nestedValue;
    }
    return nestedValue;
  });
  return foundObj;
};