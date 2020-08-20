/*********************
* Base64 ArrayBuffer *
*********************/
var Base64 = (function() {
    "use strict";
    var exports = {};
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    // Use a lookup table to find the index.
    var lookup = new Uint8Array(256);
    for (var i = 0; i < chars.length; i++) {
        lookup[chars.charCodeAt(i)] = i;
    }
    exports.encode = function(arraybuffer) {
        var bytes = new Uint8Array(arraybuffer), i, len = bytes.length, base64 = "";
        for (i = 0; i < len; i += 3) {
            base64 += chars[bytes[i] >> 2];
            base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
            base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
            base64 += chars[bytes[i + 2] & 63];
        }
        if ((len % 3) === 2) {
            base64 = base64.substring(0, base64.length - 1) + "=";
        } else if (len % 3 === 1) {
            base64 = base64.substring(0, base64.length - 2) + "==";
        }
        return base64;
    }
    ;
    exports.decode = function(base64) {
        var bufferLength = base64.length * 0.75, len = base64.length, i, p = 0, encoded1, encoded2, encoded3, encoded4;
        if (base64[base64.length - 1] === "=") {
            bufferLength--;
            if (base64[base64.length - 2] === "=") {
                bufferLength--;
            }
        }
        var arraybuffer = new ArrayBuffer(bufferLength)
          , bytes = new Uint8Array(arraybuffer);
        for (i = 0; i < len; i += 4) {
            encoded1 = lookup[base64.charCodeAt(i)];
            encoded2 = lookup[base64.charCodeAt(i + 1)];
            encoded3 = lookup[base64.charCodeAt(i + 2)];
            encoded4 = lookup[base64.charCodeAt(i + 3)];
            bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
            bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
            bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
        }
        return arraybuffer;
    }
    ;
    return exports;
})();
/*******
* UTF8 *
*******/
var UTF8 = {
    toString: function(byteArray, keepZeros) {
        if(byteArray.byteLength){
            byteArray=new Uint8Array(byteArray);
        }
        var str = "";
        var bytesLeft = 0;
        var codePoint = 0;
        for (var i = 0; i < byteArray.length && (byteArray[i] || bytesLeft || keepZeros); i++) {
            if (byteArray[i] & 0x80) {
                if (bytesLeft) {
                    if (byteArray[i] & 0xC0 !== 0xC0) {
                        console.error("UTF8 encoding error. Unexpected following byte.");
                        bytesLeft = 0;
                    } else {
                        codePoint = (codePoint << 6) + (byteArray[i] & 0x3F);
                        bytesLeft--;
                        if (bytesLeft === 0) {
                            if (codePoint > 0xFFFF) {
                                codePoint -= 0x10000;
                                str += String.fromCharCode(0xD800 | (codePoint >>> 10), 0xDC00 | (codePoint & 0x3FF));
                            } else {
                                str += String.fromCharCode(codePoint);
                            }
                        }
                    }
                } else {
                    bytesLeft = 0;
                    var mask = 0x40;
                    while (mask & byteArray[i]) {
                        bytesLeft++;
                        mask >>>= 1;
                    }
                    if (bytesLeft < 1 || bytesLeft > 5) {
                        console.error("UTF8 encoding error. Unexpected first byte.");
                        bytesLeft = 0;
                    } else {
                        codePoint = (mask - 1) & byteArray[i];
                    }
                }
            } else {
                if (bytesLeft) {
                    console.error("UTF8 encoding error. Unexpected end of multibyte character.");
                    bytesleft = 0;
                }
                str += String.fromCharCode(byteArray[i]);
            }
        }
        return str;
    },
    toByteArray: function(byteArray, string) {
        if(byteArray instanceof ArrayBuffer){
            byteArray=new Uint8Array(byteArray);
        }
        var byte = 0;
        for (let i = 0; i < string.length; i++) {
            var codePoint = string.charCodeAt(i);
            //deal with UTF16
            if ((codePoint & 0xFC00) === 0xD800 && (string.charCodeAt(i + 1) & 0xFC00) === 0xDC00) {
                i++;
                codePoint = 0x10000 + ((codePoint & 0x3FF) << 10) + (string.charCodeAt(i) & 0x3FF);
            }
            if (codePoint < 0x80) {
                byteArray[byte++] = codePoint;
            } else if (codePoint < 0x800) {
                byteArray[byte++] = 0xC0 + (codePoint >>> 6);
                byteArray[byte++] = 0x80 + (codePoint & 0x3F);
            } else if (codePoint < 0x10000) {
                byteArray[byte++] = 0xE0 + (codePoint >>> 12);
                byteArray[byte++] = 0x80 + ((codePoint >>> 6) & 0x3F);
                byteArray[byte++] = 0x80 + (codePoint & 0x3F);
            } else if (codePoint < 0x200000) {
                byteArray[byte++] = 0xF0 + (codePoint >>> 18);
                byteArray[byte++] = 0x80 + ((codePoint >>> 12) & 0x3F);
                byteArray[byte++] = 0x80 + ((codePoint >>> 6) & 0x3F);
                byteArray[byte++] = 0x80 + (codePoint & 0x3F);
            } else if (codePoint < 0x4000000) {
                byteArray[byte++] = 0xF8 + (codePoint >>> 24);
                byteArray[byte++] = 0x80 + ((codePoint >>> 18) & 0x3F);
                byteArray[byte++] = 0x80 + ((codePoint >>> 12) & 0x3F);
                byteArray[byte++] = 0x80 + ((codePoint >>> 6) & 0x3F);
                byteArray[byte++] = 0x80 + (codePoint & 0x3F);
            } else {
                byteArray[byte++] = 0xFC + ((codePoint >>> 30) & 1);
                byteArray[byte++] = 0x80 + ((codePoint >>> 24) & 0x3F);
                byteArray[byte++] = 0x80 + ((codePoint >>> 18) & 0x3F);
                byteArray[byte++] = 0x80 + ((codePoint >>> 12) & 0x3F);
                byteArray[byte++] = 0x80 + ((codePoint >>> 6) & 0x3F);
                byteArray[byte++] = 0x80 + (codePoint & 0x3F);
            }
        }
    }
};

