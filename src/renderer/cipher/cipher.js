const crypto = require("crypto");
const fs = require("fs");
const EventEmitter = require("events");

class Cipher extends EventEmitter {
  constructor() {
    super();
  }

  static getKey(password) {
    return crypto
      .createHash("sha256")
      .update(password)
      .digest();
  }

  encrypt(inputFile, outputFile, password, algorithm="aes-256-cfb") {
    const iv = crypto.randomBytes(16);
    const key = Cipher.getKey(password);
    const readStream = fs.createReadStream(inputFile);
    const writeStream = fs.createWriteStream(outputFile);
    writeStream.write(iv);
    const size = fs.statSync(inputFile).size;
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let that = this;
    readStream
      .on("data", data => {
        let b = cipher.update(data);
        if (b.length > 0) {
          writeStream.write(b);
          that.emit(
            "encrypt-new-chunk",
            parseInt(readStream.bytesRead) / parseInt(size)
          );
        }
      })
      .on("end", () => {
        writeStream.write(cipher.final(), function() {
          writeStream.close();
          that.emit("encrypt-finished");
        });
      });
  }

  decrypt(inputFile, outputFile, password, algorithm="aes-256-cfb") {
    const ivReadStream = fs.createReadStream(inputFile, { start: 0, end: 15 });
    ivReadStream.on("data", chunk => {
      const iv = chunk;
      const readStream = fs.createReadStream(inputFile, { start: 16 });
      const writeStream = fs.createWriteStream(outputFile);
      const key = Cipher.getKey(password);
      const size = fs.statSync(inputFile).size;
      const cipher = crypto.createDecipheriv(algorithm, key, iv);
      let that = this;
      readStream
        .on("data", data => {
          let b = cipher.update(data);
          if (b.length > 0) {
            writeStream.write(b);
            that.emit(
              "decrypt-new-chunk",
              parseInt(readStream.bytesRead) / parseInt(size)
            );
          }
        })
        .on("end", () => {
          writeStream.write(cipher.final(), function() {
            writeStream.close();
            that.emit("decrypt-finished");
          });
        });
    });
  }
}

export default Cipher;
