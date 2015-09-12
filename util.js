function getAjax( name ) {
    key = name;
    data[key]='';

    function get(key, name) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange=function() {
            if(xmlhttp.readyState!=4) return;
            data[key] = xmlhttp.responseText;
            loadingCount -= 1;
        }
        xmlhttp.open('GET',name,true);
        xmlhttp.send();
    }

    get(key,name);
    loadingCount += 1;
    return key;
}
function bindRecursive(s) {
    ret = {}
    for ( key in s ) {
        if (typeof s[key] == 'function') {
            ret[key]=s[key].bind(ret);
        } else {
            ret[key]=s[key];
        }
    }
    return ret;
}

//http://jsperf.com/native-and-non-native-random-numbers/5
var lcg = (function() {
      // Set to values from http://en.wikipedia.org/wiki/Numerical_Recipes
      // m is basically chosen to be large (as it is the max period)
      // and for its relationships to a and c
  var m = 4294967296,
      // a - 1 should be divisible by m's prime factors
      a = 1664525,
      // c and m should be co-prime
      c = 1013904223,
      seed, z;
  return {
    setSeed : function(val) {
      z = seed = val || Math.round(Math.random() * m);
    },
    getSeed : function() {
      return seed;
    },
    rand : function() {
      // define the recurrence relationship
      z = (a * z + c) % m;
      // return a float in [0, 1) 
      // if z = m then z / m = 0 therefore (z % m) / m < 1 always
      return z / m;
    }
  };
});


function clamp( min, max, val ) {
    return ( val < min ) ? min : ( ( val > max ) ? max : val );
}
