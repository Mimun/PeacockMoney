export const makeRequest = (type, url, contentType, data, callback)=>{
  $.ajax({
    type,
    url,
    headers: {
      "x-access-token": 'Bearer '+ window.localStorage.getItem('accessToken')
    },
    contentType,
    data,
    success: result=>{
      console.log('result: ', result)
      callback(result)
    }

  })
}