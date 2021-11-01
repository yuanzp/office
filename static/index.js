(function () {
    var padDate = function (value) {
        return value < 10 ? '0' + value : value;
    }



    var app = new Vue({
        el: '#app',
        data: {
            cDate: new Date(),
            files: []
        },
        created: function () {
            this.updateView();
        },
        filters: {
            formatDate: function (value) {
                var date = new Date(value);
                var year = date.getFullYear();
                var month = padDate(date.getMonth() + 1);
                var day = padDate(date.getDate());
                var hours = padDate(date.getHours());
                var minutes = padDate(date.getMinutes());
                var seconds = padDate(date.getSeconds());
                //返回数据
                return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
            },
            conver: function (limit) {
                var size = "";
                if (limit < 1024) {
                    //如果小于0.1KB转化成B
                    size = limit.toFixed(2) + "B";
                } else if (limit < 1024 * 1024) {
                    //如果小于0.1MB转化成KB
                    size = (limit / 1024).toFixed(2) + "KB";
                } else if (limit < 1024 * 1024 * 1024) {
                    //如果小于0.1GB转化成MB
                    size = (limit / (1024 * 1024)).toFixed(2) + "MB";
                } else {
                    //其他转化成GB
                    size = (limit / (1024 * 1024 * 1024)).toFixed(2) + "GB";
                }
                var sizestr = size + "";
                var len = sizestr.indexOf("\.");
                var dec = sizestr.substr(len + 1, 2);
                if (dec == "00") {
                    //当小数点后为00时 去掉小数部分
                    return sizestr.substring(0, len) + sizestr.substr(len + 3, 2);
                }
                return sizestr;
            }
        },
        methods: {
            updateView: function () {
                var target = this;
                axios({
                    'url': location.pathname + "files",
                    "method": 'get',
                    params: {
                        "year": this.cDate.getFullYear(),
                        "month": this.cDate.getMonth(),
                        "day": this.cDate.getDate()
                    }
                }).then((res) => {
                    target.files = res.data.reverse()
                })
            },
            toPreDate: function () {
                this.cDate = new Date(this.cDate.getTime() - 24 * 60 * 60 * 1000);
                this.updateView()
            },
            toCurDate: function () {
                this.cDate = new Date()
                this.updateView()
            },
            toNextDate: function () {
                this.cDate = new Date(this.cDate.getTime() + 24 * 60 * 60 * 1000);
                this.updateView()
            }
        }
    })

})();