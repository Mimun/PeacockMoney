// export var exportHTMLTableToExcel = (function () {
//   var uri = 'data:application/vnd.ms-excel;base64,'
//     , template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><meta http-equiv="content-type" content="text/plain; charset=UTF-8"/></head><body><table>{table}</table></body></html>'
//     , base64 = function (s) { return window.btoa(unescape(encodeURIComponent(s))) }
//     , format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }) }
//   return function (table, name) {
//     console.log(`table: ${table}, name: ${name}`)
//     // if (!table.nodeType) table = document.getElementById(table)
//     var ctx = { worksheet: name || 'Worksheet', table: table.innerHTML }
//     var a = document.createElement('a');
//     a.href = uri + base64(format(template, ctx))
//     a.download = name + '.xls';
//     //triggering the function
//     a.click();
//   }
// })()

export var exportHTMLTableToExcel = (function () {
  var uri = 'data:application/vnd.ms-excel;base64,'
    , template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><meta http-equiv="content-type" content="text/plain; charset=UTF-8"/><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets>'
    , templateend = '</x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>'
    , body = '<body>'
    , tablevar = '<table>{table'
    , tablevarend = '}</table>'
    , bodyend = '</body></html>'
    , worksheet = '<x:ExcelWorksheet><x:Name>'
    , worksheetend = '</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet>'
    , worksheetvar = '{worksheet'
    , worksheetvarend = '}'
    , base64 = function (s) { return window.btoa(unescape(encodeURIComponent(s))) }
    , format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }) }
    , wstemplate = ''
    , tabletemplate = '';

  return function (table, name, filename) {
    var tables = table;

    for (var i = 0; i < tables.length; ++i) {
      wstemplate += worksheet + worksheetvar + i + worksheetvarend + worksheetend;
      tabletemplate += tablevar + i + tablevarend;
    }

    var allTemplate = template + wstemplate + templateend;
    var allWorksheet = body + tabletemplate + bodyend;
    var allOfIt = allTemplate + allWorksheet;

    var ctx = {};
    for (var j = 0; j < tables.length; ++j) {
      ctx['worksheet' + j] = name[j];
    }

    for (var k = 0; k < tables.length; ++k) {
      var exceltable;
      if (!tables[k].nodeType) exceltable = document.querySelector(`table.${tables[k]}`);
      ctx['table' + k] = exceltable.innerHTML;
    }

    //document.getElementById("dlink").href = uri + base64(format(template, ctx));
    //document.getElementById("dlink").download = filename;
    //document.getElementById("dlink").click();

    // window.location.href = uri + base64(format(allOfIt, ctx));
    var a = document.createElement('a');
    a.href = uri + base64(format(allOfIt, ctx))
    a.download = name + '.xls';
    //triggering the function
    a.click();
  }
})();