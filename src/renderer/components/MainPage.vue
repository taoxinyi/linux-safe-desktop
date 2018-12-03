<template>
  <div style="height:100%">
    <div @click="away" style="height:100%;display:flex;flex-direction: column" v-if="isAuthPassed">
      <div class="title">Safe Box</div>
      <div style="display:flex;flex-direction: column;height:100%">
        <div style="display:flex;align-items:center;margin:0 10px">
          <font-awesome-icon icon="arrow-up" fixed-width @click="goBackDir"></font-awesome-icon>
          <el-input
            v-model="currentDirInBar"
            :value="currentDirStr"
            placeholder="Please enter path"
            @keyup.enter.native="pathEnterHandler"
          ></el-input>
        </div>

        <div style="display:flex;flex-wrap:wrap" v-contextmenu:contextmenu1>
          <div
            v-for="file in filesInSafe"
            :key="file.absoluteDir"
            :class="{'file-selected': isActive(file.absoluteDir)}"
            style="flex-grow:0"
          >
            <File
              :file="file"
              @doubleClick="doubleClickHandler"
              @singleClick="singleClickHandler"
              v-contextmenu:contextmenu
            ></File>
          </div>
        </div>
        <div style="flex-grow:1" v-contextmenu:contextmenu1></div>
        <v-contextmenu ref="contextmenu" @contextmenu="handleContextmenu" @hide="hideContextmenu">
          <v-contextmenu-item @click="decryptFileRightClick">Decrypt&Open</v-contextmenu-item>
          <v-contextmenu-item @click="openFileRightClick">Open</v-contextmenu-item>
          <v-contextmenu-item @click="encryptFileRightClick">Encrypt</v-contextmenu-item>
          <v-contextmenu-item @click="renameRightClick">Rename</v-contextmenu-item>
          <v-contextmenu-item @click="deleteFileRightClick">Delete</v-contextmenu-item>
        </v-contextmenu>
        <v-contextmenu
          ref="contextmenu1"
          @contextmenu="handleContextmenu2"
          :disabled="isParentRightClickHide"
        >
          <v-contextmenu-item @click="pasteFiletoDir">Paste</v-contextmenu-item>
          <v-contextmenu-item @click="openTerminalRightClick">Open terminal here</v-contextmenu-item>
          <v-contextmenu-item @click="refreshRightClick">Refresh</v-contextmenu-item>
        </v-contextmenu>
      </div>

      <el-dialog title="Decrypting file" :visible.sync="isDecryptionShow" width="500px" center>
        <div style="text-align:center">
          <el-input
            v-model="currentPassword"
            :placeholder="currentOpenPath"
            @keyup.enter.native="passwordDecHandler"
          ></el-input>
          <el-progress :text-inside="true" :stroke-width="25" :percentage="decryptionProgress"></el-progress>
        </div>
      </el-dialog>
      <el-dialog title="Encrypting file" :visible.sync="isEncryptionShow" width="500px" center>
        <div style="text-align:center">
          <el-input v-model="encryptFileName"></el-input>
          <el-input
            v-model="currentPassword"
            :placeholder="currentOpenPath"
            @keyup.enter.native="passwordEncHandler"
          ></el-input>
          <el-progress :text-inside="true" :stroke-width="25" :percentage="encryptionProgress"></el-progress>
        </div>
      </el-dialog>
      <el-dialog title="Rename" :visible.sync="isRenameShow" width="500px" center>
        <div style="text-align:center">
          <el-input v-model="renameFilename" @keyup.enter.native="renameHandler"></el-input>
        </div>
      </el-dialog>
    </div>
    <Auth
      v-if="!isAuthPassed"
      @authSucceed="authSucceed"
      style="height:100%;display:flex;flex-direction: column"
    ></Auth>
  </div>
</template>

<script>
import File from "./File/File";
import Auth from "./Auth/Auth";

import Path from "../path/path.js";
import Cipher from "../cipher/cipher.js";
const { clipboard } = require("electron");
const fs = require("fs");
var spawn = require("child_process").spawn;
var exec = require("child_process").exec;
var crypto = require("crypto");
var watch = require("node-watch");

