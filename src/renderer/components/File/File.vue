<template>

    <div @dblclick="dblclickHandler" @click.stop='clickHandler' class="file" @mouseover="iconHoverHandler" @mouseout="iconLeaveHandler">
      <div class="file-icon"  >
        <font-awesome-icon icon="folder" fixed-width v-if="file.isDirectory" :style="{'font-size': '50px','color':folderColor}"/>
        <font-awesome-icon :icon="['fal','file']" fixed-width v-else :style="{'font-size': '50px','color':fileColor}" />
      </div>
      <span class="file-name"> {{file.name}} </span>
       
    </div>
</template>

<script>
const fs = require("fs");

export default {
  name: "File",
  props: ["file"],
  data() {
    return {
      isActive:false,
    };
  },
  computed:{
    folderColor(){
      return this.isActive?'#93e7fb':'#83d7fb'
    },
    fileColor(){
      return this.isActive?'#e4e4e4':'gray'
    }
  },
  methods: {
    iconLeaveHandler(){
      this.isActive=false
    },
    iconHoverHandler() {
      this.isActive=true
    },
    dblclickHandler() {
      this.$emit("doubleClick", this.file);
    },
    clickHandler(){
      this.$emit("singleClick", this.file);
    }
  }
};
</script>

<style scoped>
.file {
  width:100px;
  padding: 10px;
  text-align: center;
  user-select: none;
  cursor: default;
}
.file-icon {
  margin: 5px;
}
.file-name {
  word-break: break-all;
}
</style>

