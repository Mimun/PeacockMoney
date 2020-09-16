import { ObjectId } from './createMongooseID.js'
import { findNestedObj } from './findNestedObj.js'
export const convertToJSON = (csv) => {
  const lines = csv.split('\n')
  var itemObjs = []
  const labels = lines[0].split(",")

  for (var i = 1; i < lines.length - 1; i++) {
    const line = lines[i].split(",")
    var itemObj = {
      metadata: [],
      infos: [],
    }
    // metadata
    for (var j = 0; j <= 3; j++) {
      var dataVie, dataKor, cType = 'text'
      switch (j) {
        case 0:
          dataVie = 'loaiTaiSan'
          dataKor = 'koreanString'
          break
        case 1:
          dataVie = 'phanLoaiTaiSan'
          dataKor = 'koreanString'
          break

        case 2:
          dataVie = 'thamDinhGia'
          dataKor = 'koreanString'
          cType = 'number'
          break

        case 3:
          dataVie = 'loai'
          dataKor = 'koreanString'
          break
        default:
          dataVie = 'none'
      }
      itemObj.metadata.push({
        name: labels[j],
        value: line[j],
        cType: cType,
        dataVie,
        dataKor
      })
    }
    // infos
    for (var j = 4; j < line.length; j++) {
      if (line[j] !== "") {
        itemObj.infos.push({
          name: labels[j],
          value: line[j]
        })
      }

    }

    if (itemObj._id === null || itemObj._id === undefined) {
      itemObj._id = ObjectId()
    }
    if (findNestedObj(itemObj, 'name', 'itemType') && findNestedObj(itemObj, 'name', 'itemCategory')
      && findNestedObj(itemObj, 'name', 'evaluatingPrice') && findNestedObj(itemObj, 'name', 'type')) {
      itemObjs.push(itemObj)

    }
  }
  return itemObjs

}