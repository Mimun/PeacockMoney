export const generateContractDetailHTML = (itemObj, template, elementName) => {
  const clone = template.content.cloneNode(true)
  console.log('contract detail: ', clone)

  const infoTemplate = document.querySelector('#info-template')
  console.log('info template: ', infoTemplate)

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
    if (property.toLowerCase() !== "template name") {
      const infoTemplatelone = infoTemplate.content.cloneNode(true)
      infoTemplatelone.querySelector('label').innerHTML = property.charAt(0).toUpperCase() + property.slice(1)
      infoTemplatelone.querySelector('input').value = contractDetail.metadata[property]
      clone.querySelector('.contract-info-container').querySelector('div[class="section"]').appendChild(infoTemplatelone)

    }

  }
  // info
  contractDetail.infos.forEach(info => {
    if (info.name !== "image" && info.name !== "nguoi lap" && info.name !== "nguoi nhan") {
      const infoTemplatelone = infoTemplate.content.cloneNode(true)
      infoTemplatelone.querySelector('label').innerHTML = info.name.charAt(0).toUpperCase() + info.name.slice(1)
      infoTemplatelone.querySelector('input').value = info.value
      clone.querySelector('.contract-info-container').querySelector('div[class="section"]').appendChild(infoTemplatelone)
    }
  })

  // item
  contractDetail.item.infos.forEach(info => {
    const infoTemplatelone = infoTemplate.content.cloneNode(true)
    infoTemplatelone.querySelector('label').innerHTML = info.name.charAt(0).toUpperCase() + info.name.slice(1)
    infoTemplatelone.querySelector('input').value = info.value
    clone.querySelector('.item-info-container').querySelector('.item-info').appendChild(infoTemplatelone)
  })

  // item status
  contractDetail.itemStatus.forEach(status => {
    status.infos.forEach(info => {
      const infoTemplatelone = infoTemplate.content.cloneNode(true)
      infoTemplatelone.querySelector('label').innerHTML = info.name.toLowerCase() === "loai" ? "Tinh trang" : info.name.charAt(0).toUpperCase() + info.name.slice(1)
      infoTemplatelone.querySelector('input').value = info.value
      clone.querySelector('.item-info-container').querySelector('.item-status').appendChild(infoTemplatelone)
    })
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