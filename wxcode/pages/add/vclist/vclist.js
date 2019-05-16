// pages/add/vclist/vclist.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bkid: null,
    bkInfo:null,
    allvcs: [],
    idxstart:0,
    idxend:0,
    isloding:false,
    forarr:[],
    vcs: null
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    wx.showLoading({
      title: '加载中',
    })
    this.setData({ bkid: options.bkid})
    wx.request({
      url: getApp().globalData.domainName + '/index/sql/quary',
      data: {
        sql: "SELECT * from bk_tb WHERE bk_id='" + options.bkid + "'"
      },
      header: {
        'content-type': 'application/json', // 默认值
        'cookie': getApp().globalData.sessionInfo
      },
      success: function (res) {
        wx.setNavigationBarTitle({
          title: res.data[0].bk_name
        })
        that.setData({bkInfo:res.data[0]})
      },
      fail: getApp().globalData.netFail
    })
    this.getWords()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  bindscrolltolower: function () {
    if (this.data.allvcs.length> this.data.idxend){
      this.setData({idxstart : this.data.idxend})
      var arr=[]
      var a = this.data.idxend + 50 < this.data.allvcs.length ? this.data.idxend + 50:this.data.allvcs.length
      var tag = this.data.allvcs[this.data.idxstart].bv_tag
      for (var i = this.data.idxend; i <a;i++){
        if (this.data.allvcs[i].bv_tag!=tag){
          this.setData({ idxend:i ,forarr:arr})
          return
        }else{
          arr.push(i)
        }
      }
      this.setData({ idxend: a, forarr: arr})
    }else{
      console.log(this.data.allvcs.length,this.data.bkInfo.bk_direct_item_num)
      if (this.data.allvcs.length < this.data.bkInfo.bk_direct_item_num){
        wx.showLoading({
          title: '加载中',
        })
        this.getWords()
        return
      }
      wx.showToast({
        title: '最后一章了',
        icon: 'none',
        duration: 2000
      })
    }
  },
  bindscrolltoupper: function () {
    var start = this.data.idxstart
    if (start>0) {
      var arr=[]
      var tag = this.data.allvcs[start-1].bv_tag
      var a = start - 51 > 0 ? start - 51:0
      if(a==0){
        this.setData({ idxstart: 0, idxend: 0 })
        this.bindscrolltolower()
        return
      }
      for (var i = start-1 ; i > a-1 ; i--) {
        if (this.data.allvcs[i].bv_tag != tag) {
          this.setData({ idxstart: i+1, forarr: arr, idxend: start })
          return
        }else{
          arr.push(i)
        }
      }
      this.setData({ idxstart: a, forarr: arr, idxend: start })
    } else {
      wx.showToast({
        title: '这是第一章',
        icon: 'none',
        duration: 2000
      })
    }
  },
  addbook:function(){
    var bookInfo = wx.getStorageSync('booksInfo')
    if(!bookInfo){
      bookInfo={}
    }
    if (bookInfo[this.data.bkid]){
      wx.showModal({
        title: '提示',
        content: '该书已在列表！',
        cancelText: '继续查看',
        confirmText: '去背单词',
        success: function (res) {
          if (res.confirm) {
            wx.switchTab({
              url: '/pages/word/index/index'
            })
          }
        }
      })
      return
    }
    var myDate = new Date();
    bookInfo[this.data.bkid]={
      bk_id: this.data.bkid,
      bk_direct_item_num: this.data.bkInfo.bk_direct_item_num,
      bk_name: this.data.bkInfo.bk_name,
      looked:0,
      lastidx:0,
      date: myDate.toLocaleDateString()
    }
    wx.setStorage({
      key: 'booksInfo',
      data:bookInfo,
      success:function(){
        wx.showModal({
          title:'提示',
          content:'添加成功！',
          cancelText:'继续查看',
          confirmText:'去背单词',
          success:function(res){
            if (res.confirm){
              wx.switchTab({
                url: '/pages/word/index/index'
              })
            }
          }
        })
      }
    })
  },
  getWords:function(){
    if (this.data.isloding){
      return
    }
    this.setData({isloding:true})
    var that=this
    wx.request({
      url: getApp().globalData.domainName + '/index/sql/quary',
      data: {
        sql: "SELECT vc_id,vc_vocabulary,bv_tag,vc_explain_simple FROM bk_voc_tb b INNER  JOIN voc_tb v on b.bv_voc_id=v.vc_id where b.bv_book_id='" + this.data.bkid + "' ORDER BY bv_order limit " + this.data.allvcs.length + ",1000"
      },
      header: {
        'content-type': 'application/json',
        'cookie': getApp().globalData.sessionInfo
      },
      success: function (res) {
        that.setData({ allvcs: that.data.allvcs.concat(res.data)  })
        wx.hideLoading()
        that.bindscrolltolower()
        that.setData({ isloding:false })
      },
      fail: getApp().globalData.netFail
    })
  }
  
})