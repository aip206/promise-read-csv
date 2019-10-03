
const csv = require('fast-csv');
const fs = require('fs');
const data_list = [];
let count = 1;
const regexNumber = "^([-+]?[0-9]?[0-9](\\.[0-9][0-9]?)?)|([0-9]?[0-9]?(\\.[0-9][0-9]?))$";

const validationFK = (v) => {
    const kodetransaksi = v.data[1].match(/01|02|03/) != null;
    const nomorFaktur = v.data[3].match("^(\\d{13})$") != null;
    const masaPajak = v.data[4].match("^(0?[1-9]|1[012])$") != null;
    v.valid = [kodetransaksi, nomorFaktur, masaPajak].every((x) => x == true);
}

const validationOf = (v) => {
    const harga = v.data[3].match(regexNumber) != null;
    const hargaTotal = v.data[5].match(regexNumber) != null;
    const jumlah = v.data[4] != "0" && v.data[4] && "0.0" && v.data[4].match(regexNumber) != null;
    const nama = v.data[2] != "";
    v.valid = [harga, hargaTotal, nama, jumlah].every((x) => x == true);
}

const getDataRaw = (v) => {
    for (var i = 3; i < v.length; i++) {
        if (v[i].data[0] == "FK") {
            new Promise((resolve, reject) => validationFK(v[i]));
        } else if (v[i].data[0] == "OF") {
            new Promise((resolve, reject) => validationOf(v[i]));
        }
    }
}

const promise = new Promise((resolve, reject) => {
    fs.createReadStream('data.csv')
        .on('error', (err) => {
            reject(err)
        })
        .pipe(csv.parse({ headers: false, delimiter: ";", rowDelimiter: '\n' }))
        .on('data', (row) => {
            const data = {
                data: row,
                line: count,
                valid: false
            }
            data_list.push(data)
            count++;
        })
        .on('end', () => {
            resolve(getDataRaw(data_list));
        });
})

promise.then(() => {
    console.log(data_list);
}).catch((err) => console.log("Error Woy!! ", err));