export const checkMustHaveInfos = (item, propName) => {
  var isHaving = false
  item.infos.forEach(info => {
    if (info["name"] == propName) {
      isHaving = true
    }
  })
  return isHaving
}
export const convertToJSON = (csv, originItemList) => {
  const lines = csv.split('\n')
  var resultsInJSON = {}
  var itemObjs = []

  const type = lines[0].split(",")[0]
  const category = lines[0].split(",")[1]
  const typeValue = lines[1].split(",")[0]
  const categoryValue = lines[1].split(",")[1]
  const labels = lines[2].split(",")

  for (var i = 3; i < lines.length - 1; i++) {
    const line = lines[i].split(",")
    var itemObj = {}
    var infos = []

    for (var j = 0; j < line.length; j++) {
      var infoObj = {}
      if (line[j] !== "") {
        infoObj["name"] = labels[j]
        infoObj["value"] = line[j]
        infos.push(infoObj)
      }

    }
    itemObj["infos"] = infos
    itemObj["metadata"] = {
      type: typeValue,
      category: categoryValue
    }
    resultsInJSON[i - 1] = itemObj
    // results.push(obj)

  }
  itemObjs = Object.values(resultsInJSON)

  // check must have props


  if (itemObjs.length !== 0) {
    itemObjs = itemObjs.filter(item => {
      var itemThatHasPrice = checkMustHaveInfos(item, "Tham dinh gia")
      var itemThatHasName = checkMustHaveInfos(item, "Loai")
      if (itemThatHasPrice && itemThatHasName) {
        return item
      }
    })

    // create pagination
    originItemList.forEach(obj1 => {
      itemObjs.forEach(obj2 => {
        if (JSON.stringify(obj2.infos) === JSON.stringify(obj1.infos)) {
          var index = itemObjs.indexOf(obj2)
          itemObjs.splice(index, 1)
        }
      })
    })
    originItemList = originItemList.concat(itemObjs)

    console.log('itemArray after removing duplicated item: ', originItemList)
    // createPagination(originItemList)
    return originItemList

  }


}