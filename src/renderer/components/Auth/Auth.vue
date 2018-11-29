<template>
  <div class="auth">
    <div class="auth-img-div" style="margin:0px auto; text-align:center;">
      <img src="../../assets/auth.png">
    </div>
    <el-form :model="form" size="medium">
      <el-form-item label="Path">
        <el-input v-model="form.path" autofocus></el-input>
      </el-form-item>
      <el-form-item label="Pre-shared Password">
        <el-input v-model="form.pass" @keyup.enter.native="submitForm()"></el-input>
      </el-form-item>
    </el-form>
    <div style="text-align:center">
      <el-button type="primary" @click="submitForm()">Submit</el-button>
    </div>
  </div>
</template>
    

<script>
const fs = require("fs");
var spawn = require("child_process").spawn;
export default {
  name: "Auth",
  props: ["auth"],
  data() {
    return {
      form: {
        path: "",
        pass: ""
      }
    };
  },
  methods: {
    submitForm() {
      if (this.form.path !== "" && this.form.pass !== "") {
        let dirPath = this.form.path;
        dirPath += dirPath.slice(-1) === "/" ? "" : "/";
        spawn("netlink-client", [this.form.path, this.form.pass]).on(
          "exit",
          e => {
            console.log(e);
            if (e === 0) {
              this.$emit("authSucceed", dirPath);
            }
          }
        );
      }
    }
  }
};
</script>

<style scoped>
.auth {
  padding: 2rem;
}
</style>

<style>
.auth .el-form-item__label {
  font-size: 1.2rem;
}
.auth .el-input__inner {
  font-size: 1.2rem;
}
</style>
