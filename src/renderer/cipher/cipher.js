const fs = require("fs");
const crypto = require("crypto");
const EventEmitter = require("events");

class Cipher extends EventEmitter {
  constructor() {
    super(); //must call super for "this" to be defined.
  }
  encrypt(inputPath, outputPath, pass) {
    var infile = fs.createReadStream(inputPath);
    var outfile = fs.createWriteStream(outputPath);
    var cipher = crypto.createCipher("aes256", pass);
    var size = fs.statSync(inputPath).size;
    let that = this;
    infile
      .on("data", function(data) {
        var percentage = parseInt(infile.bytesRead) / parseInt(size);
        var encrypted = cipher.update(data);
        if (encrypted) {
          outfile.write(encrypted);
        }
        that.emit("encrypt-new-chunk", percentage);
      })
      .on("end", function() {
        outfile.write(cipher.final());
        outfile.close();
        that.emit("encrypt-finished");
      });
  }
  decrypt(inputPath, outputPath, pass) {
    var infile = fs.createReadStream(inputPath);
    var outfile = fs.createWriteStream(outputPath);
    var cipher = crypto.createDecipher("aes256", pass);
    var size = fs.statSync(inputPath).size;
    let that = this;
    infile
      .on("data", function(data) {
        var percentage = parseInt(infile.bytesRead) / parseInt(size);
        var encrypted = cipher.update(data);
        if (encrypted) {
          outfile.write(encrypted);
        }
        that.emit("decrypt-new-chunk", percentage);
      })
      .on("end", function() {
        cipher.setAutoPadding(false)
        outfile.write(cipher.final());
        outfile.close();
        that.emit("decrypt-finished");
      });
  }
}

export default Cipher