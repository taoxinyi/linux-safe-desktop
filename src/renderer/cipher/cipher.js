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
    let iv = crypto.pseudoRandomBytes(cipherIvSize)
    var cipher = crypto.createCipheriv("aes-128-cbc", 'e79455fb63d9a3c7c3e68835ac920c86',iv);
    cipher.setAutoPadding(true)
    outfile.write(iv);

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
    cipher.setAutoPadding(true)

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
        outfile.write(cipher.final());
        outfile.close();
        that.emit("decrypt-finished");
      });
  }
}

export default Cipher