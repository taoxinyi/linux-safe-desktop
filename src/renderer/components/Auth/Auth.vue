<template>
  <div class="auth">
    <el-form :model="form" size="medium">
      <el-form-item label="Path">
        <el-input v-model="form.path" autofocus></el-input>
      </el-form-item>
      <el-form-item label="Pre-shared Password">
        <el-input v-model="form.pass"></el-input>
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
    submitForm(){
        if (this.form.path!==""&&this.form.pass!==""){
            spawn("netlink-client", [this.form.path,this.form.pass]).on("exit", e => {
              if(e==0){
                this.$emit("authSucceed")
              }
            });

        }

    }
  }
};
</script>

<style scoped>
.auth{
  margin:2rem;
}

</style>

<style>
.auth .el-form-item__label{
  font-size: 1.2rem
}
.auth .el-input__inner {
  font-size: 1.2rem
} 
</style>
