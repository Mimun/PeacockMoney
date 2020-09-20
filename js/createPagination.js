import { generateListHTML } from './generateListHTML.js'
import { makeRequest } from './makeRequest.js'
export const createPagination = (itemObjs, totalItems, template, elementName) => {
  // pagination


  const pageNavigation = document.createElement('nav')
  pageNavigation.setAttribute('aria-label', 'page navigation')
  pageNavigation.id = 'page-navigation'
  pageNavigation.style.margin = 'auto'
  pageNavigation.innerHTML = `
      <ul class="pagination pg-blue" style="margin: auto;">
        <li class="page-item ">
          <button class="page-link" tabindex="-1" id="prev" disabled='false'>Previous</button>
        </li>
        <li class="page-item ">
          <button class="page-link" tabindex="-1" id="first" >First</button>
        </li>
        <div class="li-list" style="display: flex;"></div>
        <li class="page-item ">
          <button class="page-link" tabindex="-1" id="last" >Last</button>
        </li>
        <li class="page-item ">
          <button class="page-link" id="next" disabled='false'>Next</button>
        </li>
      </ul>`
  // append clone table to table container
  document.body.querySelector('#' + elementName + '').appendChild(pageNavigation)
  // duplicate object remove

  var list = itemObjs
  var currentPage = 1
  var numberPerPage = 5
  var numberOfPages = Math.ceil(totalItems / numberPerPage)

  // create pagination item
  const generateList = (currentPage) => {
    if (document.querySelector('.li-list').firstChild) {
      document.querySelector('.li-list').innerHTML = ''
    }
    var begin = null
    var end = null
    if (currentPage === 1) {
      begin = currentPage
      end = currentPage + 2 <= numberOfPages ? currentPage + 2 : numberOfPages

    } else if (currentPage === numberOfPages) {
      begin = numberOfPages - 2 >= 1 ? numberOfPages - 2 : 1
      end = numberOfPages
    } else {
      begin = currentPage - 1 > 0 ? currentPage - 1 : 1

      end = currentPage + 1
    }
    for (var i = begin; i <= end; i++) {

      const li = document.createElement('li')
      li.className = i === currentPage ? 'page-item active' : 'page-item'

      const button = document.createElement('button')
      button.className = 'page-link'
      button.innerHTML = i
      button.id = i
      button.addEventListener('click', (evt) => {
        // randomPage(i)
        randomPage(parseInt(evt.target.innerHTML))

      })
      li.appendChild(button)

      document.querySelector('.li-list').appendChild(li)

      if (i == end && i < numberOfPages - 1) {
        const ellipsisDiv = document.createElement('div')
        ellipsisDiv.innerHTML = '...'
        document.querySelector('.li-list').appendChild(ellipsisDiv)

        const li = document.createElement('li')
        li.className = i === currentPage ? 'page-item active' : 'page-item'
        const button = document.createElement('button')
        button.className = 'page-link'
        button.innerHTML = numberOfPages
        button.id = numberOfPages
        button.addEventListener('click', (evt) => {
          // randomPage(i)

          button.className = 'page-link active'
          randomPage(parseInt(evt.target.innerHTML))

        })
        li.appendChild(button)

        document.querySelector('.li-list').appendChild(li)

      } else if (i == end && i < numberOfPages) {
        const li = document.createElement('li')
        li.className = i === currentPage ? 'page-item active' : 'page-item'
        const button = document.createElement('button')
        button.className = 'page-link'
        button.innerHTML = numberOfPages
        button.id = numberOfPages
        button.addEventListener('click', (evt) => {
          // randomPage(i)

          button.className = 'page-link active'
          randomPage(parseInt(evt.target.innerHTML))

        })
        li.appendChild(button)

        document.querySelector('.li-list').appendChild(li)
      }

    }

  }
  generateList(currentPage)

  const nextPage = () => {
    randomPage(currentPage + 1)
  }

  const prevPage = () => {
    randomPage(currentPage - 1)
  }

  const randomPage = (page) => {
    var obj = makeRequestObj(currentPage, page, 5, list[0]._id, list[list.length - 1]._id)
    console.log('obj: ', obj)
    makeRequest('POST', `items/page`, 'application/json', JSON.stringify(obj), (result) => {
      currentPage = page
      loadList(result.items)
      generateList(currentPage)
      list = result.items
    })

  }

  const firstPage = () => {
    randomPage(1)
  }

  const lastPage = () => {
    randomPage(numberOfPages)
  }

  const check = () => {
    document.querySelector('#prev').disabled = currentPage == 1 ? true : false
    document.querySelector('#next').disabled = currentPage == numberOfPages ? true : false
  }

  const loadList = (items) => {
    if (document.querySelector('#table-container').firstChild) {
      document.querySelector('#table-container').innerHTML = ''
    }
    items.forEach(page => {
      generateListHTML(page, template, 'table-container')

    })
    check()
  }

  loadList(list)

  document.querySelector('#prev').addEventListener('click', () => {
    prevPage()
  })
  document.querySelector('#next').addEventListener('click', () => {
    nextPage()
  })
  document.querySelector('#first').addEventListener('click', () => {
    firstPage()
  })
  document.querySelector('#last').addEventListener('click', () => {
    lastPage()
  })

  function makeRequestObj() {
    return {
      currentPage: arguments[0],
      nextPage: arguments[1],
      pageSize: arguments[2],
      firstId: arguments[3],
      lastId: arguments[4]
    }
  }
}