/*******
* RAW8 *
*******/
var RawString = {
    toString: function(byteArray, keepZeros) {
        var str=String.fromCharCode.apply(String,byteArray);
        var pos;
        if(!keepZeros && -1<(pos=str.indexOf(String.fromCharCode(0)))){
            str=str.slice(0,pos);
        }
        return str;
    },
    toByteArray: function(byteArray, string) {
        if(byteArray instanceof ArrayBuffer){
            byteArray=new Uint8Array(byteArray);
        }
        for (let i = 0; i < string.length; i++) {
            byteArray[i] = string.charCodeAt(i) || 0;
        }
    }
};

/*************************
* Structs - Rquires UTF8 *
*************************/
var CreateStruct = (function() {
    var CreateStruct = function(format, arrayBuffer, offset, proto) {
        offset || (offset = 0);
        this.sFormat == {};
        var currentOffset = 0;
        var nFormat = {};
        for (var name in format) {
            if (typeof format[name] === "string") {
                var typeLength = format[name].split(':');
                nFormat[name] = {
                    type: typeLength[0],
                    length: parseInt(typeLength[1] || 0),
                    offset: currentOffset,
                    enumerable: true
                }
            } else {
                nFormat[name] = {
                    type: format[name].type,
                    length: format[name].length || 0,
                    offset: format[name].offset || currentOffset,
                    enumerable: true
                }
                if (format[name].hasOwnProperty("enumerable")) {
                    nFormat[name].enumerable = !!format[name].enumerable;
                }
            }
            if (!(nFormat[name].type in bytesPer)) {
                cosole.error("unsupported type: ", nFormat[name].type);
                return;
            }
            currentOffset += bytesPer[nFormat[name].type] * (nFormat[name].length || 1);
        }
        if (!arrayBuffer) {
            arrayBuffer = new ArrayBuffer(offset + currentOffset);
        } else if (arrayBuffer.byteLength < currentOffset + offset) {
            console.error("arrayBufferTooShort");
            return;
        }
        var propertyObj = {
            arrayBuffer: {
                value: arrayBuffer
            },
            format: {
                value: nFormat
            },
            byteLength: {
                value: currentOffset
            },
            offset: {
                value: offset
            },
        };
        var dv = new DataView(arrayBuffer,offset,currentOffset);
        for (var name in nFormat) {
            Object.freeze(nFormat[name]);
            if (nFormat[name].type === "UTF8") {
                var tempByateArray = new Uint8Array(arrayBuffer,nFormat[name].offset + offset,nFormat[name].length);
                propertyObj[name] = {
                    get: UTF8.toString.bind(null, tempByateArray),
                    set: UTF8.toByteArray.bind(null, tempByateArray),
                    enumerable: nFormat[name].enumerable,
                }
            } else {
                if (nFormat[name].length) {
                    propertyObj[name] = {
                        value: new window[nFormat[name].type + "Array"](arrayBuffer,nFormat[name].offset + offset,nFormat[name].length)
                    };
                } else {
                    propertyObj[name] = {
                        get: dv["get" + nFormat[name].type].bind(dv, nFormat[name].offset, true),
                        set: addEndien.bind(dv, "set" + nFormat[name].type, nFormat[name].offset),
                        enumerable: nFormat[name].enumerable,
                    }
                }
            }
        }
        return Object.create(proto || Object.prototype, propertyObj);
    }
    var bytesPer = {
        "UTF8": 1,
        "RAW8": 1,
        "Uint8": 1,
        "Int8": 1,
        "Uint16": 2,
        "Int16": 2,
        "Uint32": 4,
        "Int32": 4,
        "Float32": 4,
        "Float64": 8,
    }
    var addEndien = function(funcStr, offset, value) {
        this[funcStr](offset, value, true);
    }
    return CreateStruct;
})();

