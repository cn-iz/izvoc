// 云函数入口文件
const cloud = require('wx-server-sdk')
var http = require('http');
var qs = require('querystring'); 

cloud.init()

function get_jinshan(w){
  var options = {
    hostname: 'http://www.iciba.com/index.php',
    port: 443,
    path: '?a=getWordMean&c=search&list=1%2C2%2C3%2C4%2C5%2C8%2C9%2C10%2C12%2C13%2C14%2C18%2C21%2C22%2C3003%2C3005&word=' + w,
    method: 'GET'
  };

  var req = http.request(options, function (res) {
    return res;
  });

  req.on('error', function (e) {
    console.log('problem with request: ' + e.message);
  });

  req.end();
}
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  return get_jinshan('hello')
}