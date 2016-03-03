'use strict';

const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

const metadataSchema = new Schema({
    _id: String,
    name: String,
    mimeType: String,
    size: Number,
    dateCreated: Date,
    lastModified: Date,
    parents: [String],
});

// and attach it to our model
module.exports = mongoose.model( 'Meta', metadataSchema );