export default {
  name: "MainPage",
  components: { File, Auth },

  data() {
    return {
      isAuthPassed: false,
      filesInSafe: [],
      currentDir: new Path(["home", "xytao", "safe"]),
      safeDir: "", //the path of top safe dir
      currentSelection: "", //current left click selection
      currentDirInBar: "", //current path in path bar
      isDecryptionShow: false,
      isEncryptionShow: false,
      isRenameShow: false,
      decryptionProgress: 0,
      encryptionProgress: 0,
      rightClickFile: undefined, //current right click file object
      currentOpenPath: undefined, //current open path for open
      currentPassword: undefined, //current password for enc&dec
      encryptFileName: undefined, //name for encrypted file
      renameFilename: "", //name for renamed file
      passwordMap: {},
      config: {},
      isParentRightClickHide: false
    };
  },

  computed: {
    currentDirStr() {
      this.currentDirInBar = this.currentDir.getPathStr();
    }
  },
  methods: {
    //right click on remaining space, paste, open terminal and refresh
    pasteFiletoDir() {
      let path = clipboard.readText();
      fs.stat(path, (err, status) => {
        if (err) console.log(err);
        else {
          let that = this;
          if (status.isDirectory()) {
            spawn(`cp`, ["-R", path, that.currentDir.getPathStr()]).on(
              "exit",
              e => {
                if (e === 0) {
                  that.filesInSafe = [];
                  that.readFromDir(that.currentDir.getPathStr());
                }
              }
            );
          } else {
            spawn(`cp`, [path, that.currentDir.getPathStr()]).on("exit", e => {
              if (e === 0) {
                that.filesInSafe = [];
                that.readFromDir(that.currentDir.getPathStr());
              }
            });
          }
        }
      });
    },
    openTerminalRightClick() {
      console.log(this.currentDir.getPathStr());
      spawn("gnome-terminal", [
        "--disable-factory",
        `--working-directory=` + this.currentDir.getPathStr()
      ]);
    },
    refreshRightClick() {
      this.filesInSafe = [];
      this.readFromDir(this.currentDir.getPathStr());
    },
    //auth and init keyshortcut
    initKeyShortCut() {
      window.addEventListener("keydown", e => {
        var evt = window.event ? event : e;
        if (evt.ctrlKey && evt.keyCode !== 17) {
          if (evt.key === "c") {
            if (this.currentSelection !== "")
              this.copyPathToClipboard(this.currentSelection);
          } else if (evt.key === "v") {
            this.pasteFiletoDir();
          }
        }
      });
    },
    authSucceed(dir) {
      this.isAuthPassed = true;
      this.safeDir = dir;
      this.readFromDir(dir);
      this.initKeyShortCut();
    },
    copyPathToClipboard(path) {
      clipboard.writeText(path);
    },

    renamePath(path, prefix, extension) {
      let path_array = path.split("/");
      let filename = path_array[path_array.length - 1];
      if (extension === undefined)
        path_array[path_array.length - 1] = prefix + filename;
      else {
        if (filename.indexOf(".") !== -1) {
          let orig_extension = filename.split(".").pop();
          filename = filename.slice(0, -(1 + orig_extension.length));
        }
        path_array[path_array.length - 1] = prefix + filename + `.${extension}`;
      }
      return path_array.join("/");
    },
    //right click on file & directory space, open, decrypt, encrypt, rename, delete

    openFileRightClick() {
      this.openFile(this.rightClickFile.absoluteDir, false);
    },
    encryptFileRightClick() {
      let file = this.rightClickFile;
      if (!file.isDirectory) {
        this.currentPassword = undefined;
        this.currentOpenPath = file.absoluteDir;
        this.isEncryptionShow = true;
        this.encryptionProgress = 0;
        this.encryptFileName = this.renamePath(file.absoluteDir, "encrypted_");
      }
    },
    decryptFileRightClick() {
      this.doubleClickHandler(this.rightClickFile);
    },
    renameRightClick() {
      this.renameFilename = this.rightClickFile.name;
      this.isRenameShow = true;
    },
    deleteFileRightClick() {
      console.log(this.rightClickFile);
      let that = this;
      spawn(`rm`, ["-rf", this.rightClickFile.absoluteDir]).on("exit", e => {
        if (e === 0) {
          that.filesInSafe = [];
          that.readFromDir(that.currentDir.getPathStr());
        }
      });
    },
    //handler for dialog press enter, encrypt, decrypt, rename
    passwordEncHandler() {
      console.log(this.currentPassword);
      let that = this;
      const cipher = new Cipher();
      console.log(this.rightClickFile.absoluteDir);
      cipher.encrypt(
        this.rightClickFile.absoluteDir,
        this.encryptFileName,
        this.currentPassword
      );
      cipher
        .on("encrypt-new-chunk", function(per) {
          that.encryptionProgress = parseInt(per * 100);
        })
        .on("encrypt-finished", function() {
          that.encryptionProgress = 100;
          that.isEncryptionShow = false;
          that.filesInSafe = [];
          that.readFromDir(that.currentDir.getPathStr());
        });
    },
    passwordDecHandler() {
      this.passwordMap[this.currentOpenPath] = this.currentPassword;
      this.openFile(this.currentOpenPath);
      this.isDecryptionShow = false;
    },

    renameHandler() {
      this.isRenameShow = false;
      let oldname = this.rightClickFile.absoluteDir;
      let newname = this.rightClickFile.dir + this.renameFilename;
      let that = this;
      spawn("mv", [oldname, newname]).on("exit", e => {
        if (e === 0) {
          that.filesInSafe = [];
          that.readFromDir(that.currentDir.getPathStr());
        }
      });
    },

    hideContextmenu() {
      this.isParentRightClickHide = false;
    },
    handleContextmenu(vnode) {
      this.isParentRightClickHide = true;
      this.rightClickFile = vnode.componentOptions.propsData.file;
    },
    handleContextmenu2(vnode) {
      console.log(vnode);
    },
    openFileWithDefault(path, callback) {
      exec(`xdg-mime query filetype ${path}`, (error, fileType) => {
        exec(`xdg-mime query default ${fileType}`, (error, app) => {
          fs.readFile(
            `/usr/share/applications/${app.slice(0, -1)}`,
            "utf8",
            (err, f) => {
              let r = /\nExec=(.*)\n/;
              let exec = r
                .exec(f)
                ["1"].replace("%U", path)
                .split(" ");
              let bin = exec[0];
              let param = exec.slice(1);
              spawn(`${bin}`, param).on("exit", () => {
                if (callback) callback();
              });
            }
          );
        });
      });
    },
    openFile(path, isDecrypted = true) {
      let that = this;
      if (!isDecrypted) that.openFileWithDefault(path);
      else {
        const cipher = new Cipher();
        let path_array = path.split("/");
        path_array[path_array.length - 1] =
          "decrypted_" + path_array[path_array.length - 1];

        let decryped_path = path_array.join("/");
        cipher.decrypt(path, decryped_path, this.currentPassword);
        cipher
          .on("decrypt-new-chunk", function(per) {
            that.decryptionProgress = parseInt(per * 100);
          })
          .on("decrypt-finished", function() {
            that.decryptionProgress = 100;
            let old_stats = fs.statSync(decryped_path);
            that.openFileWithDefault(decryped_path, function() {
              let new_stats = fs.statSync(decryped_path);
              if (new_stats.mtimeMs !== old_stats.mtimeMs) {
                //file modified
                const cipher = new Cipher();
                cipher.encrypt(decryped_path, path, that.currentPassword);
                cipher
                  .on("encrypt-new-chunk", function(per) {
                    //console.log(per)
                  })
                  .on("encrypt-finished", function() {
                    console.log("fins");
                    fs.unlink(decryped_path, err => {
                      console.log(err);
                    });
                    fs.unlink(decryped_path + "~", err => {
                      console.log(err);
                    });
                  });
              } else fs.unlink(decryped_path);
            });
          });
      }
    },
    pathEnterHandler() {
      console.log(this.currentDirInBar);
      if (this.currentDirInBar.startsWith("/"))
        fs.stat(this.currentDirInBar, (err, stat) => {
          if (err) {
          } else if (stat.isFile()) {
            this.openFile(this.currentDirInBar);
            this.currentDirInBar = this.currentDir.getPathStr();
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
      return this.currentSelection === f;
    },
    goBackDir() {
      if (this.currentDir.getPathStr() !== this.safeDir) {
        this.currentDir = this.currentDir.getParentDir();
        this.filesInSafe = [];
        this.readFromDir(this.currentDir.getPathStr());
      }
    },
    readFromDir(absoluteDir) {
      let directorys = [];
      let files = [];
      fs.readdir(absoluteDir, (eff, filenames) => {
        let total = filenames.length;
        let count = 0;
        filenames.forEach(async filename => {
          let fileAbsolute = absoluteDir + filename;
          console.log("111", fileAbsolute);
          fs.stat(fileAbsolute, (err, stat) => {
            console.log(fileAbsolute, stat);

            if (stat !== undefined && stat.isDirectory())
              directorys.push({
                safeDir: this.safeDir,
                dir: absoluteDir,
                absoluteDir: fileAbsolute,
                name: filename,
                stat: stat,
                isDirectory: true
              });
            else if (stat !== undefined && stat.isFile())
              files.push({
                safeDir: this.safeDir,
                dir: absoluteDir,
                absoluteDir: fileAbsolute,
                name: filename,
                stat: stat,
                isDirectory: false
              });
            count++;
            if (count == total) {
              this.filesInSafe = directorys.concat(files);
            }
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
        this.currentPassword = undefined;
        this.currentOpenPath = file.absoluteDir;
        this.isDecryptionShow = true;
        this.decryptionProgress = 0;
      }
    },
    open(link) {
      this.$electron.shell.openExternal(link);
    }
  }
};
</script>

<style>
@font-face {
  font-family: "Source Sans Pro";
  src: url("../assets/fonts/SourceSansPro-Regular.ttf.woff2") format("woff2");
}

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

.el-progress-bar__innerText {
  font-size: 20px;
}
</style>
<style scoped>
.file-selected {
  background: #f7f7f7;
}

.el-input {
  margin: 10px 0;
  font-size: 16px;
}
</style>