//virtual class
var Ctype=function(Cname){};
Ctype.prototype.toObj=function(arrayBuffer, offset){throw new Error("Not Implimented")};
Ctype.prototype.toAB=function(arrayBuffer, offset, obj){throw new Error("Not Implimented")};
Ctype.prototype.declarationStringC=function(){throw new Error("Not Implimented")};

var BaseArrayedType=function(Cname,jsName,bytes){
    this.Cname=Cname;
    this.jsName=jsName;
    this.bytes=bytes;
}
BaseArrayedType.prototype=new Ctype();
BaseArrayedType.prototype.toObj=function(arrayBuffer, offset){
    var dv = new DataView(arrayBuffer,offset,this.bytes);
    return dv['get'+this.jsName](0,true);
}
BaseArrayedType.prototype.toAB=function(arrayBuffer, offset, obj){
    if(arrayBuffer){
        var dv = new DataView(arrayBuffer,offset,this.bytes)
        dv['set'+this.jsName](0,obj,true);
    }else{
        return (new window[this.jsName+"Array"]([obj])).arrayBuffer;
    }
}
BaseArrayedTypes={
    Int8:["char",1],
    Int16:["int",2],
    Int32:["long",4],
    Uint8:["unsigned char",1],
    Uint16:["unsigned int",2],
    Uint32:["unsigned long",4],      
};
for(let i in BaseArrayedTypes){
    BaseArrayedTypes[i]=new BaseArrayedType(BaseArrayedTypes[i][0],i,BaseArrayedTypes[i][1]);
}

var EnumType=function(Cname,arrNames){
    this.Cname=Cname;
    this.bytes=2;
    for(var i=0;i<arrNames.length;i++){
        this[arrNames[i]]=i;
    }
    this.arrNames=arrNames;
}
EnumType.prototype=new Ctype();
EnumType.prototype.toObj=function(arrayBuffer, offset){
    var dv = new DataView(arrayBuffer,offset,this.bytes);
    return dv.getUint16(0,true);
}
EnumType.prototype.toAB=function(arrayBuffer, offset, obj){
    if(arrayBuffer){
        offset || (offset=0);
        var dv = new DataView(arrayBuffer,offset,this.bytes);
        dv.setUint16(0,obj,true);
    }else{
        return (new Uint16Array([obj])).arrayBuffer;
    }
}
EnumType.prototype.declarationStringC=function(){
    var out="typedef enum "+this.Cname+"{\r\n";
    for(var i=0;i<this.arrNames.length;i++){
        out+="\t"+this.arrNames[i]+",\r\n";
    }
    out=out.slice(0,-3)+"\r\n} "+this.Cname+";\r\n";
    return out;
};


var StringType=function(length){
    this.Cname="char";
    this.bytes=length;
    this.arrayModifier="["+length+"]";
}
StringType.prototype=new Ctype();

var UTFStringType=function(length){
    StringType.call(this,length);
}
UTFStringType.prototype=new StringType(0);
UTFStringType.prototype.toObj=function(arrayBuffer, offset){
    return UTF8.toString(new Uint8Array(arrayBuffer,offset,this.bytes));
}
UTFStringType.prototype.toAB=function(arrayBuffer, offset, obj){
    UTF8.toByteArray(new Uint8Array(arrayBuffer,offset,this.bytes),obj);
}

