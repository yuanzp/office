(function () {

    var app = new Vue({
        el: '#app',
        data: {
            username: "",
            password: "",
            tips:''
        },
        methods: {
            onLogin() {
                if(this.username=="" ||this.password==""){
                    this.tips="用户名及密码均不能为空";
                    return;
                }
                var target=this;
                axios.post("/login", {
                    username: this.username,
                    userpass: this.password
                }).then((res) => {
                    if (res.data.success) {
                        location.href = "/platform/"
                    } else {
                        target.tips=res.data.message;                        
                    }

                })
            }
        }
    });

})();
