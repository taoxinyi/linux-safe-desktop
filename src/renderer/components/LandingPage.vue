<template>
  <div id="wrapper">
    <img id="logo" src="~@/assets/logo.png" alt="electron-vue">
    <main>
      <div class="left-side">
        <span class="title">
          Welcome to your new project!
        </span>
        <File v-for="file in filesInSafe" :file="file" :key="file.relativeDir" @doubleClick="doubleClickHandler" >
        </File>
      </div>

      <div class="right-side">
        <div class="doc">
          <div class="title">Getting Started</div>
          <p>
            electron-vue comes packed with detailed documentation that covers everything from
            internal configurations, using the project structure, building your application,
            and so much more.
          </p>
          <button @click="open('https://simulatedgreg.gitbooks.io/electron-vue/content/')">Read the Docs</button><br><br>
        </div>
        <div class="doc">
          <div class="title alt">Other Documentation</div>
          <button class="alt" @click="open('https://electron.atom.io/docs/')">Electron</button>
          <button class="alt" @click="open('https://vuejs.org/v2/guide/')">Vue.js</button>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import File from "./File/File";
const fs = require("fs");
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
      safeDir:"/home/xytao/safe"
    };
  },

  methods: {
    readFromDir(absoluteDir) {
      fs.readdir(absoluteDir, (eff, files) => {
        files.forEach(async filename => {
          let fileAbsolute = absoluteDir + "/" + filename;
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
    doubleClickHandler(file) {
      if (file.isDirectory) {
        this.filesInSafe = [];
        let absoluteDir = file.absoluteDir;
        this.readFromDir(absoluteDir);
      }
    },
    open(link) {
      this.$electron.shell.openExternal(link);
    }
  },
  created() {
    let safeBase = "/home/xytao/safe";
    fs.readdir(safeBase, (err, files) => {
      files.forEach(async filename => {
        let fileAbsolute = safeBase + "/" + filename;
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
  }
};
</script>

<style>
@import url("https://fonts.googleapis.com/css?family=Source+Sans+Pro");

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: "Source Sans Pro", sans-serif;
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

main {
  display: flex;
  justify-content: space-between;
}

main > div {
  flex-basis: 50%;
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
</style>