var RawStringType=function(length){
     StringType.call(this,length);
}
RawStringType.prototype=new StringType(0);
RawStringType.prototype.toObj=function(arrayBuffer, offset){
    return RawString.toString(new Uint8Array(arrayBuffer,offset,this.bytes));
}
RawStringType.prototype.toAB=function(arrayBuffer, offset, obj){
    RawString.toByteArray(new Uint8Array(arrayBuffer,offset,this.bytes),obj);
}


var BinaryFormat = (function() {
    var BinaryFormat = function(Cname,formatSpecification) {
        this.Cname=Cname;
        var currentOffset = 0;
        this.format = {};
        for (var name in formatSpecification) {
            if (typeof formatSpecification[name] === "string") {
                var typeLength = formatSpecification[name].split(':');
                this.format[name] = {
                    type: typeLength[0],
                    offset: currentOffset,
                    enumerable: true
                }
                if(BaseArrayedTypes[this.format[name].type]){
                    this.format[name].type=BaseArrayedTypes[this.format[name].type];
                }else{
                    throw Error("Unexpected Type:"+this.format[name].type);
                }
                if(typeLength[1]){
                    this.format[name].length=parseInt(typeLength[1]);
                }
            }else{
                if (formatSpecification[name]instanceof Ctype) {
                    this.format[name] = {
                        type: formatSpecification[name],
                        offset: currentOffset,
                        enumerable: true
                    }
                } else {
                    this.format[name] = {
                        type: formatSpecification[name].type,
                        length: formatSpecification[name].length,
                        offset: currentOffset,
                        enumerable: true
                    }
                }
                if (formatSpecification[name].hasOwnProperty("enumerable")) {
                    this.format[name].enumerable = !!formatSpecification[name].enumerable;
                }
                if(! this.format[name].type instanceof Ctype){
                    throw Error("Not a Ctype");
                }
            }
            currentOffset += (this.format[name].bytes=this.format[name].type.bytes * (this.format[name].length || 1));
        }
        this.bytes = currentOffset;
    }
    BinaryFormat.prototype = new Ctype();
    BinaryFormat.prototype.toObj= function(arrayBuffer, offset, obj) {
        var dv = new DataView(arrayBuffer,offset,this.length);
        obj = obj || {};
        for (var name in this.format) {
            var cf = this.format[name];
            var l = cf.length || 1;
            obj[name] = [];
            for (let i = 0; i < l; i++) {
                obj[name][i] = cf.type.toObj(arrayBuffer, offset + cf.offset + i * cf.type.bytes);
            }
            if (!cf.length) {
                obj[name]=obj[name][0];
            }
        }
        return obj;
    }
    BinaryFormat.prototype.toAB=function(arrayBuffer, offset,obj) {
        var dv = new DataView(arrayBuffer,offset,this.length);
        for (var name in this.format) {
            var cf = this.format[name];
            if(cf.length&&obj[name].length!=cf.length && ((!obj[name].type instanceof StringType) || obj[name].length>  cf.length) ){
                console.error("wrong lengh for "+name,obj[name])
                return;
            }
            var currentArray= cf.length?obj[name]:[obj[name]];
            var l = cf.length || 1;
            for (let i = 0; i < l; i++) {
                cf.type.toAB(arrayBuffer, offset + cf.offset + i * cf.type.bytes,currentArray[i]);
            }
        }
    };
    BinaryFormat.prototype.declarationStringC=function(createLength){
        var out="typedef struct "+this.Cname+"{\r\n"
        for(var prop in this.format){
            out+="\t"+this.format[prop].type.Cname+" "+prop;
            if(this.format[prop].length){
                out+="["+this.format[prop].length+"]";
            }
            if(this.format[prop].type.arrayModifier){
                out+=this.format[prop].type.arrayModifier;
            }
            out+=";\r\n";
        }
        out+="} "+this.Cname+";\r\n";
        var size=this.bytes.toString();
        if(createLength){
            size=this.Cname+'_LENGTH ';
            out+='#define '+size+" "+this.bytes+'\r\n';
        }
        out+="STATIC_ASSERT( sizeof("+this.Cname+")=="+size+', "Unexpected size. Check for padding");\r\n';
        return out;
    };
   return BinaryFormat;
})();
