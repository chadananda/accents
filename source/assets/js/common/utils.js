Accents.module("Utils", function(Utils, App, Backbone, Marionette, $, _)  {

   var commonErrors = function (word) {
        // vowels
        word = word.replace(/Husayn/, 'Ḥusayn');
        word = word.replace(/Hasan/, 'Ḥasan');
        word = word.replace(/Muhammad/, 'Muḥammad');
        word = word.replace(/Ham[i|í]d/, 'Ḥamíd');       
        
        word = word.replace(/^Abdu/, '‘Abdu');  
        word = word.replace(/Ahmad/, 'Aḥmad'); 
        word = word.replace(/llah/, 'lláh'); 
        word = word.replace(/H[a|á]j[i|í]/, 'Ḥájí'); 
        word = word.replace(/_Shuhad[a|á]$/, '_Shuhadá’'); 
        word = word.replace(/Tihr[a|á]n/, 'Ṭihrán'); 
        word = word.replace(/Yahy[a|á]/, 'Yaḥyá'); 
        word = word.replace(/Sult[a|á]n/, 'Sulṭán'); 
        word = word.replace(/^ulam[a|á]/, '‘ulamá'); 
        word = word.replace(/^Ulam[a|á]/, '‘Ulamá'); 
        
        return word;
    };  

    var dotUnders = function (word) {
        // vowels
        word = word.replace(/\^a/g, 'á');
        word = word.replace(/\^i/g, 'í');
        word = word.replace(/\^u/g, 'ú');
        word = word.replace(/\^A/g, 'Á');
        word = word.replace(/\^I/g, 'Í');
        word = word.replace(/\^U/g, 'Ú');
        word = word.replace(/\`a/g, 'á');
        word = word.replace(/\`i/g, 'í');
        word = word.replace(/\`u/g, 'ú');
        word = word.replace(/\`A/g, 'Á');
        word = word.replace(/\`I/g, 'Í');
        word = word.replace(/\`U/g, 'Ú');
        
        // double letter based vowels. 
        // Don't use where you expect non-transliterated words
        word = word.replace(/aa/g, 'á');
        word = word.replace(/ii/g, 'í');
        word = word.replace(/uu/g, 'ú');
        word = word.replace(/AA/g, 'Á');
        word = word.replace(/II/g, 'Í');
        word = word.replace(/UU/g, 'Ú'); 
        word = word.replace(/áa/g, 'a');
        word = word.replace(/íi/g, 'i');
        word = word.replace(/úu/g, 'u');
        word = word.replace(/ÁA/g, 'A');
        word = word.replace(/ÍI/g, 'I');
        word = word.replace(/ÚU/g, 'U');        
        
        
        // dot-unders
        word = word.replace(/\.H/g, 'Ḥ');
        word = word.replace(/\.h/g, 'ḥ');
        word = word.replace(/\.D/g, 'Ḍ');
        word = word.replace(/\.d/g, 'ḍ');
        word = word.replace(/\.T/g, 'Ṭ');
        word = word.replace(/\.t/g, 'ṭ');
        word = word.replace(/\.Z/g, 'Ẓ');
        word = word.replace(/\.z/g, 'ẓ');
        word = word.replace(/\.S/g, 'Ṣ');
        word = word.replace(/\.s/g, 'ṣ');
        // ayn and hamza
        word = word.replace(/[\'|‘|’]9/g, '’'); // |‘|’
        word = word.replace(/[\'|‘|’]6/g, '‘');
        word = word.replace(/[\'|‘|’]hamza/g, '’');
        word = word.replace(/[\'|‘|’]ayn/g, '‘');
        word = word.replace(/’’/g, '‘');
        word = word.replace(/‘’/g, '’');

        return word;
    };

    Utils.dotUndersRevert = function (word) {
        // vowels
        word = word.replace(/\á/g, 'a');
        word = word.replace(/\í/g, 'i');
        word = word.replace(/\ú/g, 'u');
        word = word.replace(/\Á/g, 'A');
        word = word.replace(/\Í/g, 'I');
        word = word.replace(/\Ú/g, 'U');
        
        // dot-unders
        word = word.replace(/\Ḥ/g, 'H');
        word = word.replace(/\ḥ/g, 'h');
        word = word.replace(/\Ḍ/g, 'D');
        word = word.replace(/\ḍ/g, 'd');
        word = word.replace(/\Ṭ/g, 'T');
        word = word.replace(/\ṭ/g, 't');
        word = word.replace(/\Ẓ/g, 'Z');
        word = word.replace(/\ẓ/g, 'z');
        word = word.replace(/\Ṣ/g, 'S');
        word = word.replace(/\ṣ/g, 's');

        word = word.replace(/\’/g, '');
        word = word.replace(/\‘/g, '');
        word = word.replace(/\-/g, '');

        return word;
    };

    var lineUnder2HTML= function (word) {
        word = word.replace(/_([s|d|z|t|g|k|c][h])/ig, "<u>$1</u>");
        return word;
    };

    var smartQuotes = function (a) {
      a = a.replace(/(^|[-\u2014\s(\["])'/g, "$1\u2018");       // opening singles
      a = a.replace(/'/g, "\u2019");                            // closing singles & apostrophes
      //a = a.replace(/(^|[-\u2014/\[(\u2018\s])"/g, "$1\u201c"); // opening doubles
      //a = a.replace(/"/g, "\u201d");                            // closing doubles
      //a = a.replace(/--/g, "\u2014");                           // em-dashes
      return a
    };





   // public utilities

    Utils.randomTerm = function() {
        return {
            _id: Utils.genUUID('xxxxxxxxxx'),
            id: Utils.genUUID('xxxxxxxxxx'),
            term: _.shuffle([ 'Bahá', 'Abhá', 'Shoghi', 'Effendi', 'Báb', 'Quddús', 'Mulla', 'Ḥusayn' ])[0],
            ref: _.shuffle(['GPB', 'GWB', 'KIQ', 'SWA', 'HW', 'SAQ'])[0] + ', pg. ' + Math.floor(Math.random()*300),
            type: 'term',
            user: _.shuffle([ 'Chad', 'Dan', 'Ghazala', 'Bob', 'Liliane', 'Farhad', 'Gilbert', 'George' ])[0],
        };
    };

    Utils.genUUID = function (pattern) {
        pattern = pattern || 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
        var uuid = pattern.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
        return uuid;
    };

    Utils.importTermList = function (filename) {  // should be a comma or whitespace delimited file.
        return filename;
    };

    Utils.renderTypedTerm = function (term) {  // should be a comma or whitespace delimited file.
        term = dotUnders(term);
        term = lineUnder2HTML(term);
        term = smartQuotes(term);
        return term;
    };

    Utils.renderGlyph2UTF = function (term) {  // should be a comma or whitespace delimited file.
        term = smartQuotes(term);
        term = dotUnders(term);
        term = commonErrors(term);
        return term;
    };
    Utils.ilm2HTML = function (term) { // this only needs to render line unders, the rest is already part of ilm UTF-8
        return lineUnder2HTML(term);
    }



});

