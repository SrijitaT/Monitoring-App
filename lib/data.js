//lib to store data
const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');

const lib = {};
//base directory of the data folder
lib.baseDir = path.join(__dirname, '/../.data/');

//write data to a file
lib.create = (dir, file, data, callback) => {
	const directory = lib.baseDir;
	if (!fs.existsSync(lib.baseDir + dir)) fs.mkdirSync(lib.baseDir + dir);
	//Open the file for writing
	fs.open(lib.baseDir + dir + '/' + file + '.json', 'wx', (err, fd) => {
		if (!err && fd) {
			//Convert data to string
			const stringData = JSON.stringify(data);
			//Write to file and close it
			fs.writeFile(fd, stringData, err => {
				if (!err) {
					fs.close(fd, err => {
						if (!err) {
							callback(false);
						} else {
							callback('Error closing new file');
						}
					});
				} else {
					callback('Error writing to new file');
				}
			});
		} else {
			callback('Could not create new file,it may already exists!');
		}
	});
};

lib.read = (dir, file, callback) => {
	fs.readFile(
		lib.baseDir + dir + '/' + file + '.json',
		'utf-8',
		(err, data) => {
			if (!err && data) {
				const parsedData = helpers.parseJsonToObj(data);
				callback(false, parsedData);
			} else {
				callback(err, data);
			}
		}
	);
};

lib.update = (dir, file, data, callback) => {
	//Open the file for writing
	fs.open(lib.baseDir + dir + '/' + file + '.json', 'r+', (err, fd) => {
		if (!err && fd) {
			let stringData = JSON.stringify(data);
			fs.truncate(fd, err => {
				if (!err) {
					fs.writeFile(fd, stringData, err => {
						if (!err) {
							fs.close(fd, err => {
								if (!err) {
									callback(false);
								} else {
									callback('Error closing new file');
								}
							});
						}
					});
				}
			});
		} else {
			callback('Could not update');
		}
	});
};

lib.delete = (dir, file, callback) => {
	fs.open(lib.baseDir + dir + '/' + file + '.json', 'r', err => {
		if (!err) {
			fs.unlink(lib.baseDir + dir + '/' + file + '.json', err => {
				callback(err);
			});
		} else {
			callback('File not present');
		}
	});
};
module.exports = lib;
