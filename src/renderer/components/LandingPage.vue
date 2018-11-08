<template>
      <div @click="away" style="height:100%">
        <div class="title" >
          Safe Box
        </div>
        <div style="display:flex;align-items:center;margin:0 10px">
           <font-awesome-icon icon="arrow-up" fixed-width @click="goBackDir" ></font-awesome-icon>
            <el-input v-model="currentDirInBar" :value="currentDirStr" placeholder="请输入内容" @keyup.enter.native="pathEnterHandler"></el-input>


        <div>

        </div>

        </div>

      <div style="display:flex;flex-wrap:wrap">
        <div v-for="file in filesInSafe" :key="file.absoluteDir" :class="{'file-selected': isActive(file.absoluteDir)}" >
          <File :file="file" @doubleClick="doubleClickHandler" @singleClick="singleClickHandler" >
          </File>
        </div>
          
      </div>
        
      </div>

</template>

<script>
import File from "./File/File";
import Path from "../path/path.js";

const fs = require("fs");
var spawn = require("child_process").spawn;
var exec = require("child_process").exec;

var openFile = function(path) {
  exec(`xdg-mime query filetype ${path}`, (error, fileType, stderr) => {
    exec(`xdg-mime query default ${fileType}`, (error, app, stderr) => {
      if (app.endsWith(".desktop\n")) spawn(`${app.slice(0, -9)}`, [path]);
    });
  });
};
var walk = function(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var i = 0;
    (function next() {
      var file = list[i++];
      if (!file) return done(null, results);
      file = dir + "/" + file;
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            next();
          });
        } else {
          results.push(file);
          next();
        }
      });
    })();
  });
};
export default {
  name: "landing-page",
  components: { File },

  data() {
    return {
      filesInSafe: [],
      currentDir: new Path(["home", "xytao", "safe"]),
      safeDir: "/home/xytao/safe/",
      currentSelection: "",
      currentDirInBar: ""
    };
  },

  computed: {
    currentDirStr() {
      this.currentDirInBar = this.currentDir.getPathStr();
    }
  },
  methods: {
    pathEnterHandler() {
      console.log(this.currentDirInBar);
      if (this.currentDirInBar.startsWith("/"))
        fs.stat(this.currentDirInBar, (err, stat) => {
          if (err) {
          } else if (stat.isFile()) {
            openFile(this.currentDirInBar);
            this.currentDirInBar=this.currentDir.getPathStr()
          } else if (stat.isDirectory()) {
            this.filesInSafe = [];
            this.currentDir.gotoAbsoluteDir(this.currentDirInBar);
            this.readFromDir(
              this.currentDirInBar +
                (this.currentDirInBar.endsWith("/") ? "" : "/")
            );
          }
        });
    },
    away: function() {
      this.currentSelection = "";
    },
    isActive(f) {
      return this.currentSelection == f;
    },
    goBackDir() {
      if (this.currentDir.getPathStr() !== this.safeDir) {
        this.currentDir = this.currentDir.getParentDir();
        this.filesInSafe = [];
        this.readFromDir(this.currentDir.getPathStr());
      }
    },
    readFromDir(absoluteDir) {
      fs.readdir(absoluteDir, (eff, files) => {
        files.forEach(async filename => {
          let fileAbsolute = absoluteDir + filename;
          fs.stat(fileAbsolute, (err, stat) => {
            this.filesInSafe.push({
              safeDir: this.safeDir,
              absoluteDir: fileAbsolute,
              name: filename,
              stat: stat,
              isDirectory: stat.isDirectory()
            });
          });
        });
      });
    },
    singleClickHandler(file) {
      this.currentSelection = file.absoluteDir;
    },
    doubleClickHandler(file) {
      if (file.isDirectory) {
        this.filesInSafe = [];
        this.currentDir.gotoDir(file.name);
        this.readFromDir(file.absoluteDir + "/");
      } else {
        openFile(file.absoluteDir);
      }
    },
    open(link) {
      this.$electron.shell.openExternal(link);
    }
  },
  created() {
    this.readFromDir(this.safeDir);
  }
};
</script>

<style>
@import url("https://fonts.googleapis.com/css?family=Source+Sans+Pro");

* {
  font-family: "Source Sans Pro", sans-serif;

  box-sizing: border-box;
  margin: 0;
  padding: 0;
  user-select: none;
}
html {
  height: 100%;
  margin: 0;
  padding: 0;
}
body {
  height: 100%;
  margin: 0;
  padding: 0;
}

#wrapper {
  background: radial-gradient(
    ellipse at top left,
    rgba(255, 255, 255, 1) 40%,
    rgba(229, 229, 229, 0.9) 100%
  );
  height: 100vh;
  padding: 60px 80px;
  width: 100vw;
}

#logo {
  height: auto;
  margin-bottom: 20px;
  width: 420px;
}

.left-side {
  display: flex;
  flex-direction: column;
}

.welcome {
  color: #555;
  font-size: 23px;
  margin-bottom: 10px;
}

.title {
  color: #2c3e50;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 6px;
  text-align: center;
}

.title.alt {
  font-size: 18px;
  margin-bottom: 10px;
}

.doc p {
  color: black;
  margin-bottom: 10px;
}

.doc button {
  font-size: 0.8em;
  cursor: pointer;
  outline: none;
  padding: 0.75em 2em;
  border-radius: 2em;
  display: inline-block;
  color: #fff;
  background-color: #4fc08d;
  transition: all 0.15s ease;
  box-sizing: border-box;
  border: 1px solid #4fc08d;
}

.doc button.alt {
  color: #42b983;
  background-color: transparent;
}

.fa-fw:hover {
  color: gray;
}
</style>
<style scoped>
.file-selected {
  background: #f7f7f7;
}
.el-input{
  margin:10px;
  font-size:16px;
}
</style>