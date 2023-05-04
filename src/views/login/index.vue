<template>
  <div class="login-container">
    <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" auto-complete="on"
             label-position="left">

      <div class="title-container">
        <h3 class="title" @click="toUserLogin">用户登录</h3>
        <h3 class="title" @click="toPhoneLogin">手机号登录</h3>
      </div>

      <!--   显示用户名登录   -->
      <div v-if="showUserLogin">
        <el-form-item prop="username">
        <span class="svg-container">
          <svg-icon icon-class="user"/>
        </span>
          <el-input
            ref="username"
            v-model="loginForm.username"
            placeholder="请输入用户名"
            name="username"
            type="text"
            tabindex="1"
            auto-complete="on"
            @blur="changeCaptcha"
          />
        </el-form-item>

        <el-form-item prop="password">
        <span class="svg-container">
          <svg-icon icon-class="password"/>
        </span>
          <el-input
            :key="passwordType"
            ref="password"
            v-model="loginForm.password"
            :type="passwordType"
            placeholder="请输入密码"
            name="password"
            tabindex="2"
            auto-complete="on"
            @keyup.enter.native="handleLogin"
          />
          <span class="show-pwd" @click="showPwd">
          <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'"/>
        </span>
        </el-form-item>

        <el-col :span="16">
          <el-form-item prop="code">
        <span class="svg-container">
          <svg-icon icon-class="user"/>
        </span>
            <el-input
              ref="username"
              v-model="loginForm.code"
              placeholder="请输入图形验证码"
              name="code"
              type="text"
              tabindex="1"
              auto-complete="on"
            />
          </el-form-item>
        </el-col>
        <el-col :span="4" class="captchaImg">
          <img :src="captchaUrl" alt="图形验证码" @click="changeCaptcha"/>
        </el-col>
      </div>

      <!--   手机号登录   -->
      <div v-if="!showUserLogin">
        <el-form-item prop="phone">
        <span class="svg-container">
          <svg-icon icon-class="user"/>
        </span>
          <el-input
            ref="phone"
            v-model="loginForm.phone"
            placeholder="请输入手机号"
            name="phone"
            type="text"
            tabindex="1"
            auto-complete="on"
          />
        </el-form-item>

        <el-col :span="18">
          <el-form-item prop="code">
        <span class="svg-container">
          <svg-icon icon-class="password"/>
        </span>
            <el-input
              ref="code"
              v-model="loginForm.code"
              placeholder="请输入短信验证码"
              name="code"
              tabindex="2"
              auto-complete="on"
            />
          </el-form-item>
        </el-col>
        <el-button type="success" :disabled="smsBtn" @click="sendSms">{{ smsBtnValue }}</el-button>
      </div>

      <el-button :loading="loading" type="primary" style="width:100%;margin-bottom:30px;"
                 @click.native.prevent="handleLogin">登录
      </el-button>

      <div class="tips">
        <span style="margin-right:20px;">也可以使用第三方登录</span>
      </div>

    </el-form>
  </div>
</template>

<script>
import {validUsername} from '@/utils/validate'

export default {
  name: 'Login',
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!validUsername(value)) {
        callback(new Error('请输入正确的用户名'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value.length < 4) {
        callback(new Error('密码长度不能小于4位'))
      } else {
        callback()
      }
    }
    return {
      smsBtn: false,
      captchaUrl: '',
      showUserLogin: true,
      smsBtnValue: '发送验证码',
      loginForm: {
        username: '',
        password: '',
        code: '',
        phone: ''
      },
      loginRules: {
        username: [{required: true, trigger: 'blur', validator: validateUsername}],
        password: [{required: true, trigger: 'blur', validator: validatePassword}]
      },
      loading: false,
      passwordType: 'password',
      redirect: undefined
    }
  },
  watch: {
    $route: {
      handler: function (route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }
  },
  mounted() {
    console.log("mounted")
    this.captchaUrl = `http://localhost:8080/user/captcha?username=${this.loginForm.username}`
  },
  methods: {
    sendSms() {
      let phone = this.loginForm.phone;
      if (phone == '') {
        this.$message.error('手机号不能为空');
      } else {
        //定义正则表达式
        let reg = '^((13[0-9])|(14[5,7])|(15[0-3,5-9])|(17[0,3,5-9])|(18[0-9])|166|198|199|191|(147))\\d{8}$';
        //创建正则表达式对象
        let regExp = new RegExp(reg);
        //使用test()函数验证数据是否匹配正则表达式，匹配返回true,否则返回false
        if (regExp.test(phone)) {
          // 准备发送验证码时把按钮置为不可用
          this.smsBtn = true;
          let count = 60;
          let timer = setInterval(() => {
            this.smsBtnValue = (--count) + 'S后重试'
            if (count <= 0) {
              // 倒计时结束后 按钮恢复可用
              this.smsBtn = false;
              clearInterval(timer);
              this.smsBtnValue = '发送验证码'
            }
          }, 1000);
          // 手机号格式正确,请求后端发送验证码
          /*let vm = this;
          vm.axios({
            url: `http://localhost:8080/user/sms?phone=${phone}`,
            method: 'get'
          }).then(function (res) {
            if (res.data.code == 200) {
              vm.$message.success('验证码发送成功');
            }
          })*/
        } else {
          this.$message.error('手机号格式不正确');
        }
      }
    },
    toUserLogin() {
      this.showUserLogin = true;
    },
    toPhoneLogin() {
      this.showUserLogin = false;
    },
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    handleLogin(event) {
      event.preventDefault()
      let vm = this
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          console.log(vm.loginForm)
          // 到后端发送登录请求
          vm.axios({
            url: 'http://localhost:8080/user/login',
            method: 'POST',
            data: vm.loginForm
          }).then(function (res) {
            // 如果登录成功，跳转到主页
            console.log('登录成功')
            console.log(res.data)
            if (res.data.code == 200) {
              vm.loginForm = res.data.data;
              vm.loading = true
              vm.$store.dispatch('user/login', vm.loginForm).then(() => {
                vm.$router.push({path: vm.redirect || '/'})
                vm.loading = false
              }).catch(() => {
                vm.loading = false
              })
            }
          })
        } else {
          console.log('表单校验失败')
          return false
        }
      })
    },
    changeCaptcha() {
      console.log('切换图形验证码')
      this.captchaUrl = `http://localhost:8080/user/captcha?username=${this.loginForm.username}&v=${Date.now()}`
    }
  }
}
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg: #283443;
$light_gray: #fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}
</style>

<style lang="scss" scoped>
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;

.captchaImg {
  margin-left: 8px;
}

.login-container {
  min-height: 100%;
  width: 100%;
  background-color: $bg;
  overflow: hidden;

  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px 40px 40px auto;
      text-align: center;
      font-weight: bold;
      display: inline-block;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }
}
</style>
