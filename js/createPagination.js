import {generateHTML} 
export const createPagination = itemObjs => {
  // pagination

  const pageNavigationContainer = document.querySelector('#page-navigation-container')
  if (pageNavigationContainer.firstChild) {
    pageNavigationContainer.innerHTML = ''
  }
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
  pageNavigationContainer.appendChild(pageNavigation)

  // duplicate object remove

  var list = itemObjs
  var pageList = []
  var currentPage = 1
  var numberPerPage = 5
  var numberOfPages = Math.ceil(list.length / numberPerPage)

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
    currentPage += 1
    loadList()
    generateList(currentPage)
  }

  const prevPage = () => {
    currentPage -= 1
    loadList()
    generateList(currentPage)
  }

  const randomPage = (page) => {
    currentPage = page
    loadList()
    generateList(currentPage)
  }

  const firstPage = () => {
    currentPage = 1
    loadList()
    generateList(currentPage)
  }

  const lastPage = () => {
    currentPage = numberOfPages
    loadList()
    generateList(currentPage)
  }

  const check = () => {
    document.querySelector('#prev').disabled = currentPage == 1 ? true : false
    document.querySelector('#next').disabled = currentPage == numberOfPages ? true : false
  }

  const loadList = () => {
    var begin = ((currentPage - 1) * numberPerPage)
    var end = begin + numberPerPage

    pageList = list.slice(begin, end)
    generateHTML(pageList)
    check()

  }

  loadList()

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



  // add item button on the home screen of tham dinh gia
  const addItemButtonContainer = document.querySelector('#add-item-button-container')
  if (addItemButtonContainer.firstChild) {
    addItemButtonContainer.innerHTML = ''
  }
  const addItemButton = document.createElement('button')
  addItemButton.className = 'btn btn-primary px-3 '
  addItemButton.setAttribute('data-toggle', 'modal')
  addItemButton.setAttribute('data-target', '#addItemModal')
  addItemButton.innerHTML = `<i class="fa fa-plus" aria-hidden="true"></i>`
  addItemButton.style.margin = 'auto'
  addItemButtonContainer.appendChild(addItemButton)
  addItemButton.addEventListener('click', () => {
    document.querySelector('#cell-divs-container').innerHTML = ''
  })
}