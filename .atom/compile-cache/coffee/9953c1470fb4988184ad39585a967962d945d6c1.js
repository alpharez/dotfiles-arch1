(function() {
  describe('Rust grammar', function() {
    var grammar;
    grammar = null;
    beforeEach(function() {
      waitsForPromise(function() {
        return atom.packages.activatePackage('language-rust');
      });
      return runs(function() {
        return grammar = atom.grammars.grammarForScopeName('source.rust');
      });
    });
    it('parses the grammar', function() {
      expect(grammar).toBeTruthy();
      return expect(grammar.scopeName).toBe('source.rust');
    });
    it('tokenizes block comments', function() {
      var tokens;
      tokens = grammar.tokenizeLines('text\ntext /* this is a\nblock comment */ text');
      expect(tokens[0][0]).toEqual({
        value: 'text',
        scopes: ['source.rust']
      });
      expect(tokens[1][0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[1][2]).toEqual({
        value: ' this is a',
        scopes: ['source.rust', 'comment.block.rust']
      });
      expect(tokens[2][0]).toEqual({
        value: 'block comment ',
        scopes: ['source.rust', 'comment.block.rust']
      });
      return expect(tokens[2][2]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes nested block comments', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text /* this is a /* nested */ block comment */ text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[2]).toEqual({
        value: ' this is a ',
        scopes: ['source.rust', 'comment.block.rust']
      });
      expect(tokens[4]).toEqual({
        value: ' nested ',
        scopes: ['source.rust', 'comment.block.rust', 'comment.block.rust']
      });
      expect(tokens[6]).toEqual({
        value: ' block comment ',
        scopes: ['source.rust', 'comment.block.rust']
      });
      return expect(tokens[8]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('does not tokenize strings or numbers in block comments', function() {
      var tokens;
      tokens = grammar.tokenizeLine('/* comment "string" 42 0x18 0b01011 u32 as i16 if impl */').tokens;
      return expect(tokens[1]).toEqual({
        value: ' comment "string" 42 0x18 0b01011 u32 as i16 if impl ',
        scopes: ['source.rust', 'comment.block.rust']
      });
    });
    it('tokenizes block doc comments', function() {
      var i, len, ref, results, src, tokens;
      ref = ['/** this is a\nblock doc comment */', '/*! this is a\nblock doc comment */'];
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        src = ref[i];
        tokens = grammar.tokenizeLines(src);
        expect(tokens[0][1]).toEqual({
          value: ' this is a',
          scopes: ['source.rust', 'comment.block.documentation.rust']
        });
        results.push(expect(tokens[1][0]).toEqual({
          value: 'block doc comment ',
          scopes: ['source.rust', 'comment.block.documentation.rust']
        }));
      }
      return results;
    });
    it('tokenizes line comments', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text // line comment').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      return expect(tokens[2]).toEqual({
        value: ' line comment',
        scopes: ['source.rust', 'comment.line.double-slash.rust']
      });
    });
    it('does not tokenize strings or numbers in line comments', function() {
      var tokens;
      tokens = grammar.tokenizeLine('// comment "string" 42 0x18 0b01011 u32 as i16 if impl').tokens;
      return expect(tokens[1]).toEqual({
        value: ' comment "string" 42 0x18 0b01011 u32 as i16 if impl',
        scopes: ['source.rust', 'comment.line.double-slash.rust']
      });
    });
    it('tokenizes line doc comments', function() {
      var i, len, ref, results, src, tokens;
      ref = ['/// line doc comment', '//! line doc comment'];
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        src = ref[i];
        tokens = grammar.tokenizeLine(src).tokens;
        results.push(expect(tokens[1]).toEqual({
          value: ' line doc comment',
          scopes: ['source.rust', 'comment.line.documentation.rust']
        }));
      }
      return results;
    });
    it('tokenizes attributes', function() {
      var tokens;
      tokens = grammar.tokenizeLine('#![main] text').tokens;
      expect(tokens[1]).toEqual({
        value: 'main',
        scopes: ['source.rust', 'meta.attribute.rust']
      });
      return expect(tokens[3]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes attributes with options', function() {
      var tokens;
      tokens = grammar.tokenizeLine('#![allow(great_algorithms)] text').tokens;
      expect(tokens[1]).toEqual({
        value: 'allow(great_algorithms)',
        scopes: ['source.rust', 'meta.attribute.rust']
      });
      return expect(tokens[3]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes attributes with negations', function() {
      var tokens;
      tokens = grammar.tokenizeLine('#![!resolve_unexported] text').tokens;
      expect(tokens[1]).toEqual({
        value: '!resolve_unexported',
        scopes: ['source.rust', 'meta.attribute.rust']
      });
      return expect(tokens[3]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes item attributes', function() {
      var tokens;
      tokens = grammar.tokenizeLine('#[deny(silly_comments)] text').tokens;
      expect(tokens[1]).toEqual({
        value: 'deny(silly_comments)',
        scopes: ['source.rust', 'meta.attribute.rust']
      });
      return expect(tokens[3]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes attributes with values', function() {
      var tokens;
      tokens = grammar.tokenizeLine('#[doc = "The docs"]').tokens;
      expect(tokens[1]).toEqual({
        value: 'doc = ',
        scopes: ['source.rust', 'meta.attribute.rust']
      });
      return expect(tokens[3]).toEqual({
        value: 'The docs',
        scopes: ['source.rust', 'meta.attribute.rust', 'string.quoted.double.rust']
      });
    });
    it('tokenizes attributes with special characters in values', function() {
      var tokens;
      tokens = grammar.tokenizeLine('#[doc = "This attribute contains ] an attribute ending character"]').tokens;
      expect(tokens[1]).toEqual({
        value: 'doc = ',
        scopes: ['source.rust', 'meta.attribute.rust']
      });
      return expect(tokens[3]).toEqual({
        value: 'This attribute contains ] an attribute ending character',
        scopes: ['source.rust', 'meta.attribute.rust', 'string.quoted.double.rust']
      });
    });
    it('tokenizes strings', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text "This is a string" text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[2]).toEqual({
        value: 'This is a string',
        scopes: ['source.rust', 'string.quoted.double.rust']
      });
      return expect(tokens[4]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes strings with escaped characters', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text "string\\nwith\\x20escaped\\"characters" text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[2]).toEqual({
        value: 'string',
        scopes: ['source.rust', 'string.quoted.double.rust']
      });
      expect(tokens[3]).toEqual({
        value: '\\n',
        scopes: ['source.rust', 'string.quoted.double.rust', 'constant.character.escape.rust']
      });
      expect(tokens[4]).toEqual({
        value: 'with',
        scopes: ['source.rust', 'string.quoted.double.rust']
      });
      expect(tokens[5]).toEqual({
        value: '\\x20',
        scopes: ['source.rust', 'string.quoted.double.rust', 'constant.character.escape.rust']
      });
      expect(tokens[6]).toEqual({
        value: 'escaped',
        scopes: ['source.rust', 'string.quoted.double.rust']
      });
      expect(tokens[7]).toEqual({
        value: '\\"',
        scopes: ['source.rust', 'string.quoted.double.rust', 'constant.character.escape.rust']
      });
      expect(tokens[8]).toEqual({
        value: 'characters',
        scopes: ['source.rust', 'string.quoted.double.rust']
      });
      return expect(tokens[10]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes strings with comments inside', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text "string with // comment /* inside" text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[2]).toEqual({
        value: 'string with // comment /* inside',
        scopes: ['source.rust', 'string.quoted.double.rust']
      });
      return expect(tokens[4]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes multiline strings', function() {
      var tokens;
      tokens = grammar.tokenizeLines('text "strings can\nspan multiple lines" text');
      expect(tokens[0][0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[0][2]).toEqual({
        value: 'strings can',
        scopes: ['source.rust', 'string.quoted.double.rust']
      });
      expect(tokens[1][0]).toEqual({
        value: 'span multiple lines',
        scopes: ['source.rust', 'string.quoted.double.rust']
      });
      return expect(tokens[1][2]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes raw strings', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text r"This is a raw string" text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[2]).toEqual({
        value: 'This is a raw string',
        scopes: ['source.rust', 'string.quoted.double.raw.rust']
      });
      return expect(tokens[4]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes raw strings with multiple surrounding characters', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text r##"This is a ##"# valid raw string"## text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[2]).toEqual({
        value: 'This is a ##"# valid raw string',
        scopes: ['source.rust', 'string.quoted.double.raw.rust']
      });
      return expect(tokens[4]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes byte strings', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text b"This is a bytestring" text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[2]).toEqual({
        value: 'This is a bytestring',
        scopes: ['source.rust', 'string.quoted.double.rust']
      });
      return expect(tokens[4]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes raw byte strings', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text br"This is a raw bytestring" text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[2]).toEqual({
        value: 'This is a raw bytestring',
        scopes: ['source.rust', 'string.quoted.double.raw.rust']
      });
      return expect(tokens[4]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes multiline raw strings', function() {
      var tokens;
      tokens = grammar.tokenizeLines('text r"Raw strings can\nspan multiple lines" text');
      expect(tokens[0][0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[0][2]).toEqual({
        value: 'Raw strings can',
        scopes: ['source.rust', 'string.quoted.double.raw.rust']
      });
      expect(tokens[1][0]).toEqual({
        value: 'span multiple lines',
        scopes: ['source.rust', 'string.quoted.double.raw.rust']
      });
      return expect(tokens[1][2]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes characters', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text \'c\' text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[1]).toEqual({
        value: '\'c\'',
        scopes: ['source.rust', 'string.quoted.single.rust']
      });
      return expect(tokens[2]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes escaped characters', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text \'\\n\' text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[1]).toEqual({
        value: '\'\\n\'',
        scopes: ['source.rust', 'string.quoted.single.rust']
      });
      return expect(tokens[2]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes bytes character', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text b\'b\' text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[1]).toEqual({
        value: 'b\'b\'',
        scopes: ['source.rust', 'string.quoted.single.rust']
      });
      return expect(tokens[2]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes escaped bytes characters', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text b\'\\x20\' text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[1]).toEqual({
        value: 'b\'\\x20\'',
        scopes: ['source.rust', 'string.quoted.single.rust']
      });
      return expect(tokens[2]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes decimal integers', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text 42 text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[1]).toEqual({
        value: '42',
        scopes: ['source.rust', 'constant.numeric.integer.decimal.rust']
      });
      return expect(tokens[2]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes hex integers', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text 0xf00b text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[1]).toEqual({
        value: '0xf00b',
        scopes: ['source.rust', 'constant.numeric.integer.hexadecimal.rust']
      });
      return expect(tokens[2]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes octal integers', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text 0o755 text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[1]).toEqual({
        value: '0o755',
        scopes: ['source.rust', 'constant.numeric.integer.octal.rust']
      });
      return expect(tokens[2]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes binary integers', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text 0b101010 text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[1]).toEqual({
        value: '0b101010',
        scopes: ['source.rust', 'constant.numeric.integer.binary.rust']
      });
      return expect(tokens[2]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes integers with type suffix', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text 42u8 text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[1]).toEqual({
        value: '42u8',
        scopes: ['source.rust', 'constant.numeric.integer.decimal.rust']
      });
      return expect(tokens[2]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes integers with underscores', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text 4_2 text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[1]).toEqual({
        value: '4_2',
        scopes: ['source.rust', 'constant.numeric.integer.decimal.rust']
      });
      return expect(tokens[2]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes integers with underscores and type suffix', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text 4_2_u8 text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[1]).toEqual({
        value: '4_2_u8',
        scopes: ['source.rust', 'constant.numeric.integer.decimal.rust']
      });
      return expect(tokens[2]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes floats', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text 42.1415 text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[1]).toEqual({
        value: '42.1415',
        scopes: ['source.rust', 'constant.numeric.float.rust']
      });
      return expect(tokens[2]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes floats with exponent', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text 42e18 text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[1]).toEqual({
        value: '42e18',
        scopes: ['source.rust', 'constant.numeric.float.rust']
      });
      return expect(tokens[2]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes floats with signed exponent', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text 42e+18 text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[1]).toEqual({
        value: '42e+18',
        scopes: ['source.rust', 'constant.numeric.float.rust']
      });
      return expect(tokens[2]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes floats with dot and exponent', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text 42.1415e18 text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[1]).toEqual({
        value: '42.1415e18',
        scopes: ['source.rust', 'constant.numeric.float.rust']
      });
      return expect(tokens[2]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes floats with dot and signed exponent', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text 42.1415e+18 text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[1]).toEqual({
        value: '42.1415e+18',
        scopes: ['source.rust', 'constant.numeric.float.rust']
      });
      return expect(tokens[2]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes floats with type suffix', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text 42.1415f32 text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[1]).toEqual({
        value: '42.1415f32',
        scopes: ['source.rust', 'constant.numeric.float.rust']
      });
      return expect(tokens[2]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes floats with underscores', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text 4_2.141_5 text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[1]).toEqual({
        value: '4_2.141_5',
        scopes: ['source.rust', 'constant.numeric.float.rust']
      });
      return expect(tokens[2]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes floats with underscores and type suffix', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text 4_2.141_5_f32 text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[1]).toEqual({
        value: '4_2.141_5_f32',
        scopes: ['source.rust', 'constant.numeric.float.rust']
      });
      return expect(tokens[2]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes boolean false', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text false text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[1]).toEqual({
        value: 'false',
        scopes: ['source.rust', 'constant.language.boolean.rust']
      });
      return expect(tokens[2]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes boolean true', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text true text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[1]).toEqual({
        value: 'true',
        scopes: ['source.rust', 'constant.language.boolean.rust']
      });
      return expect(tokens[2]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes control keywords', function() {
      var i, len, ref, results, t, tokens;
      ref = ['break', 'continue', 'else', 'if', 'in', 'for', 'loop', 'match', 'return', 'while'];
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        t = ref[i];
        tokens = grammar.tokenizeLine("text " + t + " text").tokens;
        expect(tokens[0]).toEqual({
          value: 'text ',
          scopes: ['source.rust']
        });
        expect(tokens[1]).toEqual({
          value: t,
          scopes: ['source.rust', 'keyword.control.rust']
        });
        results.push(expect(tokens[2]).toEqual({
          value: ' text',
          scopes: ['source.rust']
        }));
      }
      return results;
    });
    it('tokenizes keywords', function() {
      var i, len, ref, results, t, tokens;
      ref = ['crate', 'extern', 'mod', 'let', 'ref', 'use', 'super', 'move'];
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        t = ref[i];
        tokens = grammar.tokenizeLine("text " + t + " text").tokens;
        expect(tokens[0]).toEqual({
          value: 'text ',
          scopes: ['source.rust']
        });
        expect(tokens[1]).toEqual({
          value: t,
          scopes: ['source.rust', 'keyword.other.rust']
        });
        results.push(expect(tokens[2]).toEqual({
          value: ' text',
          scopes: ['source.rust']
        }));
      }
      return results;
    });
    it('tokenizes reserved keywords', function() {
      var i, len, ref, results, t, tokens;
      ref = ['abstract', 'alignof', 'become', 'do', 'final', 'macro', 'offsetof', 'override', 'priv', 'proc', 'pure', 'sizeof', 'typeof', 'virtual', 'yield'];
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        t = ref[i];
        tokens = grammar.tokenizeLine("text " + t + " text").tokens;
        expect(tokens[0]).toEqual({
          value: 'text ',
          scopes: ['source.rust']
        });
        expect(tokens[1]).toEqual({
          value: t,
          scopes: ['source.rust', 'invalid.deprecated.rust']
        });
        results.push(expect(tokens[2]).toEqual({
          value: ' text',
          scopes: ['source.rust']
        }));
      }
      return results;
    });
    it('tokenizes unsafe keyword', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text unsafe text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[1]).toEqual({
        value: 'unsafe',
        scopes: ['source.rust', 'keyword.other.unsafe.rust']
      });
      return expect(tokens[2]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes self keyword', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text self text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[1]).toEqual({
        value: 'self',
        scopes: ['source.rust', 'variable.language.rust']
      });
      return expect(tokens[2]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes sigils', function() {
      var tokens;
      tokens = grammar.tokenizeLine('*var &var').tokens;
      expect(tokens[0]).toEqual({
        value: '*',
        scopes: ['source.rust', 'keyword.operator.sigil.rust']
      });
      return expect(tokens[2]).toEqual({
        value: '&',
        scopes: ['source.rust', 'keyword.operator.sigil.rust']
      });
    });
    it('tokenizes core types', function() {
      var i, len, ref, results, t, tokens;
      ref = ['bool', 'char', 'usize', 'isize', 'u8', 'u16', 'u32', 'u64', 'i8', 'i16', 'i32', 'i64', 'f32', 'f64', 'str', 'Self', 'Option', 'Result'];
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        t = ref[i];
        tokens = grammar.tokenizeLine("text " + t + " text").tokens;
        expect(tokens[0]).toEqual({
          value: 'text ',
          scopes: ['source.rust']
        });
        expect(tokens[1]).toEqual({
          value: t,
          scopes: ['source.rust', 'storage.type.core.rust']
        });
        results.push(expect(tokens[2]).toEqual({
          value: ' text',
          scopes: ['source.rust']
        }));
      }
      return results;
    });
    it('tokenizes core variants', function() {
      var i, len, ref, results, t, tokens;
      ref = ['Some', 'None', 'Ok', 'Err'];
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        t = ref[i];
        tokens = grammar.tokenizeLine("text " + t + " text").tokens;
        expect(tokens[0]).toEqual({
          value: 'text ',
          scopes: ['source.rust']
        });
        expect(tokens[1]).toEqual({
          value: t,
          scopes: ['source.rust', 'support.constant.core.rust']
        });
        results.push(expect(tokens[2]).toEqual({
          value: ' text',
          scopes: ['source.rust']
        }));
      }
      return results;
    });
    it('tokenizes core trait markers', function() {
      var i, len, ref, results, t, tokens;
      ref = ['Copy', 'Send', 'Sized', 'Sync'];
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        t = ref[i];
        tokens = grammar.tokenizeLine("text " + t + " text").tokens;
        expect(tokens[0]).toEqual({
          value: 'text ',
          scopes: ['source.rust']
        });
        expect(tokens[1]).toEqual({
          value: t,
          scopes: ['source.rust', 'support.type.marker.rust']
        });
        results.push(expect(tokens[2]).toEqual({
          value: ' text',
          scopes: ['source.rust']
        }));
      }
      return results;
    });
    it('tokenizes core traits', function() {
      var i, len, ref, results, t, tokens;
      ref = ['Drop', 'Fn', 'FnMut', 'FnOnce', 'Clone', 'PartialEq', 'PartialOrd', 'Eq', 'Ord', 'AsRef', 'AsMut', 'Into', 'From', 'Default', 'Iterator', 'Extend', 'IntoIterator', 'DoubleEndedIterator', 'ExactSizeIterator'];
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        t = ref[i];
        tokens = grammar.tokenizeLine("text " + t + " text").tokens;
        expect(tokens[0]).toEqual({
          value: 'text ',
          scopes: ['source.rust']
        });
        expect(tokens[1]).toEqual({
          value: t,
          scopes: ['source.rust', 'support.type.core.rust']
        });
        results.push(expect(tokens[2]).toEqual({
          value: ' text',
          scopes: ['source.rust']
        }));
      }
      return results;
    });
    it('tokenizes std types', function() {
      var i, len, ref, results, t, tokens;
      ref = ['Box', 'String', 'Vec', 'Path', 'PathBuf'];
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        t = ref[i];
        tokens = grammar.tokenizeLine("text " + t + " text").tokens;
        expect(tokens[0]).toEqual({
          value: 'text ',
          scopes: ['source.rust']
        });
        expect(tokens[1]).toEqual({
          value: t,
          scopes: ['source.rust', 'storage.class.std.rust']
        });
        results.push(expect(tokens[2]).toEqual({
          value: ' text',
          scopes: ['source.rust']
        }));
      }
      return results;
    });
    it('tokenizes std traits', function() {
      var i, len, ref, results, t, tokens;
      ref = ['ToOwned', 'ToString'];
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        t = ref[i];
        tokens = grammar.tokenizeLine("text " + t + " text").tokens;
        expect(tokens[0]).toEqual({
          value: 'text ',
          scopes: ['source.rust']
        });
        expect(tokens[1]).toEqual({
          value: t,
          scopes: ['source.rust', 'support.type.std.rust']
        });
        results.push(expect(tokens[2]).toEqual({
          value: ' text',
          scopes: ['source.rust']
        }));
      }
      return results;
    });
    it('tokenizes imports', function() {
      var tokens;
      tokens = grammar.tokenizeLines('extern crate foo;\nuse std::slice;\nuse std::{num, str};\nuse self::foo::{bar, baz};');
      expect(tokens[0][0]).toEqual({
        value: 'extern',
        scopes: ['source.rust', 'keyword.other.rust']
      });
      expect(tokens[0][2]).toEqual({
        value: 'crate',
        scopes: ['source.rust', 'keyword.other.rust']
      });
      expect(tokens[1][0]).toEqual({
        value: 'use',
        scopes: ['source.rust', 'keyword.other.rust']
      });
      expect(tokens[1][2]).toEqual({
        value: '::',
        scopes: ['source.rust', 'keyword.operator.misc.rust']
      });
      expect(tokens[2][0]).toEqual({
        value: 'use',
        scopes: ['source.rust', 'keyword.other.rust']
      });
      expect(tokens[2][2]).toEqual({
        value: '::',
        scopes: ['source.rust', 'keyword.operator.misc.rust']
      });
      expect(tokens[3][0]).toEqual({
        value: 'use',
        scopes: ['source.rust', 'keyword.other.rust']
      });
      expect(tokens[3][2]).toEqual({
        value: 'self',
        scopes: ['source.rust', 'variable.language.rust']
      });
      expect(tokens[3][3]).toEqual({
        value: '::',
        scopes: ['source.rust', 'keyword.operator.misc.rust']
      });
      return expect(tokens[3][5]).toEqual({
        value: '::',
        scopes: ['source.rust', 'keyword.operator.misc.rust']
      });
    });
    it('tokenizes enums', function() {
      var tokens;
      tokens = grammar.tokenizeLines('pub enum MyEnum {\n    One,\n    Two\n}');
      expect(tokens[0][0]).toEqual({
        value: 'pub',
        scopes: ['source.rust', 'storage.modifier.visibility.rust']
      });
      expect(tokens[0][2]).toEqual({
        value: 'enum',
        scopes: ['source.rust', 'storage.type.rust']
      });
      return expect(tokens[0][4]).toEqual({
        value: 'MyEnum',
        scopes: ['source.rust', 'entity.name.type.rust']
      });
    });
    it('tokenizes structs', function() {
      var tokens;
      tokens = grammar.tokenizeLines('pub struct MyStruct<\'foo> {\n    pub one: u32,\n    two: Option<\'a, MyEnum>,\n    three: &\'foo i32,\n}');
      expect(tokens[0][0]).toEqual({
        value: 'pub',
        scopes: ['source.rust', 'storage.modifier.visibility.rust']
      });
      expect(tokens[0][2]).toEqual({
        value: 'struct',
        scopes: ['source.rust', 'storage.type.rust']
      });
      expect(tokens[0][4]).toEqual({
        value: 'MyStruct',
        scopes: ['source.rust', 'entity.name.type.rust']
      });
      expect(tokens[0][5]).toEqual({
        value: '<',
        scopes: ['source.rust', 'meta.type_params.rust']
      });
      expect(tokens[0][6]).toEqual({
        value: '\'',
        scopes: ['source.rust', 'meta.type_params.rust', 'storage.modifier.lifetime.rust']
      });
      expect(tokens[0][7]).toEqual({
        value: 'foo',
        scopes: ['source.rust', 'meta.type_params.rust', 'storage.modifier.lifetime.rust', 'entity.name.lifetime.rust']
      });
      expect(tokens[1][1]).toEqual({
        value: 'pub',
        scopes: ['source.rust', 'storage.modifier.visibility.rust']
      });
      expect(tokens[2][3]).toEqual({
        value: '\'',
        scopes: ['source.rust', 'storage.modifier.lifetime.rust']
      });
      expect(tokens[2][4]).toEqual({
        value: 'a',
        scopes: ['source.rust', 'storage.modifier.lifetime.rust', 'entity.name.lifetime.rust']
      });
      expect(tokens[3][2]).toEqual({
        value: '\'',
        scopes: ['source.rust', 'storage.modifier.lifetime.rust']
      });
      return expect(tokens[3][3]).toEqual({
        value: 'foo',
        scopes: ['source.rust', 'storage.modifier.lifetime.rust', 'entity.name.lifetime.rust']
      });
    });
    it('tokenizes tuple structs', function() {
      var tokens;
      tokens = grammar.tokenizeLine('pub struct MyTupleStruct(pub i32, u32);').tokens;
      expect(tokens[0]).toEqual({
        value: 'pub',
        scopes: ['source.rust', 'storage.modifier.visibility.rust']
      });
      expect(tokens[2]).toEqual({
        value: 'struct',
        scopes: ['source.rust', 'storage.type.rust']
      });
      expect(tokens[4]).toEqual({
        value: 'MyTupleStruct',
        scopes: ['source.rust', 'entity.name.type.rust']
      });
      return expect(tokens[6]).toEqual({
        value: 'pub',
        scopes: ['source.rust', 'storage.modifier.visibility.rust']
      });
    });
    it('tokenizes unions', function() {
      var tokens;
      tokens = grammar.tokenizeLines('pub union MyUnion<\'foo> {\n    pub one: u32,\n    two: Option<\'a, MyEnum>,\n    three: &\'foo i32,\n}');
      expect(tokens[0][0]).toEqual({
        value: 'pub',
        scopes: ['source.rust', 'storage.modifier.visibility.rust']
      });
      expect(tokens[0][2]).toEqual({
        value: 'union',
        scopes: ['source.rust', 'storage.type.rust']
      });
      expect(tokens[0][4]).toEqual({
        value: 'MyUnion',
        scopes: ['source.rust', 'entity.name.type.rust']
      });
      expect(tokens[0][5]).toEqual({
        value: '<',
        scopes: ['source.rust', 'meta.type_params.rust']
      });
      expect(tokens[0][6]).toEqual({
        value: '\'',
        scopes: ['source.rust', 'meta.type_params.rust', 'storage.modifier.lifetime.rust']
      });
      expect(tokens[0][7]).toEqual({
        value: 'foo',
        scopes: ['source.rust', 'meta.type_params.rust', 'storage.modifier.lifetime.rust', 'entity.name.lifetime.rust']
      });
      expect(tokens[1][1]).toEqual({
        value: 'pub',
        scopes: ['source.rust', 'storage.modifier.visibility.rust']
      });
      expect(tokens[2][3]).toEqual({
        value: '\'',
        scopes: ['source.rust', 'storage.modifier.lifetime.rust']
      });
      expect(tokens[2][4]).toEqual({
        value: 'a',
        scopes: ['source.rust', 'storage.modifier.lifetime.rust', 'entity.name.lifetime.rust']
      });
      expect(tokens[3][2]).toEqual({
        value: '\'',
        scopes: ['source.rust', 'storage.modifier.lifetime.rust']
      });
      return expect(tokens[3][3]).toEqual({
        value: 'foo',
        scopes: ['source.rust', 'storage.modifier.lifetime.rust', 'entity.name.lifetime.rust']
      });
    });
    it('tokenizes type aliases', function() {
      var tokens;
      tokens = grammar.tokenizeLine('type MyType = u32;').tokens;
      expect(tokens[0]).toEqual({
        value: 'type',
        scopes: ['source.rust', 'storage.type.rust']
      });
      expect(tokens[2]).toEqual({
        value: 'MyType',
        scopes: ['source.rust', 'entity.name.type.rust']
      });
      return expect(tokens[4]).toEqual({
        value: 'u32',
        scopes: ['source.rust', 'storage.type.core.rust']
      });
    });
    it('tokenizes constants', function() {
      var tokens;
      tokens = grammar.tokenizeLine('static MY_CONSTANT: &str = "hello";').tokens;
      expect(tokens[0]).toEqual({
        value: 'static',
        scopes: ['source.rust', 'storage.modifier.static.rust']
      });
      expect(tokens[2]).toEqual({
        value: '&',
        scopes: ['source.rust', 'keyword.operator.sigil.rust']
      });
      return expect(tokens[3]).toEqual({
        value: 'str',
        scopes: ['source.rust', 'storage.type.core.rust']
      });
    });
    it('tokenizes traits', function() {
      var tokens;
      tokens = grammar.tokenizeLines('pub trait MyTrait {\n    fn create_something (param: &str, mut other_param: u32) -> Option<Self>;\n    fn do_whatever<T: Send+Share+Whatever, U: Freeze> (param: &T, other_param: u32) -> Option<U>;\n    fn do_all_the_work (&mut self, param: &str, mut other_param: u32) -> bool;\n    fn do_even_more<\'a, T: Send+Whatever, U: Something<T>+Freeze> (&\'a mut self, param: &T) -> &\'a U;\n}');
      expect(tokens[0][0]).toEqual({
        value: 'pub',
        scopes: ['source.rust', 'storage.modifier.visibility.rust']
      });
      expect(tokens[0][2]).toEqual({
        value: 'trait',
        scopes: ['source.rust', 'storage.type.rust']
      });
      expect(tokens[0][4]).toEqual({
        value: 'MyTrait',
        scopes: ['source.rust', 'entity.name.type.rust']
      });
      expect(tokens[1][1]).toEqual({
        value: 'fn',
        scopes: ['source.rust', 'keyword.other.fn.rust']
      });
      expect(tokens[1][12]).toEqual({
        value: 'Option',
        scopes: ['source.rust', 'storage.type.core.rust']
      });
      expect(tokens[1][14]).toEqual({
        value: 'Self',
        scopes: ['source.rust', 'meta.type_params.rust', 'storage.type.core.rust']
      });
      expect(tokens[2][1]).toEqual({
        value: 'fn',
        scopes: ['source.rust', 'keyword.other.fn.rust']
      });
      expect(tokens[2][6]).toEqual({
        value: 'Send',
        scopes: ['source.rust', 'meta.type_params.rust', 'support.type.marker.rust']
      });
      expect(tokens[2][7]).toEqual({
        value: '+Share+Whatever, U: Freeze',
        scopes: ['source.rust', 'meta.type_params.rust']
      });
      expect(tokens[3][1]).toEqual({
        value: 'fn',
        scopes: ['source.rust', 'keyword.other.fn.rust']
      });
      expect(tokens[4][1]).toEqual({
        value: 'fn',
        scopes: ['source.rust', 'keyword.other.fn.rust']
      });
      expect(tokens[4][5]).toEqual({
        value: '\'',
        scopes: ['source.rust', 'meta.type_params.rust', 'storage.modifier.lifetime.rust']
      });
      expect(tokens[4][6]).toEqual({
        value: 'a',
        scopes: ['source.rust', 'meta.type_params.rust', 'storage.modifier.lifetime.rust', 'entity.name.lifetime.rust']
      });
      return expect(tokens[4][11]).toEqual({
        value: 'T',
        scopes: ['source.rust', 'meta.type_params.rust', 'meta.type_params.rust']
      });
    });
    it('tokenizes impls', function() {
      var tokens;
      tokens = grammar.tokenizeLines('impl MyTrait {\n    fn do_something () { unimplemented!() }\n}');
      expect(tokens[0][0]).toEqual({
        value: 'impl',
        scopes: ['source.rust', 'storage.type.rust']
      });
      return expect(tokens[0][2]).toEqual({
        value: 'MyTrait',
        scopes: ['source.rust', 'entity.name.type.rust']
      });
    });
    it('tokenizes trait impls', function() {
      var tokens;
      tokens = grammar.tokenizeLines('impl MyTrait for MyStruct {\n    fn create_something (param: &str, mut other_param: u32) -> Option<Self> { unimplemented!() }\n    fn do_whatever<T: Send+Share+Whatever, U: Freeze> (param: &T, other_param: u32) -> Option<U> { unimplemented!() }\n    fn do_all_the_work (&mut self, param: &str, mut other_param: u32) -> bool { unimplemented!() }\n    fn do_even_more<\'a, T: Send+Whatever, U: Something<T>+Freeze> (&\'a mut self, param: &T) -> &\'a U { unimplemented!() }\n}');
      expect(tokens[0][0]).toEqual({
        value: 'impl',
        scopes: ['source.rust', 'storage.type.rust']
      });
      expect(tokens[0][2]).toEqual({
        value: 'MyTrait',
        scopes: ['source.rust', 'entity.name.type.rust']
      });
      expect(tokens[0][4]).toEqual({
        value: 'for',
        scopes: ['source.rust', 'storage.type.rust']
      });
      expect(tokens[0][6]).toEqual({
        value: 'MyStruct',
        scopes: ['source.rust', 'entity.name.type.rust']
      });
      expect(tokens[1][1]).toEqual({
        value: 'fn',
        scopes: ['source.rust', 'keyword.other.fn.rust']
      });
      expect(tokens[1][12]).toEqual({
        value: 'Option',
        scopes: ['source.rust', 'storage.type.core.rust']
      });
      expect(tokens[1][14]).toEqual({
        value: 'Self',
        scopes: ['source.rust', 'meta.type_params.rust', 'storage.type.core.rust']
      });
      expect(tokens[2][1]).toEqual({
        value: 'fn',
        scopes: ['source.rust', 'keyword.other.fn.rust']
      });
      expect(tokens[2][6]).toEqual({
        value: 'Send',
        scopes: ['source.rust', 'meta.type_params.rust', 'support.type.marker.rust']
      });
      expect(tokens[2][7]).toEqual({
        value: '+Share+Whatever, U: Freeze',
        scopes: ['source.rust', 'meta.type_params.rust']
      });
      expect(tokens[3][1]).toEqual({
        value: 'fn',
        scopes: ['source.rust', 'keyword.other.fn.rust']
      });
      expect(tokens[4][1]).toEqual({
        value: 'fn',
        scopes: ['source.rust', 'keyword.other.fn.rust']
      });
      expect(tokens[4][5]).toEqual({
        value: '\'',
        scopes: ['source.rust', 'meta.type_params.rust', 'storage.modifier.lifetime.rust']
      });
      expect(tokens[4][6]).toEqual({
        value: 'a',
        scopes: ['source.rust', 'meta.type_params.rust', 'storage.modifier.lifetime.rust', 'entity.name.lifetime.rust']
      });
      return expect(tokens[4][11]).toEqual({
        value: 'T',
        scopes: ['source.rust', 'meta.type_params.rust', 'meta.type_params.rust']
      });
    });
    it('tokenizes generics and lifetimes in enums');
    it('tokenizes generics and lifetimes in structs');
    it('tokenizes generics and lifetimes in impls');
    it('tokenizes generics and lifetimes in functions');
    it('tokenizes function defintions');
    it('tokenizes function calls');
    it('tokenizes closures');
    it('tokenizes loop expression labels (issue \\#2)', function() {
      var tokens;
      tokens = grammar.tokenizeLines('infinity: loop {\n    do_serious_stuff();\n    use_a_letter(\'Z\');\n    break \'infinity;\n}');
      expect(tokens[0][0]).toEqual({
        value: 'infinity: ',
        scopes: ['source.rust']
      });
      expect(tokens[2][3]).toEqual({
        value: '\'Z\'',
        scopes: ['source.rust', 'string.quoted.single.rust']
      });
      expect(tokens[3][3]).toEqual({
        value: '\'',
        scopes: ['source.rust', 'storage.modifier.lifetime.rust']
      });
      return expect(tokens[3][4]).toEqual({
        value: 'infinity',
        scopes: ['source.rust', 'storage.modifier.lifetime.rust', 'entity.name.lifetime.rust']
      });
    });
    it('tokenizes isize/usize type suffixes (issue \\#22)', function() {
      var i, len, ref, results, t, tokens;
      ref = ['isize', 'usize'];
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        t = ref[i];
        tokens = grammar.tokenizeLine("let x = 123" + t + ";").tokens;
        results.push(expect(tokens[4]).toEqual({
          value: "123" + t,
          scopes: ['source.rust', 'constant.numeric.integer.decimal.rust']
        }));
      }
      return results;
    });
    it('tokenizes float literals without +/- after E (issue \\#30)', function() {
      var tokens;
      tokens = grammar.tokenizeLine('let x = 1.2345e6;').tokens;
      return expect(tokens[4]).toEqual({
        value: '1.2345e6',
        scopes: ['source.rust', 'constant.numeric.float.rust']
      });
    });
    it('tokenizes nested generics (issue \\#33, \\#37)', function() {
      var ref, tokens;
      return ref = grammar.tokenizeLine('let x: Vec<Vec<u8>> = Vec::new();'), tokens = ref.tokens, ref;
    });
    it('tokenizes == properly (issue \\#40)', function() {
      var tokens;
      tokens = grammar.tokenizeLines('struct Foo { x: i32 }\nif x == 1 { }');
      return expect(tokens[1][2]).toEqual({
        value: '==',
        scopes: ['source.rust', 'keyword.operator.comparison.rust']
      });
    });
    it('tokenizes const function parameters (issue \\#52)', function() {
      var tokens;
      tokens = grammar.tokenizeLines('fn foo(bar: *const i32) {\n  let _ = 1234 as *const u32;\n}');
      expect(tokens[0][4]).toEqual({
        value: '*',
        scopes: ['source.rust', 'keyword.operator.sigil.rust']
      });
      expect(tokens[0][5]).toEqual({
        value: 'const',
        scopes: ['source.rust', 'storage.modifier.const.rust']
      });
      expect(tokens[1][9]).toEqual({
        value: '*',
        scopes: ['source.rust', 'keyword.operator.sigil.rust']
      });
      return expect(tokens[1][10]).toEqual({
        value: 'const',
        scopes: ['source.rust', 'storage.modifier.const.rust']
      });
    });
    it('tokenizes keywords and known types in wrapper structs (issue \\#56)', function() {
      var tokens;
      tokens = grammar.tokenizeLine('pub struct Foobar(pub Option<bool>);').tokens;
      expect(tokens[6]).toEqual({
        value: 'pub',
        scopes: ['source.rust', 'storage.modifier.visibility.rust']
      });
      expect(tokens[8]).toEqual({
        value: 'Option',
        scopes: ['source.rust', 'storage.type.core.rust']
      });
      return expect(tokens[10]).toEqual({
        value: 'bool',
        scopes: ['source.rust', 'storage.type.core.rust']
      });
    });
    it('tokenizes lifetimes in associated type definitions (issue \\#55)', function() {
      var tokens;
      tokens = grammar.tokenizeLines('trait Foo {\n  type B: A + \'static;\n}');
      expect(tokens[1][5]).toEqual({
        value: '\'',
        scopes: ['source.rust', 'storage.modifier.lifetime.rust']
      });
      return expect(tokens[1][6]).toEqual({
        value: 'static',
        scopes: ['source.rust', 'storage.modifier.lifetime.rust', 'entity.name.lifetime.rust']
      });
    });
    it('tokenizes unsafe keywords in function arguments (issue \\#73)', function() {
      var tokens;
      tokens = grammar.tokenizeLines('unsafe fn foo();\nfn foo(f: unsafe fn());');
      expect(tokens[0][0]).toEqual({
        value: 'unsafe',
        scopes: ['source.rust', 'keyword.other.unsafe.rust']
      });
      return expect(tokens[1][4]).toEqual({
        value: 'unsafe',
        scopes: ['source.rust', 'keyword.other.unsafe.rust']
      });
    });
    it('tokenizes where clauses (issue \\#57)', function() {
      var tokens;
      tokens = grammar.tokenizeLines('impl Foo<A, B> where text { }\nimpl Foo<A, B> for C where text { }\nimpl Foo<A, B> for C {\n    fn foo<A, B> -> C where text { }\n}\nfn foo<A, B> -> C where text { }\nstruct Foo<A, B> where text { }\ntrait Foo<A, B> : C where { }');
      expect(tokens[0][7]).toEqual({
        value: 'where',
        scopes: ['source.rust', 'keyword.other.where.rust']
      });
      expect(tokens[1][11]).toEqual({
        value: 'where',
        scopes: ['source.rust', 'keyword.other.where.rust']
      });
      expect(tokens[3][8]).toEqual({
        value: 'where',
        scopes: ['source.rust', 'keyword.other.where.rust']
      });
      expect(tokens[5][7]).toEqual({
        value: 'where',
        scopes: ['source.rust', 'keyword.other.where.rust']
      });
      expect(tokens[6][7]).toEqual({
        value: 'where',
        scopes: ['source.rust', 'keyword.other.where.rust']
      });
      return expect(tokens[7][7]).toEqual({
        value: 'where',
        scopes: ['source.rust', 'keyword.other.where.rust']
      });
    });
    it('tokenizes comments in attributes (issue \\#95)', function() {
      var tokens;
      tokens = grammar.tokenizeLines('#[\n/* block comment */\n// line comment\nderive(Debug)]\nstruct D { }');
      expect(tokens[0][0]).toEqual({
        value: '#[',
        scopes: ['source.rust', 'meta.attribute.rust']
      });
      expect(tokens[1][1]).toEqual({
        value: ' block comment ',
        scopes: ['source.rust', 'meta.attribute.rust', 'comment.block.rust']
      });
      expect(tokens[2][1]).toEqual({
        value: ' line comment',
        scopes: ['source.rust', 'meta.attribute.rust', 'comment.line.double-slash.rust']
      });
      expect(tokens[3][0]).toEqual({
        value: 'derive(Debug)',
        scopes: ['source.rust', 'meta.attribute.rust']
      });
      return expect(tokens[4][0]).toEqual({
        value: 'struct',
        scopes: ['source.rust', 'storage.type.rust']
      });
    });
    it('does not tokenize `fn` in argument name as a keyword incorrectly (issue \\#99)', function() {
      var tokens;
      tokens = grammar.tokenizeLine('fn foo(fn_x: ()) {}').tokens;
      expect(tokens[0]).toEqual({
        value: 'fn',
        scopes: ['source.rust', 'keyword.other.fn.rust']
      });
      expect(tokens[1]).toEqual({
        value: ' ',
        scopes: ['source.rust']
      });
      expect(tokens[2]).toEqual({
        value: 'foo',
        scopes: ['source.rust', 'entity.name.function.rust']
      });
      return expect(tokens[3]).toEqual({
        value: '(fn_x: ()) ',
        scopes: ['source.rust']
      });
    });
    it('tokenizes function calls with type arguments (issue \\#98)', function() {
      var tokens;
      tokens = grammar.tokenizeLines('fn main() {\nfoo::bar::<i32, ()>();\n_func::<i32, ()>();\n}');
      expect(tokens[1][0]).toEqual({
        value: 'foo',
        scopes: ['source.rust']
      });
      expect(tokens[1][1]).toEqual({
        value: '::',
        scopes: ['source.rust', 'keyword.operator.misc.rust']
      });
      expect(tokens[1][2]).toEqual({
        value: 'bar',
        scopes: ['source.rust', 'entity.name.function.rust']
      });
      expect(tokens[1][3]).toEqual({
        value: '::',
        scopes: ['source.rust', 'keyword.operator.misc.rust']
      });
      expect(tokens[1][4]).toEqual({
        value: '<',
        scopes: ['source.rust', 'meta.type_params.rust']
      });
      expect(tokens[1][5]).toEqual({
        value: 'i32',
        scopes: ['source.rust', 'meta.type_params.rust', 'storage.type.core.rust']
      });
      expect(tokens[1][6]).toEqual({
        value: ', ()',
        scopes: ['source.rust', 'meta.type_params.rust']
      });
      expect(tokens[1][7]).toEqual({
        value: '>',
        scopes: ['source.rust', 'meta.type_params.rust']
      });
      expect(tokens[1][8]).toEqual({
        value: '(',
        scopes: ['source.rust']
      });
      expect(tokens[1][9]).toEqual({
        value: ');',
        scopes: ['source.rust']
      });
      expect(tokens[2][0]).toEqual({
        value: '_func',
        scopes: ['source.rust', 'entity.name.function.rust']
      });
      expect(tokens[2][1]).toEqual({
        value: '::',
        scopes: ['source.rust', 'keyword.operator.misc.rust']
      });
      expect(tokens[2][2]).toEqual({
        value: '<',
        scopes: ['source.rust', 'meta.type_params.rust']
      });
      expect(tokens[2][3]).toEqual({
        value: 'i32',
        scopes: ['source.rust', 'meta.type_params.rust', 'storage.type.core.rust']
      });
      expect(tokens[2][4]).toEqual({
        value: ', ()',
        scopes: ['source.rust', 'meta.type_params.rust']
      });
      expect(tokens[2][5]).toEqual({
        value: '>',
        scopes: ['source.rust', 'meta.type_params.rust']
      });
      expect(tokens[2][6]).toEqual({
        value: '(',
        scopes: ['source.rust']
      });
      return expect(tokens[2][7]).toEqual({
        value: ');',
        scopes: ['source.rust']
      });
    });
    it('tokenizes function calls without type arguments (issue \\#98)', function() {
      var tokens;
      tokens = grammar.tokenizeLines('fn main() {\nfoo.call();\n}');
      expect(tokens[1][0]).toEqual({
        value: 'foo.',
        scopes: ['source.rust']
      });
      expect(tokens[1][1]).toEqual({
        value: 'call',
        scopes: ['source.rust', 'entity.name.function.rust']
      });
      expect(tokens[1][2]).toEqual({
        value: '(',
        scopes: ['source.rust']
      });
      return expect(tokens[1][3]).toEqual({
        value: ');',
        scopes: ['source.rust']
      });
    });
    it('tokenizes function names correctly (issue \\#98)', function() {
      var tokens;
      tokens = grammar.tokenizeLines('fn main() {\na();\na1();\na_();\na_1();\na1_();\n_a();\n_0();\n_a0();\n_0a();\n__();\n}');
      expect(tokens[1][0]).toEqual({
        value: 'a',
        scopes: ['source.rust', 'entity.name.function.rust']
      });
      expect(tokens[2][0]).toEqual({
        value: 'a1',
        scopes: ['source.rust', 'entity.name.function.rust']
      });
      expect(tokens[3][0]).toEqual({
        value: 'a_',
        scopes: ['source.rust', 'entity.name.function.rust']
      });
      expect(tokens[4][0]).toEqual({
        value: 'a_1',
        scopes: ['source.rust', 'entity.name.function.rust']
      });
      expect(tokens[5][0]).toEqual({
        value: 'a1_',
        scopes: ['source.rust', 'entity.name.function.rust']
      });
      expect(tokens[6][0]).toEqual({
        value: '_a',
        scopes: ['source.rust', 'entity.name.function.rust']
      });
      expect(tokens[7][0]).toEqual({
        value: '_0',
        scopes: ['source.rust', 'entity.name.function.rust']
      });
      expect(tokens[8][0]).toEqual({
        value: '_a0',
        scopes: ['source.rust', 'entity.name.function.rust']
      });
      expect(tokens[9][0]).toEqual({
        value: '_0a',
        scopes: ['source.rust', 'entity.name.function.rust']
      });
      return expect(tokens[10][0]).toEqual({
        value: '__',
        scopes: ['source.rust', 'entity.name.function.rust']
      });
    });
    it('tokenizes `as` as an operator (issue \\#110)', function() {
      var tokens;
      tokens = grammar.tokenizeLine('let i = 10 as f32;').tokens;
      expect(tokens[0]).toEqual({
        value: 'let',
        scopes: ['source.rust', 'keyword.other.rust']
      });
      expect(tokens[2]).toEqual({
        value: '=',
        scopes: ['source.rust', 'keyword.operator.assignment.rust']
      });
      expect(tokens[4]).toEqual({
        value: '10',
        scopes: ['source.rust', 'constant.numeric.integer.decimal.rust']
      });
      expect(tokens[6]).toEqual({
        value: 'as',
        scopes: ['source.rust', 'keyword.operator.misc.rust']
      });
      return expect(tokens[8]).toEqual({
        value: 'f32',
        scopes: ['source.rust', 'storage.type.core.rust']
      });
    });
    it('tokenizes a reserved keyword as deprecated (issue \\#94)', function() {
      var tokens;
      tokens = grammar.tokenizeLine('let priv = 10;').tokens;
      expect(tokens[0]).toEqual({
        value: 'let',
        scopes: ['source.rust', 'keyword.other.rust']
      });
      expect(tokens[2]).toEqual({
        value: 'priv',
        scopes: ['source.rust', 'invalid.deprecated.rust']
      });
      expect(tokens[4]).toEqual({
        value: '=',
        scopes: ['source.rust', 'keyword.operator.assignment.rust']
      });
      return expect(tokens[6]).toEqual({
        value: '10',
        scopes: ['source.rust', 'constant.numeric.integer.decimal.rust']
      });
    });
    return it('tokenizes types in `impl` statements correctly (issue \\#7)', function() {
      var tokens;
      tokens = grammar.tokenizeLines('struct MyObject<\'a> {\n    mystr: &\'a str\n}\nimpl<\'a> MyObject<\'a> {\n    fn print(&self) {}\n}\nimpl<\'a> Clone for MyObject<\'a> {\n    fn clone(&self) {}\n}');
      expect(tokens[0][2]).toEqual({
        value: 'MyObject',
        scopes: ['source.rust', 'entity.name.type.rust']
      });
      expect(tokens[3][6]).toEqual({
        value: 'MyObject',
        scopes: ['source.rust', 'entity.name.type.rust']
      });
      expect(tokens[6][6]).toEqual({
        value: 'Clone',
        scopes: ['source.rust', 'support.type.core.rust']
      });
      return expect(tokens[6][10]).toEqual({
        value: 'MyObject',
        scopes: ['source.rust', 'entity.name.type.rust']
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvc3RldmUvLmF0b20vcGFja2FnZXMvbGFuZ3VhZ2UtcnVzdC9zcGVjL3J1c3Qtc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQSxRQUFBLENBQVMsY0FBVCxFQUF5QixTQUFBO0FBQ3ZCLFFBQUE7SUFBQSxPQUFBLEdBQVU7SUFFVixVQUFBLENBQVcsU0FBQTtNQUNULGVBQUEsQ0FBZ0IsU0FBQTtlQUNkLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixlQUE5QjtNQURjLENBQWhCO2FBRUEsSUFBQSxDQUFLLFNBQUE7ZUFDSCxPQUFBLEdBQVUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxtQkFBZCxDQUFrQyxhQUFsQztNQURQLENBQUw7SUFIUyxDQUFYO0lBTUEsRUFBQSxDQUFHLG9CQUFILEVBQXlCLFNBQUE7TUFDdkIsTUFBQSxDQUFPLE9BQVAsQ0FBZSxDQUFDLFVBQWhCLENBQUE7YUFDQSxNQUFBLENBQU8sT0FBTyxDQUFDLFNBQWYsQ0FBeUIsQ0FBQyxJQUExQixDQUErQixhQUEvQjtJQUZ1QixDQUF6QjtJQVFBLEVBQUEsQ0FBRywwQkFBSCxFQUErQixTQUFBO0FBQzdCLFVBQUE7TUFBQSxNQUFBLEdBQVMsT0FBTyxDQUFDLGFBQVIsQ0FBc0IsZ0RBQXRCO01BQ1QsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQUcsQ0FBQSxDQUFBLENBQWpCLENBQW9CLENBQUMsT0FBckIsQ0FBNkI7UUFBQSxLQUFBLEVBQU8sTUFBUDtRQUFlLE1BQUEsRUFBUSxDQUFDLGFBQUQsQ0FBdkI7T0FBN0I7TUFDQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsQ0FBakIsQ0FBb0IsQ0FBQyxPQUFyQixDQUE2QjtRQUFBLEtBQUEsRUFBTyxPQUFQO1FBQWdCLE1BQUEsRUFBUSxDQUFDLGFBQUQsQ0FBeEI7T0FBN0I7TUFDQSxNQUFBLENBQU8sTUFB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QXJCLENBQTZCO1FBQUEsS0FBQSxFQUFPLEdBQVA7UUFBWSxNQUFBLEVBQVEsQ0FBQyxhQUFELEVBQWdCLDJCQUFoQixDQUFwQjtPQUE3QjtNQUNBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUFqQixDQUFvQixDQUFDLE9BQXJCLENBQTZCO1FBQUEsS0FBQSxFQUFPLElBQVA7UUFBYSxNQUFBLEVBQVEsQ0FBQyxhQUFELEVBQWdCLDJCQUFoQixDQUFyQjtPQUE3QjtNQUNBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUFqQixDQUFvQixDQUFDLE9BQXJCLENBQTZCO1FBQUEsS0FBQSxFQUFPLElBQVA7UUFBYSxNQUFBLEVBQVEsQ0FBQyxhQUFELEVBQWdCLDJCQUFoQixDQUFyQjtPQUE3QjtNQUNBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUFqQixDQUFvQixDQUFDLE9BQXJCLENBQTZCO1FBQUEsS0FBQSxFQUFPLEtBQVA7UUFBYyxNQUFBLEVBQVEsQ0FBQyxhQUFELEVBQWdCLDJCQUFoQixDQUF0QjtPQUE3QjtNQUNBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUFqQixDQUFvQixDQUFDLE9BQXJCLENBQTZCO1FBQUEsS0FBQSxFQUFPLEtBQVA7UUFBYyxNQUFBLEVBQVEsQ0FBQyxhQUFELEVBQWdCLDJCQUFoQixDQUF0QjtPQUE3QjtNQUNBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUFqQixDQUFvQixDQUFDLE9BQXJCLENBQTZCO1FBQUEsS0FBQSxFQUFPLElBQVA7UUFBYSxNQUFBLEVBQVEsQ0FBQyxhQUFELEVBQWdCLDJCQUFoQixDQUFyQjtPQUE3QjtNQUNBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUFqQixDQUFvQixDQUFDLE9BQXJCLENBQTZCO1FBQUEsS0FBQSxFQUFPLElBQVA7UUFBYSxN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QWhCLENBQXJCO09BQTFCO0lBTDZELENBQS9EO1dBT0EsRUFBQSxDQUFHLDZEQUFILEVBQWtFLFNBQUE7QUFDaEUsVUFBQTtNQUFBLE1BQUEsR0FBUyxPQUFPLENBQUMsYUFBUixDQUFzQixzS0FBdEI7TUFXVCxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsQ0FBakIsQ0FBb0IsQ0FBQyxPQUFyQixDQUE2QjtRQUFBLEtBQUEsRUFBTyxVQUFQO1FBQW1CLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0IsdUJBQWhCLENBQTNCO09BQTdCO01BQ0EsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQUcsQ0FBQSxDQUFBLENBQWpCLENBQW9CLENBQUMsT0FBckIsQ0FBNkI7UUFBQSxLQUFBLEVBQU8sVUFBUDtRQUFtQixNQUFBLEVBQVEsQ0FBQyxhQUFELEVBQWdCLHVCQUFoQixDQUEzQjtPQUE3QjtNQUNBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUFqQixDQUFvQixDQUFDLE9BQXJCLENBQTZCO1FBQUEsS0FBQSxFQUFPLE9BQVA7UUFBZ0IsTUFBQSxFQUFRLENBQUMsYUFBRCxFQUFnQix3QkFBaEIsQ0FBeEI7T0FBN0I7YUFDQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBRyxDQUFBLEVBQUEsQ0FBakIsQ0FBcUIsQ0FBQyxPQUF0QixDQUE4QjtRQUFBLEtBQUEsRUFBTyxVQUFQO1FBQW1CLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0IsdUJBQWhCLENBQTNCO09BQTlCO0lBZmdFLENBQWxFO0VBdHVCdUIsQ0FBekI7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImRlc2NyaWJlICdSdXN0IGdyYW1tYXInLCAtPlxuICBncmFtbWFyID0gbnVsbFxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdsYW5ndWFnZS1ydXN0JylcbiAgICBydW5zIC0+XG4gICAgICBncmFtbWFyID0gYXRvbS5ncmFtbWFycy5ncmFtbWFyRm9yU2NvcGVOYW1lKCdzb3VyY2UucnVzdCcpXG5cbiAgaXQgJ3BhcnNlcyB0aGUgZ3JhbW1hcicsIC0+XG4gICAgZXhwZWN0KGdyYW1tYXIpLnRvQmVUcnV0aHkoKVxuICAgIGV4cGVjdChncmFtbWFyLnNjb3BlTmFtZSkudG9CZSAnc291cmNlLnJ1c3QnXG5cbiAgI1xuICAjIENvbW1lbnRzXG4gICNcblxuICBpdCAndG9rZW5pemVzIGJsb2NrIGNvbW1lbnRzJywgLT5cbiAgICB0b2tlbnMgPSBncmFtbWFyLnRva2VuaXplTGluZXMoJ3RleHRcXG50ZXh0IC8qIHRoaXMgaXMgYVxcbmJsb2NrIGNvbW1lbnQgKi8gdGV4dCcpXG4gICAgZXhwZWN0KHRva2Vuc1swXVswXSkudG9FcXVhbCB2YWx1ZTogJ3RleHQnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbMV1bMF0pLnRvRXF1YWwgdmFsdWU6ICd0ZXh0ICcsIHNjb3BlczogWydzb3VyY2UucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1sxXVsyXSkudG9FcXVhbCB2YWx1ZTogJyB0aGlzIGlzIGEnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnY29tbWVudC5ibG9jay5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzJdWzBdKS50b0VxdWFsIHZhbHVlOiAnYmxvY2sgY29tbWVudCAnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnY29tbWVudC5ibG9jay5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzJdWzJdKS50b0VxdWFsIHZhbHVlOiAnIHRleHQnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnXVxuXG4gIGl0ICd0b2tlbml6ZXMgbmVzdGVkIGJsb2NrIGNvbW1lbnRzJywgLT5cbiAgICB7dG9rZW5zfSA9IGdyYW1tYXIudG9rZW5pemVMaW5lKCd0ZXh0IC8qIHRoaXMgaXMgYSAvKiBuZXN0ZWQgKi8gYmxvY2sgY29tbWVudCAqLyB0ZXh0JylcbiAgICBleHBlY3QodG9rZW5zWzBdKS50b0VxdWFsIHZhbHVlOiAndGV4dCAnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbMl0pLnRvRXF1YWwgdmFsdWU6ICcgdGhpcyBpcyBhICcsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdjb21tZW50LmJsb2NrLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbNF0pLnRvRXF1YWwgdmFsdWU6ICcgbmVzdGVkICcsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdjb21tZW50LmJsb2NrLnJ1c3QnLCAnY29tbWVudC5ibG9jay5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzZdKS50b0VxdWFsIHZhbHVlOiAnIGJsb2NrIGNvbW1lbnQgJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ2NvbW1lbnQuYmxvY2sucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1s4XSkudG9FcXVhbCB2YWx1ZTogJyB0ZXh0Jywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0J11cblxuICBpdCAnZG9lcyBub3QgdG9rZW5pemUgc3RyaW5ncyBvciBudW1iZXJzIGluIGJsb2NrIGNvbW1lbnRzJywgLT5cbiAgICB7dG9rZW5zfSA9IGdyYW1tYXIudG9rZW5pemVMaW5lKCcvKiBjb21tZW50IFwic3RyaW5nXCIgNDIgMHgxOCAwYjAxMDExIHUzMiBhcyBpMTYgaWYgaW1wbCAqLycpXG4gICAgZXhwZWN0KHRva2Vuc1sxXSkudG9FcXVhbCB2YWx1ZTogJyBjb21tZW50IFwic3RyaW5nXCIgNDIgMHgxOCAwYjAxMDExIHUzMiBhcyBpMTYgaWYgaW1wbCAnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnY29tbWVudC5ibG9jay5ydXN0J11cblxuICBpdCAndG9rZW5pemVzIGJsb2NrIGRvYyBjb21tZW50cycsIC0+XG4gICAgZm9yIHNyYyBpbiBbJy8qKiB0aGlzIGlzIGFcXG5ibG9jayBkb2MgY29tbWVudCAqLycsICcvKiEgdGhpcyBpcyBhXFxuYmxvY2sgZG9jIGNvbW1lbnQgKi8nXVxuICAgICAgdG9rZW5zID0gZ3JhbW1hci50b2tlbml6ZUxpbmVzKHNyYylcbiAgICAgIGV4cGVjdCh0b2tlbnNbMF1bMV0pLnRvRXF1YWwgdmFsdWU6ICcgdGhpcyBpcyBhJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ2NvbW1lbnQuYmxvY2suZG9jdW1lbnRhdGlvbi5ydXN0J11cbiAgICAgIGV4cGVjdCh0b2tlbnNbMV1bMF0pLnRvRXF1YWwgdmFsdWU6ICdibG9jayBkb2MgY29tbWVudCAnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnY29tbWVudC5ibG9jay5kb2N1bWVudGF0aW9uLnJ1c3QnXVxuXG4gIGl0ICd0b2tlbml6ZXMgbGluZSBjb21tZW50cycsIC0+XG4gICAge3Rva2Vuc30gPSBncmFtbWFyLnRva2VuaXplTGluZSgndGV4dCAvLyBsaW5lIGNvbW1lbnQnKVxuICAgIGV4cGVjdCh0b2tlbnNbMF0pLnRvRXF1YWwgdmFsdWU6ICd0ZXh0ICcsIHNjb3BlczogWydzb3VyY2UucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1syXSkudG9FcXVhbCB2YWx1ZTogJyBsaW5lIGNvbW1lbnQnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnY29tbWVudC5saW5lLmRvdWJsZS1zbGFzaC5ydXN0J11cblxuICBpdCAnZG9lcyBub3QgdG9rZW5pemUgc3RyaW5ncyBvciBudW1iZXJzIGluIGxpbmUgY29tbWVudHMnLCAtPlxuICAgIHt0b2tlbnN9ID0gZ3JhbW1hci50b2tlbml6ZUxpbmUoJy8vIGNvbW1lbnQgXCJzdHJpbmdcIiA0MiAweDE4IDBiMDEwMTEgdTMyIGFzIGkxNiBpZiBpbXBsJylcbiAgICBleHBlY3QodG9rZW5zWzFdKS50b0VxdWFsIHZhbHVlOiAnIGNvbW1lbnQgXCJzdHJpbmdcIiA0MiAweDE4IDBiMDEwMTEgdTMyIGFzIGkxNiBpZiBpbXBsJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ2NvbW1lbnQubGluZS5kb3VibGUtc2xhc2gucnVzdCddXG5cbiAgaXQgJ3Rva2VuaXplcyBsaW5lIGRvYyBjb21tZW50cycsIC0+XG4gICAgZm9yIHNyYyBpbiBbJy8vLyBsaW5lIGRvYyBjb21tZW50JywgJy8vISBsaW5lIGRvYyBjb21tZW50J11cbiAgICAgIHt0b2tlbnN9ID0gZ3JhbW1hci50b2tlbml6ZUxpbmUoc3JjKVxuICAgICAgZXhwZWN0KHRva2Vuc1sxXSkudG9FcXVhbCB2YWx1ZTogJyBsaW5lIGRvYyBjb21tZW50Jywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ2NvbW1lbnQubGluZS5kb2N1bWVudGF0aW9uLnJ1c3QnXVxuXG4gICNcbiAgIyBBdHRyaWJ1dGVzXG4gICNcblxuICBpdCAndG9rZW5pemVzIGF0dHJpYnV0ZXMnLCAtPlxuICAgIHt0b2tlbnN9ID0gZ3JhbW1hci50b2tlbml6ZUxpbmUoJyMhW21haW5dIHRleHQnKVxuICAgIGV4cGVjdCh0b2tlbnNbMV0pLnRvRXF1YWwgdmFsdWU6ICdtYWluJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ21ldGEuYXR0cmlidXRlLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbM10pLnRvRXF1YWwgdmFsdWU6ICcgdGV4dCcsIHNjb3BlczogWydzb3VyY2UucnVzdCddXG5cbiAgaXQgJ3Rva2VuaXplcyBhdHRyaWJ1dGVzIHdpdGggb3B0aW9ucycsIC0+XG4gICAge3Rva2Vuc30gPSBncmFtbWFyLnRva2VuaXplTGluZSgnIyFbYWxsb3coZ3JlYXRfYWxnb3JpdGhtcyldIHRleHQnKVxuICAgIGV4cGVjdCh0b2tlbnNbMV0pLnRvRXF1YWwgdmFsdWU6ICdhbGxvdyhncmVhdF9hbGdvcml0aG1zKScsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdtZXRhLmF0dHJpYnV0ZS5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzNdKS50b0VxdWFsIHZhbHVlOiAnIHRleHQnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnXVxuXG4gIGl0ICd0b2tlbml6ZXMgYXR0cmlidXRlcyB3aXRoIG5lZ2F0aW9ucycsIC0+XG4gICAge3Rva2Vuc30gPSBncmFtbWFyLnRva2VuaXplTGluZSgnIyFbIXJlc29sdmVfdW5leHBvcnRlZF0gdGV4dCcpXG4gICAgZXhwZWN0KHRva2Vuc1sxXSkudG9FcXVhbCB2YWx1ZTogJyFyZXNvbHZlX3VuZXhwb3J0ZWQnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnbWV0YS5hdHRyaWJ1dGUucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1szXSkudG9FcXVhbCB2YWx1ZTogJyB0ZXh0Jywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0J11cblxuICBpdCAndG9rZW5pemVzIGl0ZW0gYXR0cmlidXRlcycsIC0+XG4gICAge3Rva2Vuc30gPSBncmFtbWFyLnRva2VuaXplTGluZSgnI1tkZW55KHNpbGx5X2NvbW1lbnRzKV0gdGV4dCcpXG4gICAgZXhwZWN0KHRva2Vuc1sxXSkudG9FcXVhbCB2YWx1ZTogJ2Rlbnkoc2lsbHlfY29tbWVudHMpJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ21ldGEuYXR0cmlidXRlLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbM10pLnRvRXF1YWwgdmFsdWU6ICcgdGV4dCcsIHNjb3BlczogWydzb3VyY2UucnVzdCddXG5cbiAgaXQgJ3Rva2VuaXplcyBhdHRyaWJ1dGVzIHdpdGggdmFsdWVzJywgLT5cbiAgICB7dG9rZW5zfSA9IGdyYW1tYXIudG9rZW5pemVMaW5lKCcjW2RvYyA9IFwiVGhlIGRvY3NcIl0nKVxuICAgIGV4cGVjdCh0b2tlbnNbMV0pLnRvRXF1YWwgdmFsdWU6ICdkb2MgPSAnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnbWV0YS5hdHRyaWJ1dGUucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1szXSkudG9FcXVhbCB2YWx1ZTogJ1RoZSBkb2NzJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ21ldGEuYXR0cmlidXRlLnJ1c3QnLCAnc3RyaW5nLnF1b3RlZC5kb3VibGUucnVzdCddXG5cbiAgaXQgJ3Rva2VuaXplcyBhdHRyaWJ1dGVzIHdpdGggc3BlY2lhbCBjaGFyYWN0ZXJzIGluIHZhbHVlcycsIC0+XG4gICAge3Rva2Vuc30gPSBncmFtbWFyLnRva2VuaXplTGluZSgnI1tkb2MgPSBcIlRoaXMgYXR0cmlidXRlIGNvbnRhaW5zIF0gYW4gYXR0cmlidXRlIGVuZGluZyBjaGFyYWN0ZXJcIl0nKVxuICAgIGV4cGVjdCh0b2tlbnNbMV0pLnRvRXF1YWwgdmFsdWU6ICdkb2MgPSAnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnbWV0YS5hdHRyaWJ1dGUucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1szXSkudG9FcXVhbCB2YWx1ZTogJ1RoaXMgYXR0cmlidXRlIGNvbnRhaW5zIF0gYW4gYXR0cmlidXRlIGVuZGluZyBjaGFyYWN0ZXInLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnbWV0YS5hdHRyaWJ1dGUucnVzdCcsICdzdHJpbmcucXVvdGVkLmRvdWJsZS5ydXN0J11cblxuICAjXG4gICMgU3RyaW5nc1xuICAjXG5cbiAgaXQgJ3Rva2VuaXplcyBzdHJpbmdzJywgLT5cbiAgICB7dG9rZW5zfSA9IGdyYW1tYXIudG9rZW5pemVMaW5lKCd0ZXh0IFwiVGhpcyBpcyBhIHN0cmluZ1wiIHRleHQnKVxuICAgIGV4cGVjdCh0b2tlbnNbMF0pLnRvRXF1YWwgdmFsdWU6ICd0ZXh0ICcsIHNjb3BlczogWydzb3VyY2UucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1syXSkudG9FcXVhbCB2YWx1ZTogJ1RoaXMgaXMgYSBzdHJpbmcnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnc3RyaW5nLnF1b3RlZC5kb3VibGUucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1s0XSkudG9FcXVhbCB2YWx1ZTogJyB0ZXh0Jywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0J11cblxuICBpdCAndG9rZW5pemVzIHN0cmluZ3Mgd2l0aCBlc2NhcGVkIGNoYXJhY3RlcnMnLCAtPlxuICAgIHt0b2tlbnN9ID0gZ3JhbW1hci50b2tlbml6ZUxpbmUoJ3RleHQgXCJzdHJpbmdcXFxcbndpdGhcXFxceDIwZXNjYXBlZFxcXFxcImNoYXJhY3RlcnNcIiB0ZXh0JylcbiAgICBleHBlY3QodG9rZW5zWzBdKS50b0VxdWFsIHZhbHVlOiAndGV4dCAnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbMl0pLnRvRXF1YWwgdmFsdWU6ICdzdHJpbmcnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnc3RyaW5nLnF1b3RlZC5kb3VibGUucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1szXSkudG9FcXVhbCB2YWx1ZTogJ1xcXFxuJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ3N0cmluZy5xdW90ZWQuZG91YmxlLnJ1c3QnLCAnY29uc3RhbnQuY2hhcmFjdGVyLmVzY2FwZS5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzRdKS50b0VxdWFsIHZhbHVlOiAnd2l0aCcsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdzdHJpbmcucXVvdGVkLmRvdWJsZS5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzVdKS50b0VxdWFsIHZhbHVlOiAnXFxcXHgyMCcsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdzdHJpbmcucXVvdGVkLmRvdWJsZS5ydXN0JywgJ2NvbnN0YW50LmNoYXJhY3Rlci5lc2NhcGUucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1s2XSkudG9FcXVhbCB2YWx1ZTogJ2VzY2FwZWQnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnc3RyaW5nLnF1b3RlZC5kb3VibGUucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1s3XSkudG9FcXVhbCB2YWx1ZTogJ1xcXFxcIicsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdzdHJpbmcucXVvdGVkLmRvdWJsZS5ydXN0JywgJ2NvbnN0YW50LmNoYXJhY3Rlci5lc2NhcGUucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1s4XSkudG9FcXVhbCB2YWx1ZTogJ2NoYXJhY3RlcnMnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnc3RyaW5nLnF1b3RlZC5kb3VibGUucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1sxMF0pLnRvRXF1YWwgdmFsdWU6ICcgdGV4dCcsIHNjb3BlczogWydzb3VyY2UucnVzdCddXG5cbiAgaXQgJ3Rva2VuaXplcyBzdHJpbmdzIHdpdGggY29tbWVudHMgaW5zaWRlJywgLT5cbiAgICB7dG9rZW5zfSA9IGdyYW1tYXIudG9rZW5pemVMaW5lKCd0ZXh0IFwic3RyaW5nIHdpdGggLy8gY29tbWVudCAvKiBpbnNpZGVcIiB0ZXh0JylcbiAgICBleHBlY3QodG9rZW5zWzBdKS50b0VxdWFsIHZhbHVlOiAndGV4dCAnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbMl0pLnRvRXF1YWwgdmFsdWU6ICdzdHJpbmcgd2l0aCAvLyBjb21tZW50IC8qIGluc2lkZScsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdzdHJpbmcucXVvdGVkLmRvdWJsZS5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzRdKS50b0VxdWFsIHZhbHVlOiAnIHRleHQnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnXVxuXG4gIGl0ICd0b2tlbml6ZXMgbXVsdGlsaW5lIHN0cmluZ3MnLCAtPlxuICAgIHRva2VucyA9IGdyYW1tYXIudG9rZW5pemVMaW5lcygndGV4dCBcInN0cmluZ3MgY2FuXFxuc3BhbiBtdWx0aXBsZSBsaW5lc1wiIHRleHQnKVxuICAgIGV4cGVjdCh0b2tlbnNbMF1bMF0pLnRvRXF1YWwgdmFsdWU6ICd0ZXh0ICcsIHNjb3BlczogWydzb3VyY2UucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1swXVsyXSkudG9FcXVhbCB2YWx1ZTogJ3N0cmluZ3MgY2FuJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ3N0cmluZy5xdW90ZWQuZG91YmxlLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbMV1bMF0pLnRvRXF1YWwgdmFsdWU6ICdzcGFuIG11bHRpcGxlIGxpbmVzJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ3N0cmluZy5xdW90ZWQuZG91YmxlLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbMV1bMl0pLnRvRXF1YWwgdmFsdWU6ICcgdGV4dCcsIHNjb3BlczogWydzb3VyY2UucnVzdCddXG5cbiAgaXQgJ3Rva2VuaXplcyByYXcgc3RyaW5ncycsIC0+XG4gICAge3Rva2Vuc30gPSBncmFtbWFyLnRva2VuaXplTGluZSgndGV4dCByXCJUaGlzIGlzIGEgcmF3IHN0cmluZ1wiIHRleHQnKVxuICAgIGV4cGVjdCh0b2tlbnNbMF0pLnRvRXF1YWwgdmFsdWU6ICd0ZXh0ICcsIHNjb3BlczogWydzb3VyY2UucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1syXSkudG9FcXVhbCB2YWx1ZTogJ1RoaXMgaXMgYSByYXcgc3RyaW5nJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ3N0cmluZy5xdW90ZWQuZG91YmxlLnJhdy5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzRdKS50b0VxdWFsIHZhbHVlOiAnIHRleHQnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnXVxuXG4gIGl0ICd0b2tlbml6ZXMgcmF3IHN0cmluZ3Mgd2l0aCBtdWx0aXBsZSBzdXJyb3VuZGluZyBjaGFyYWN0ZXJzJywgLT5cbiAgICB7dG9rZW5zfSA9IGdyYW1tYXIudG9rZW5pemVMaW5lKCd0ZXh0IHIjI1wiVGhpcyBpcyBhICMjXCIjIHZhbGlkIHJhdyBzdHJpbmdcIiMjIHRleHQnKVxuICAgIGV4cGVjdCh0b2tlbnNbMF0pLnRvRXF1YWwgdmFsdWU6ICd0ZXh0ICcsIHNjb3BlczogWydzb3VyY2UucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1syXSkudG9FcXVhbCB2YWx1ZTogJ1RoaXMgaXMgYSAjI1wiIyB2YWxpZCByYXcgc3RyaW5nJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ3N0cmluZy5xdW90ZWQuZG91YmxlLnJhdy5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzRdKS50b0VxdWFsIHZhbHVlOiAnIHRleHQnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnXVxuXG4gIGl0ICd0b2tlbml6ZXMgYnl0ZSBzdHJpbmdzJywgLT5cbiAgICB7dG9rZW5zfSA9IGdyYW1tYXIudG9rZW5pemVMaW5lKCd0ZXh0IGJcIlRoaXMgaXMgYSBieXRlc3RyaW5nXCIgdGV4dCcpXG4gICAgZXhwZWN0KHRva2Vuc1swXSkudG9FcXVhbCB2YWx1ZTogJ3RleHQgJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzJdKS50b0VxdWFsIHZhbHVlOiAnVGhpcyBpcyBhIGJ5dGVzdHJpbmcnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnc3RyaW5nLnF1b3RlZC5kb3VibGUucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1s0XSkudG9FcXVhbCB2YWx1ZTogJyB0ZXh0Jywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0J11cblxuICBpdCAndG9rZW5pemVzIHJhdyBieXRlIHN0cmluZ3MnLCAtPlxuICAgIHt0b2tlbnN9ID0gZ3JhbW1hci50b2tlbml6ZUxpbmUoJ3RleHQgYnJcIlRoaXMgaXMgYSByYXcgYnl0ZXN0cmluZ1wiIHRleHQnKVxuICAgIGV4cGVjdCh0b2tlbnNbMF0pLnRvRXF1YWwgdmFsdWU6ICd0ZXh0ICcsIHNjb3BlczogWydzb3VyY2UucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1syXSkudG9FcXVhbCB2YWx1ZTogJ1RoaXMgaXMgYSByYXcgYnl0ZXN0cmluZycsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdzdHJpbmcucXVvdGVkLmRvdWJsZS5yYXcucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1s0XSkudG9FcXVhbCB2YWx1ZTogJyB0ZXh0Jywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0J11cblxuICBpdCAndG9rZW5pemVzIG11bHRpbGluZSByYXcgc3RyaW5ncycsIC0+XG4gICAgdG9rZW5zID0gZ3JhbW1hci50b2tlbml6ZUxpbmVzKCd0ZXh0IHJcIlJhdyBzdHJpbmdzIGNhblxcbnNwYW4gbXVsdGlwbGUgbGluZXNcIiB0ZXh0JylcbiAgICBleHBlY3QodG9rZW5zWzBdWzBdKS50b0VxdWFsIHZhbHVlOiAndGV4dCAnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbMF1bMl0pLnRvRXF1YWwgdmFsdWU6ICdSYXcgc3RyaW5ncyBjYW4nLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnc3RyaW5nLnF1b3RlZC5kb3VibGUucmF3LnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbMV1bMF0pLnRvRXF1YWwgdmFsdWU6ICdzcGFuIG11bHRpcGxlIGxpbmVzJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ3N0cmluZy5xdW90ZWQuZG91YmxlLnJhdy5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzFdWzJdKS50b0VxdWFsIHZhbHVlOiAnIHRleHQnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnXVxuXG4gIGl0ICd0b2tlbml6ZXMgY2hhcmFjdGVycycsIC0+XG4gICAge3Rva2Vuc30gPSBncmFtbWFyLnRva2VuaXplTGluZSgndGV4dCBcXCdjXFwnIHRleHQnKVxuICAgIGV4cGVjdCh0b2tlbnNbMF0pLnRvRXF1YWwgdmFsdWU6ICd0ZXh0ICcsIHNjb3BlczogWydzb3VyY2UucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1sxXSkudG9FcXVhbCB2YWx1ZTogJ1xcJ2NcXCcnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnc3RyaW5nLnF1b3RlZC5zaW5nbGUucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1syXSkudG9FcXVhbCB2YWx1ZTogJyB0ZXh0Jywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0J11cblxuICBpdCAndG9rZW5pemVzIGVzY2FwZWQgY2hhcmFjdGVycycsIC0+XG4gICAge3Rva2Vuc30gPSBncmFtbWFyLnRva2VuaXplTGluZSgndGV4dCBcXCdcXFxcblxcJyB0ZXh0JylcbiAgICBleHBlY3QodG9rZW5zWzBdKS50b0VxdWFsIHZhbHVlOiAndGV4dCAnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbMV0pLnRvRXF1YWwgdmFsdWU6ICdcXCdcXFxcblxcJycsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdzdHJpbmcucXVvdGVkLnNpbmdsZS5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzJdKS50b0VxdWFsIHZhbHVlOiAnIHRleHQnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnXVxuXG4gIGl0ICd0b2tlbml6ZXMgYnl0ZXMgY2hhcmFjdGVyJywgLT5cbiAgICB7dG9rZW5zfSA9IGdyYW1tYXIudG9rZW5pemVMaW5lKCd0ZXh0IGJcXCdiXFwnIHRleHQnKVxuICAgIGV4cGVjdCh0b2tlbnNbMF0pLnRvRXF1YWwgdmFsdWU6ICd0ZXh0ICcsIHNjb3BlczogWydzb3VyY2UucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1sxXSkudG9FcXVhbCB2YWx1ZTogJ2JcXCdiXFwnJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ3N0cmluZy5xdW90ZWQuc2luZ2xlLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbMl0pLnRvRXF1YWwgdmFsdWU6ICcgdGV4dCcsIHNjb3BlczogWydzb3VyY2UucnVzdCddXG5cbiAgaXQgJ3Rva2VuaXplcyBlc2NhcGVkIGJ5dGVzIGNoYXJhY3RlcnMnLCAtPlxuICAgIHt0b2tlbnN9ID0gZ3JhbW1hci50b2tlbml6ZUxpbmUoJ3RleHQgYlxcJ1xcXFx4MjBcXCcgdGV4dCcpXG4gICAgZXhwZWN0KHRva2Vuc1swXSkudG9FcXVhbCB2YWx1ZTogJ3RleHQgJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzFdKS50b0VxdWFsIHZhbHVlOiAnYlxcJ1xcXFx4MjBcXCcnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnc3RyaW5nLnF1b3RlZC5zaW5nbGUucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1syXSkudG9FcXVhbCB2YWx1ZTogJyB0ZXh0Jywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0J11cblxuICAjXG4gICMgTnVtYmVyc1xuICAjXG5cbiAgaXQgJ3Rva2VuaXplcyBkZWNpbWFsIGludGVnZXJzJywgLT5cbiAgICB7dG9rZW5zfSA9IGdyYW1tYXIudG9rZW5pemVMaW5lKCd0ZXh0IDQyIHRleHQnKVxuICAgIGV4cGVjdCh0b2tlbnNbMF0pLnRvRXF1YWwgdmFsdWU6ICd0ZXh0ICcsIHNjb3BlczogWydzb3VyY2UucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1sxXSkudG9FcXVhbCB2YWx1ZTogJzQyJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ2NvbnN0YW50Lm51bWVyaWMuaW50ZWdlci5kZWNpbWFsLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbMl0pLnRvRXF1YWwgdmFsdWU6ICcgdGV4dCcsIHNjb3BlczogWydzb3VyY2UucnVzdCddXG5cbiAgaXQgJ3Rva2VuaXplcyBoZXggaW50ZWdlcnMnLCAtPlxuICAgIHt0b2tlbnN9ID0gZ3JhbW1hci50b2tlbml6ZUxpbmUoJ3RleHQgMHhmMDBiIHRleHQnKVxuICAgIGV4cGVjdCh0b2tlbnNbMF0pLnRvRXF1YWwgdmFsdWU6ICd0ZXh0ICcsIHNjb3BlczogWydzb3VyY2UucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1sxXSkudG9FcXVhbCB2YWx1ZTogJzB4ZjAwYicsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdjb25zdGFudC5udW1lcmljLmludGVnZXIuaGV4YWRlY2ltYWwucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1syXSkudG9FcXVhbCB2YWx1ZTogJyB0ZXh0Jywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0J11cblxuICBpdCAndG9rZW5pemVzIG9jdGFsIGludGVnZXJzJywgLT5cbiAgICB7dG9rZW5zfSA9IGdyYW1tYXIudG9rZW5pemVMaW5lKCd0ZXh0IDBvNzU1IHRleHQnKVxuICAgIGV4cGVjdCh0b2tlbnNbMF0pLnRvRXF1YWwgdmFsdWU6ICd0ZXh0ICcsIHNjb3BlczogWydzb3VyY2UucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1sxXSkudG9FcXVhbCB2YWx1ZTogJzBvNzU1Jywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ2NvbnN0YW50Lm51bWVyaWMuaW50ZWdlci5vY3RhbC5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzJdKS50b0VxdWFsIHZhbHVlOiAnIHRleHQnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnXVxuXG4gIGl0ICd0b2tlbml6ZXMgYmluYXJ5IGludGVnZXJzJywgLT5cbiAgICB7dG9rZW5zfSA9IGdyYW1tYXIudG9rZW5pemVMaW5lKCd0ZXh0IDBiMTAxMDEwIHRleHQnKVxuICAgIGV4cGVjdCh0b2tlbnNbMF0pLnRvRXF1YWwgdmFsdWU6ICd0ZXh0ICcsIHNjb3BlczogWydzb3VyY2UucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1sxXSkudG9FcXVhbCB2YWx1ZTogJzBiMTAxMDEwJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ2NvbnN0YW50Lm51bWVyaWMuaW50ZWdlci5iaW5hcnkucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1syXSkudG9FcXVhbCB2YWx1ZTogJyB0ZXh0Jywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0J11cblxuICBpdCAndG9rZW5pemVzIGludGVnZXJzIHdpdGggdHlwZSBzdWZmaXgnLCAtPlxuICAgIHt0b2tlbnN9ID0gZ3JhbW1hci50b2tlbml6ZUxpbmUoJ3RleHQgNDJ1OCB0ZXh0JylcbiAgICBleHBlY3QodG9rZW5zWzBdKS50b0VxdWFsIHZhbHVlOiAndGV4dCAnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbMV0pLnRvRXF1YWwgdmFsdWU6ICc0MnU4Jywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ2NvbnN0YW50Lm51bWVyaWMuaW50ZWdlci5kZWNpbWFsLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbMl0pLnRvRXF1YWwgdmFsdWU6ICcgdGV4dCcsIHNjb3BlczogWydzb3VyY2UucnVzdCddXG5cbiAgaXQgJ3Rva2VuaXplcyBpbnRlZ2VycyB3aXRoIHVuZGVyc2NvcmVzJywgLT5cbiAgICB7dG9rZW5zfSA9IGdyYW1tYXIudG9rZW5pemVMaW5lKCd0ZXh0IDRfMiB0ZXh0JylcbiAgICBleHBlY3QodG9rZW5zWzBdKS50b0VxdWFsIHZhbHVlOiAndGV4dCAnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbMV0pLnRvRXF1YWwgdmFsdWU6ICc0XzInLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnY29uc3RhbnQubnVtZXJpYy5pbnRlZ2VyLmRlY2ltYWwucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1syXSkudG9FcXVhbCB2YWx1ZTogJyB0ZXh0Jywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0J11cblxuICBpdCAndG9rZW5pemVzIGludGVnZXJzIHdpdGggdW5kZXJzY29yZXMgYW5kIHR5cGUgc3VmZml4JywgLT5cbiAgICB7dG9rZW5zfSA9IGdyYW1tYXIudG9rZW5pemVMaW5lKCd0ZXh0IDRfMl91OCB0ZXh0JylcbiAgICBleHBlY3QodG9rZW5zWzBdKS50b0VxdWFsIHZhbHVlOiAndGV4dCAnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbMV0pLnRvRXF1YWwgdmFsdWU6ICc0XzJfdTgnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnY29uc3RhbnQubnVtZXJpYy5pbnRlZ2VyLmRlY2ltYWwucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1syXSkudG9FcXVhbCB2YWx1ZTogJyB0ZXh0Jywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0J11cblxuICBpdCAndG9rZW5pemVzIGZsb2F0cycsIC0+XG4gICAge3Rva2Vuc30gPSBncmFtbWFyLnRva2VuaXplTGluZSgndGV4dCA0Mi4xNDE1IHRleHQnKVxuICAgIGV4cGVjdCh0b2tlbnNbMF0pLnRvRXF1YWwgdmFsdWU6ICd0ZXh0ICcsIHNjb3BlczogWydzb3VyY2UucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1sxXSkudG9FcXVhbCB2YWx1ZTogJzQyLjE0MTUnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnY29uc3RhbnQubnVtZXJpYy5mbG9hdC5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzJdKS50b0VxdWFsIHZhbHVlOiAnIHRleHQnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnXVxuXG4gIGl0ICd0b2tlbml6ZXMgZmxvYXRzIHdpdGggZXhwb25lbnQnLCAtPlxuICAgIHt0b2tlbnN9ID0gZ3JhbW1hci50b2tlbml6ZUxpbmUoJ3RleHQgNDJlMTggdGV4dCcpXG4gICAgZXhwZWN0KHRva2Vuc1swXSkudG9FcXVhbCB2YWx1ZTogJ3RleHQgJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzFdKS50b0VxdWFsIHZhbHVlOiAnNDJlMTgnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnY29uc3RhbnQubnVtZXJpYy5mbG9hdC5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzJdKS50b0VxdWFsIHZhbHVlOiAnIHRleHQnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnXVxuXG4gIGl0ICd0b2tlbml6ZXMgZmxvYXRzIHdpdGggc2lnbmVkIGV4cG9uZW50JywgLT5cbiAgICB7dG9rZW5zfSA9IGdyYW1tYXIudG9rZW5pemVMaW5lKCd0ZXh0IDQyZSsxOCB0ZXh0JylcbiAgICBleHBlY3QodG9rZW5zWzBdKS50b0VxdWFsIHZhbHVlOiAndGV4dCAnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbMV0pLnRvRXF1YWwgdmFsdWU6ICc0MmUrMTgnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnY29uc3RhbnQubnVtZXJpYy5mbG9hdC5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzJdKS50b0VxdWFsIHZhbHVlOiAnIHRleHQnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnXVxuXG4gIGl0ICd0b2tlbml6ZXMgZmxvYXRzIHdpdGggZG90IGFuZCBleHBvbmVudCcsIC0+XG4gICAge3Rva2Vuc30gPSBncmFtbWFyLnRva2VuaXplTGluZSgndGV4dCA0Mi4xNDE1ZTE4IHRleHQnKVxuICAgIGV4cGVjdCh0b2tlbnNbMF0pLnRvRXF1YWwgdmFsdWU6ICd0ZXh0ICcsIHNjb3BlczogWydzb3VyY2UucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1sxXSkudG9FcXVhbCB2YWx1ZTogJzQyLjE0MTVlMTgnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnY29uc3RhbnQubnVtZXJpYy5mbG9hdC5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzJdKS50b0VxdWFsIHZhbHVlOiAnIHRleHQnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnXVxuXG4gIGl0ICd0b2tlbml6ZXMgZmxvYXRzIHdpdGggZG90IGFuZCBzaWduZWQgZXhwb25lbnQnLCAtPlxuICAgIHt0b2tlbnN9ID0gZ3JhbW1hci50b2tlbml6ZUxpbmUoJ3RleHQgNDIuMTQxNWUrMTggdGV4dCcpXG4gICAgZXhwZWN0KHRva2Vuc1swXSkudG9FcXVhbCB2YWx1ZTogJ3RleHQgJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzFdKS50b0VxdWFsIHZhbHVlOiAnNDIuMTQxNWUrMTgnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnY29uc3RhbnQubnVtZXJpYy5mbG9hdC5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzJdKS50b0VxdWFsIHZhbHVlOiAnIHRleHQnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnXVxuXG4gIGl0ICd0b2tlbml6ZXMgZmxvYXRzIHdpdGggdHlwZSBzdWZmaXgnLCAtPlxuICAgIHt0b2tlbnN9ID0gZ3JhbW1hci50b2tlbml6ZUxpbmUoJ3RleHQgNDIuMTQxNWYzMiB0ZXh0JylcbiAgICBleHBlY3QodG9rZW5zWzBdKS50b0VxdWFsIHZhbHVlOiAndGV4dCAnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbMV0pLnRvRXF1YWwgdmFsdWU6ICc0Mi4xNDE1ZjMyJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ2NvbnN0YW50Lm51bWVyaWMuZmxvYXQucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1syXSkudG9FcXVhbCB2YWx1ZTogJyB0ZXh0Jywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0J11cblxuICBpdCAndG9rZW5pemVzIGZsb2F0cyB3aXRoIHVuZGVyc2NvcmVzJywgLT5cbiAgICB7dG9rZW5zfSA9IGdyYW1tYXIudG9rZW5pemVMaW5lKCd0ZXh0IDRfMi4xNDFfNSB0ZXh0JylcbiAgICBleHBlY3QodG9rZW5zWzBdKS50b0VxdWFsIHZhbHVlOiAndGV4dCAnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbMV0pLnRvRXF1YWwgdmFsdWU6ICc0XzIuMTQxXzUnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnY29uc3RhbnQubnVtZXJpYy5mbG9hdC5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzJdKS50b0VxdWFsIHZhbHVlOiAnIHRleHQnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnXVxuXG4gIGl0ICd0b2tlbml6ZXMgZmxvYXRzIHdpdGggdW5kZXJzY29yZXMgYW5kIHR5cGUgc3VmZml4JywgLT5cbiAgICB7dG9rZW5zfSA9IGdyYW1tYXIudG9rZW5pemVMaW5lKCd0ZXh0IDRfMi4xNDFfNV9mMzIgdGV4dCcpXG4gICAgZXhwZWN0KHRva2Vuc1swXSkudG9FcXVhbCB2YWx1ZTogJ3RleHQgJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzFdKS50b0VxdWFsIHZhbHVlOiAnNF8yLjE0MV81X2YzMicsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdjb25zdGFudC5udW1lcmljLmZsb2F0LnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbMl0pLnRvRXF1YWwgdmFsdWU6ICcgdGV4dCcsIHNjb3BlczogWydzb3VyY2UucnVzdCddXG5cbiAgI1xuICAjIEJvb2xlYW5zXG4gICNcblxuICBpdCAndG9rZW5pemVzIGJvb2xlYW4gZmFsc2UnLCAtPlxuICAgIHt0b2tlbnN9ID0gZ3JhbW1hci50b2tlbml6ZUxpbmUoJ3RleHQgZmFsc2UgdGV4dCcpXG4gICAgZXhwZWN0KHRva2Vuc1swXSkudG9FcXVhbCB2YWx1ZTogJ3RleHQgJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzFdKS50b0VxdWFsIHZhbHVlOiAnZmFsc2UnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnY29uc3RhbnQubGFuZ3VhZ2UuYm9vbGVhbi5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzJdKS50b0VxdWFsIHZhbHVlOiAnIHRleHQnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnXVxuXG4gIGl0ICd0b2tlbml6ZXMgYm9vbGVhbiB0cnVlJywgLT5cbiAgICB7dG9rZW5zfSA9IGdyYW1tYXIudG9rZW5pemVMaW5lKCd0ZXh0IHRydWUgdGV4dCcpXG4gICAgZXhwZWN0KHRva2Vuc1swXSkudG9FcXVhbCB2YWx1ZTogJ3RleHQgJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzFdKS50b0VxdWFsIHZhbHVlOiAndHJ1ZScsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdjb25zdGFudC5sYW5ndWFnZS5ib29sZWFuLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbMl0pLnRvRXF1YWwgdmFsdWU6ICcgdGV4dCcsIHNjb3BlczogWydzb3VyY2UucnVzdCddXG5cbiAgI1xuICAjIExhbmd1YWdlXG4gICNcblxuICBpdCAndG9rZW5pemVzIGNvbnRyb2wga2V5d29yZHMnLCAtPlxuICAgIGZvciB0IGluIFsnYnJlYWsnLCAnY29udGludWUnLCAnZWxzZScsICdpZicsICdpbicsICdmb3InLCAnbG9vcCcsICdtYXRjaCcsICdyZXR1cm4nLCAnd2hpbGUnXVxuICAgICAge3Rva2Vuc30gPSBncmFtbWFyLnRva2VuaXplTGluZShcInRleHQgI3t0fSB0ZXh0XCIpXG4gICAgICBleHBlY3QodG9rZW5zWzBdKS50b0VxdWFsIHZhbHVlOiAndGV4dCAnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnXVxuICAgICAgZXhwZWN0KHRva2Vuc1sxXSkudG9FcXVhbCB2YWx1ZTogdCwgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ2tleXdvcmQuY29udHJvbC5ydXN0J11cbiAgICAgIGV4cGVjdCh0b2tlbnNbMl0pLnRvRXF1YWwgdmFsdWU6ICcgdGV4dCcsIHNjb3BlczogWydzb3VyY2UucnVzdCddXG5cbiAgaXQgJ3Rva2VuaXplcyBrZXl3b3JkcycsIC0+XG4gICAgZm9yIHQgaW4gWydjcmF0ZScsICdleHRlcm4nLCAnbW9kJywgJ2xldCcsICdyZWYnLCAndXNlJywgJ3N1cGVyJywgJ21vdmUnXVxuICAgICAge3Rva2Vuc30gPSBncmFtbWFyLnRva2VuaXplTGluZShcInRleHQgI3t0fSB0ZXh0XCIpXG4gICAgICBleHBlY3QodG9rZW5zWzBdKS50b0VxdWFsIHZhbHVlOiAndGV4dCAnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnXVxuICAgICAgZXhwZWN0KHRva2Vuc1sxXSkudG9FcXVhbCB2YWx1ZTogdCwgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ2tleXdvcmQub3RoZXIucnVzdCddXG4gICAgICBleHBlY3QodG9rZW5zWzJdKS50b0VxdWFsIHZhbHVlOiAnIHRleHQnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnXVxuXG4gIGl0ICd0b2tlbml6ZXMgcmVzZXJ2ZWQga2V5d29yZHMnLCAtPlxuICAgIGZvciB0IGluIFsnYWJzdHJhY3QnLCAnYWxpZ25vZicsICdiZWNvbWUnLCAnZG8nLCAnZmluYWwnLCAnbWFjcm8nLCAnb2Zmc2V0b2YnLCAnb3ZlcnJpZGUnLCAncHJpdicsICdwcm9jJywgJ3B1cmUnLCAnc2l6ZW9mJywgJ3R5cGVvZicsICd2aXJ0dWFsJywgJ3lpZWxkJ11cbiAgICAgIHt0b2tlbnN9ID0gZ3JhbW1hci50b2tlbml6ZUxpbmUoXCJ0ZXh0ICN7dH0gdGV4dFwiKVxuICAgICAgZXhwZWN0KHRva2Vuc1swXSkudG9FcXVhbCB2YWx1ZTogJ3RleHQgJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0J11cbiAgICAgIGV4cGVjdCh0b2tlbnNbMV0pLnRvRXF1YWwgdmFsdWU6IHQsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdpbnZhbGlkLmRlcHJlY2F0ZWQucnVzdCddXG4gICAgICBleHBlY3QodG9rZW5zWzJdKS50b0VxdWFsIHZhbHVlOiAnIHRleHQnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnXVxuXG4gIGl0ICd0b2tlbml6ZXMgdW5zYWZlIGtleXdvcmQnLCAtPlxuICAgIHt0b2tlbnN9ID0gZ3JhbW1hci50b2tlbml6ZUxpbmUoJ3RleHQgdW5zYWZlIHRleHQnKVxuICAgIGV4cGVjdCh0b2tlbnNbMF0pLnRvRXF1YWwgdmFsdWU6ICd0ZXh0ICcsIHNjb3BlczogWydzb3VyY2UucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1sxXSkudG9FcXVhbCB2YWx1ZTogJ3Vuc2FmZScsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdrZXl3b3JkLm90aGVyLnVuc2FmZS5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzJdKS50b0VxdWFsIHZhbHVlOiAnIHRleHQnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnXVxuXG4gIGl0ICd0b2tlbml6ZXMgc2VsZiBrZXl3b3JkJywgLT5cbiAgICB7dG9rZW5zfSA9IGdyYW1tYXIudG9rZW5pemVMaW5lKCd0ZXh0IHNlbGYgdGV4dCcpXG4gICAgZXhwZWN0KHRva2Vuc1swXSkudG9FcXVhbCB2YWx1ZTogJ3RleHQgJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzFdKS50b0VxdWFsIHZhbHVlOiAnc2VsZicsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICd2YXJpYWJsZS5sYW5ndWFnZS5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzJdKS50b0VxdWFsIHZhbHVlOiAnIHRleHQnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnXVxuXG4gIGl0ICd0b2tlbml6ZXMgc2lnaWxzJywgLT5cbiAgICB7dG9rZW5zfSA9IGdyYW1tYXIudG9rZW5pemVMaW5lKCcqdmFyICZ2YXInKVxuICAgIGV4cGVjdCh0b2tlbnNbMF0pLnRvRXF1YWwgdmFsdWU6ICcqJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ2tleXdvcmQub3BlcmF0b3Iuc2lnaWwucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1syXSkudG9FcXVhbCB2YWx1ZTogJyYnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAna2V5d29yZC5vcGVyYXRvci5zaWdpbC5ydXN0J11cblxuICAjXG4gICMgQ29yZVxuICAjXG5cbiAgaXQgJ3Rva2VuaXplcyBjb3JlIHR5cGVzJywgLT5cbiAgICBmb3IgdCBpbiBbJ2Jvb2wnLCAnY2hhcicsICd1c2l6ZScsICdpc2l6ZScsICd1OCcsICd1MTYnLCAndTMyJywgJ3U2NCcsICdpOCcsICdpMTYnLCAnaTMyJywgJ2k2NCcsICdmMzInLCAnZjY0JywgJ3N0cicsICdTZWxmJywgJ09wdGlvbicsICdSZXN1bHQnXVxuICAgICAge3Rva2Vuc30gPSBncmFtbWFyLnRva2VuaXplTGluZShcInRleHQgI3t0fSB0ZXh0XCIpXG4gICAgICBleHBlY3QodG9rZW5zWzBdKS50b0VxdWFsIHZhbHVlOiAndGV4dCAnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnXVxuICAgICAgZXhwZWN0KHRva2Vuc1sxXSkudG9FcXVhbCB2YWx1ZTogdCwgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ3N0b3JhZ2UudHlwZS5jb3JlLnJ1c3QnXVxuICAgICAgZXhwZWN0KHRva2Vuc1syXSkudG9FcXVhbCB2YWx1ZTogJyB0ZXh0Jywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0J11cblxuICBpdCAndG9rZW5pemVzIGNvcmUgdmFyaWFudHMnLCAtPlxuICAgIGZvciB0IGluIFsnU29tZScsICdOb25lJywgJ09rJywgJ0VyciddXG4gICAgICB7dG9rZW5zfSA9IGdyYW1tYXIudG9rZW5pemVMaW5lKFwidGV4dCAje3R9IHRleHRcIilcbiAgICAgIGV4cGVjdCh0b2tlbnNbMF0pLnRvRXF1YWwgdmFsdWU6ICd0ZXh0ICcsIHNjb3BlczogWydzb3VyY2UucnVzdCddXG4gICAgICBleHBlY3QodG9rZW5zWzFdKS50b0VxdWFsIHZhbHVlOiB0LCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnc3VwcG9ydC5jb25zdGFudC5jb3JlLnJ1c3QnXVxuICAgICAgZXhwZWN0KHRva2Vuc1syXSkudG9FcXVhbCB2YWx1ZTogJyB0ZXh0Jywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0J11cblxuICBpdCAndG9rZW5pemVzIGNvcmUgdHJhaXQgbWFya2VycycsIC0+XG4gICAgZm9yIHQgaW4gWydDb3B5JywgJ1NlbmQnLCAnU2l6ZWQnLCAnU3luYyddXG4gICAgICB7dG9rZW5zfSA9IGdyYW1tYXIudG9rZW5pemVMaW5lKFwidGV4dCAje3R9IHRleHRcIilcbiAgICAgIGV4cGVjdCh0b2tlbnNbMF0pLnRvRXF1YWwgdmFsdWU6ICd0ZXh0ICcsIHNjb3BlczogWydzb3VyY2UucnVzdCddXG4gICAgICBleHBlY3QodG9rZW5zWzFdKS50b0VxdWFsIHZhbHVlOiB0LCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnc3VwcG9ydC50eXBlLm1hcmtlci5ydXN0J11cbiAgICAgIGV4cGVjdCh0b2tlbnNbMl0pLnRvRXF1YWwgdmFsdWU6ICcgdGV4dCcsIHNjb3BlczogWydzb3VyY2UucnVzdCddXG5cbiAgaXQgJ3Rva2VuaXplcyBjb3JlIHRyYWl0cycsIC0+XG4gICAgZm9yIHQgaW4gWydEcm9wJywgJ0ZuJywgJ0ZuTXV0JywgJ0ZuT25jZScsICdDbG9uZScsICdQYXJ0aWFsRXEnLCAnUGFydGlhbE9yZCcsICdFcScsICdPcmQnLCAnQXNSZWYnLCAnQXNNdXQnLCAnSW50bycsICdGcm9tJywgJ0RlZmF1bHQnLCAnSXRlcmF0b3InLCAnRXh0ZW5kJywgJ0ludG9JdGVyYXRvcicsICdEb3VibGVFbmRlZEl0ZXJhdG9yJywgJ0V4YWN0U2l6ZUl0ZXJhdG9yJ11cbiAgICAgIHt0b2tlbnN9ID0gZ3JhbW1hci50b2tlbml6ZUxpbmUoXCJ0ZXh0ICN7dH0gdGV4dFwiKVxuICAgICAgZXhwZWN0KHRva2Vuc1swXSkudG9FcXVhbCB2YWx1ZTogJ3RleHQgJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0J11cbiAgICAgIGV4cGVjdCh0b2tlbnNbMV0pLnRvRXF1YWwgdmFsdWU6IHQsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdzdXBwb3J0LnR5cGUuY29yZS5ydXN0J11cbiAgICAgIGV4cGVjdCh0b2tlbnNbMl0pLnRvRXF1YWwgdmFsdWU6ICcgdGV4dCcsIHNjb3BlczogWydzb3VyY2UucnVzdCddXG5cbiAgI1xuICAjIFN0ZFxuICAjXG5cbiAgaXQgJ3Rva2VuaXplcyBzdGQgdHlwZXMnLCAtPlxuICAgIGZvciB0IGluIFsnQm94JywgJ1N0cmluZycsICdWZWMnLCAnUGF0aCcsICdQYXRoQnVmJ11cbiAgICAgIHt0b2tlbnN9ID0gZ3JhbW1hci50b2tlbml6ZUxpbmUoXCJ0ZXh0ICN7dH0gdGV4dFwiKVxuICAgICAgZXhwZWN0KHRva2Vuc1swXSkudG9FcXVhbCB2YWx1ZTogJ3RleHQgJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0J11cbiAgICAgIGV4cGVjdCh0b2tlbnNbMV0pLnRvRXF1YWwgdmFsdWU6IHQsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdzdG9yYWdlLmNsYXNzLnN0ZC5ydXN0J11cbiAgICAgIGV4cGVjdCh0b2tlbnNbMl0pLnRvRXF1YWwgdmFsdWU6ICcgdGV4dCcsIHNjb3BlczogWydzb3VyY2UucnVzdCddXG5cbiAgaXQgJ3Rva2VuaXplcyBzdGQgdHJhaXRzJywgLT5cbiAgICBmb3IgdCBpbiBbJ1RvT3duZWQnLCAnVG9TdHJpbmcnXVxuICAgICAge3Rva2Vuc30gPSBncmFtbWFyLnRva2VuaXplTGluZShcInRleHQgI3t0fSB0ZXh0XCIpXG4gICAgICBleHBlY3QodG9rZW5zWzBdKS50b0VxdWFsIHZhbHVlOiAndGV4dCAnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnXVxuICAgICAgZXhwZWN0KHRva2Vuc1sxXSkudG9FcXVhbCB2YWx1ZTogdCwgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ3N1cHBvcnQudHlwZS5zdGQucnVzdCddXG4gICAgICBleHBlY3QodG9rZW5zWzJdKS50b0VxdWFsIHZhbHVlOiAnIHRleHQnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnXVxuXG4gICNcbiAgIyBTbmlwcGV0c1xuICAjXG5cbiAgaXQgJ3Rva2VuaXplcyBpbXBvcnRzJywgLT5cbiAgICB0b2tlbnMgPSBncmFtbWFyLnRva2VuaXplTGluZXMoJycnXG4gICAgICBleHRlcm4gY3JhdGUgZm9vO1xuICAgICAgdXNlIHN0ZDo6c2xpY2U7XG4gICAgICB1c2Ugc3RkOjp7bnVtLCBzdHJ9O1xuICAgICAgdXNlIHNlbGY6OmZvbzo6e2JhciwgYmF6fTtcbiAgICAgICcnJylcbiAgICBleHBlY3QodG9rZW5zWzBdWzBdKS50b0VxdWFsIHZhbHVlOiAnZXh0ZXJuJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ2tleXdvcmQub3RoZXIucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1swXVsyXSkudG9FcXVhbCB2YWx1ZTogJ2NyYXRlJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ2tleXdvcmQub3RoZXIucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1sxXVswXSkudG9FcXVhbCB2YWx1ZTogJ3VzZScsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdrZXl3b3JkLm90aGVyLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbMV1bMl0pLnRvRXF1YWwgdmFsdWU6ICc6OicsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdrZXl3b3JkLm9wZXJhdG9yLm1pc2MucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1syXVswXSkudG9FcXVhbCB2YWx1ZTogJ3VzZScsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdrZXl3b3JkLm90aGVyLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbMl1bMl0pLnRvRXF1YWwgdmFsdWU6ICc6OicsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdrZXl3b3JkLm9wZXJhdG9yLm1pc2MucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1szXVswXSkudG9FcXVhbCB2YWx1ZTogJ3VzZScsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdrZXl3b3JkLm90aGVyLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbM11bMl0pLnRvRXF1YWwgdmFsdWU6ICdzZWxmJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ3ZhcmlhYmxlLmxhbmd1YWdlLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbM11bM10pLnRvRXF1YWwgdmFsdWU6ICc6OicsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdrZXl3b3JkLm9wZXJhdG9yLm1pc2MucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1szXVs1XSkudG9FcXVhbCB2YWx1ZTogJzo6Jywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ2tleXdvcmQub3BlcmF0b3IubWlzYy5ydXN0J11cblxuICBpdCAndG9rZW5pemVzIGVudW1zJywgLT5cbiAgICB0b2tlbnMgPSBncmFtbWFyLnRva2VuaXplTGluZXMoJycnXG4gICAgICBwdWIgZW51bSBNeUVudW0ge1xuICAgICAgICAgIE9uZSxcbiAgICAgICAgICBUd29cbiAgICAgIH1cbiAgICAgICcnJylcbiAgICBleHBlY3QodG9rZW5zWzBdWzBdKS50b0VxdWFsIHZhbHVlOiAncHViJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ3N0b3JhZ2UubW9kaWZpZXIudmlzaWJpbGl0eS5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzBdWzJdKS50b0VxdWFsIHZhbHVlOiAnZW51bScsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdzdG9yYWdlLnR5cGUucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1swXVs0XSkudG9FcXVhbCB2YWx1ZTogJ015RW51bScsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdlbnRpdHkubmFtZS50eXBlLnJ1c3QnXVxuXG4gIGl0ICd0b2tlbml6ZXMgc3RydWN0cycsIC0+XG4gICAgdG9rZW5zID0gZ3JhbW1hci50b2tlbml6ZUxpbmVzKCcnJ1xuICAgICAgcHViIHN0cnVjdCBNeVN0cnVjdDwnZm9vPiB7XG4gICAgICAgICAgcHViIG9uZTogdTMyLFxuICAgICAgICAgIHR3bzogT3B0aW9uPCdhLCBNeUVudW0+LFxuICAgICAgICAgIHRocmVlOiAmJ2ZvbyBpMzIsXG4gICAgICB9XG4gICAgICAnJycpXG4gICAgZXhwZWN0KHRva2Vuc1swXVswXSkudG9FcXVhbCB2YWx1ZTogJ3B1YicsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdzdG9yYWdlLm1vZGlmaWVyLnZpc2liaWxpdHkucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1swXVsyXSkudG9FcXVhbCB2YWx1ZTogJ3N0cnVjdCcsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdzdG9yYWdlLnR5cGUucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1swXVs0XSkudG9FcXVhbCB2YWx1ZTogJ015U3RydWN0Jywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ2VudGl0eS5uYW1lLnR5cGUucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1swXVs1XSkudG9FcXVhbCB2YWx1ZTogJzwnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnbWV0YS50eXBlX3BhcmFtcy5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzBdWzZdKS50b0VxdWFsIHZhbHVlOiAnXFwnJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ21ldGEudHlwZV9wYXJhbXMucnVzdCcsICdzdG9yYWdlLm1vZGlmaWVyLmxpZmV0aW1lLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbMF1bN10pLnRvRXF1YWwgdmFsdWU6ICdmb28nLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnbWV0YS50eXBlX3BhcmFtcy5ydXN0JywgJ3N0b3JhZ2UubW9kaWZpZXIubGlmZXRpbWUucnVzdCcsICdlbnRpdHkubmFtZS5saWZldGltZS5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzFdWzFdKS50b0VxdWFsIHZhbHVlOiAncHViJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ3N0b3JhZ2UubW9kaWZpZXIudmlzaWJpbGl0eS5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzJdWzNdKS50b0VxdWFsIHZhbHVlOiAnXFwnJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ3N0b3JhZ2UubW9kaWZpZXIubGlmZXRpbWUucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1syXVs0XSkudG9FcXVhbCB2YWx1ZTogJ2EnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnc3RvcmFnZS5tb2RpZmllci5saWZldGltZS5ydXN0JywgJ2VudGl0eS5uYW1lLmxpZmV0aW1lLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbM11bMl0pLnRvRXF1YWwgdmFsdWU6ICdcXCcnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnc3RvcmFnZS5tb2RpZmllci5saWZldGltZS5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzNdWzNdKS50b0VxdWFsIHZhbHVlOiAnZm9vJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ3N0b3JhZ2UubW9kaWZpZXIubGlmZXRpbWUucnVzdCcsICdlbnRpdHkubmFtZS5saWZldGltZS5ydXN0J11cblxuICBpdCAndG9rZW5pemVzIHR1cGxlIHN0cnVjdHMnLCAtPlxuICAgIHt0b2tlbnN9ID0gZ3JhbW1hci50b2tlbml6ZUxpbmUoJ3B1YiBzdHJ1Y3QgTXlUdXBsZVN0cnVjdChwdWIgaTMyLCB1MzIpOycpXG4gICAgZXhwZWN0KHRva2Vuc1swXSkudG9FcXVhbCB2YWx1ZTogJ3B1YicsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdzdG9yYWdlLm1vZGlmaWVyLnZpc2liaWxpdHkucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1syXSkudG9FcXVhbCB2YWx1ZTogJ3N0cnVjdCcsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdzdG9yYWdlLnR5cGUucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1s0XSkudG9FcXVhbCB2YWx1ZTogJ015VHVwbGVTdHJ1Y3QnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnZW50aXR5Lm5hbWUudHlwZS5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzZdKS50b0VxdWFsIHZhbHVlOiAncHViJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ3N0b3JhZ2UubW9kaWZpZXIudmlzaWJpbGl0eS5ydXN0J11cblxuICBpdCAndG9rZW5pemVzIHVuaW9ucycsIC0+XG4gICAgdG9rZW5zID0gZ3JhbW1hci50b2tlbml6ZUxpbmVzKCcnJ1xuICAgICAgcHViIHVuaW9uIE15VW5pb248J2Zvbz4ge1xuICAgICAgICAgIHB1YiBvbmU6IHUzMixcbiAgICAgICAgICB0d286IE9wdGlvbjwnYSwgTXlFbnVtPixcbiAgICAgICAgICB0aHJlZTogJidmb28gaTMyLFxuICAgICAgfVxuICAgICAgJycnKVxuICAgIGV4cGVjdCh0b2tlbnNbMF1bMF0pLnRvRXF1YWwgdmFsdWU6ICdwdWInLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnc3RvcmFnZS5tb2RpZmllci52aXNpYmlsaXR5LnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbMF1bMl0pLnRvRXF1YWwgdmFsdWU6ICd1bmlvbicsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdzdG9yYWdlLnR5cGUucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1swXVs0XSkudG9FcXVhbCB2YWx1ZTogJ015VW5pb24nLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnZW50aXR5Lm5hbWUudHlwZS5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzBdWzVdKS50b0VxdWFsIHZhbHVlOiAnPCcsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdtZXRhLnR5cGVfcGFyYW1zLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbMF1bNl0pLnRvRXF1YWwgdmFsdWU6ICdcXCcnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnbWV0YS50eXBlX3BhcmFtcy5ydXN0JywgJ3N0b3JhZ2UubW9kaWZpZXIubGlmZXRpbWUucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1swXVs3XSkudG9FcXVhbCB2YWx1ZTogJ2ZvbycsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdtZXRhLnR5cGVfcGFyYW1zLnJ1c3QnLCAnc3RvcmFnZS5tb2RpZmllci5saWZldGltZS5ydXN0JywgJ2VudGl0eS5uYW1lLmxpZmV0aW1lLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbMV1bMV0pLnRvRXF1YWwgdmFsdWU6ICdwdWInLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnc3RvcmFnZS5tb2RpZmllci52aXNpYmlsaXR5LnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbMl1bM10pLnRvRXF1YWwgdmFsdWU6ICdcXCcnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnc3RvcmFnZS5tb2RpZmllci5saWZldGltZS5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzJdWzRdKS50b0VxdWFsIHZhbHVlOiAnYScsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdzdG9yYWdlLm1vZGlmaWVyLmxpZmV0aW1lLnJ1c3QnLCAnZW50aXR5Lm5hbWUubGlmZXRpbWUucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1szXVsyXSkudG9FcXVhbCB2YWx1ZTogJ1xcJycsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdzdG9yYWdlLm1vZGlmaWVyLmxpZmV0aW1lLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbM11bM10pLnRvRXF1YWwgdmFsdWU6ICdmb28nLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnc3RvcmFnZS5tb2RpZmllci5saWZldGltZS5ydXN0JywgJ2VudGl0eS5uYW1lLmxpZmV0aW1lLnJ1c3QnXVxuXG5cbiAgaXQgJ3Rva2VuaXplcyB0eXBlIGFsaWFzZXMnLCAtPlxuICAgIHt0b2tlbnN9ID0gZ3JhbW1hci50b2tlbml6ZUxpbmUoJ3R5cGUgTXlUeXBlID0gdTMyOycpXG4gICAgZXhwZWN0KHRva2Vuc1swXSkudG9FcXVhbCB2YWx1ZTogJ3R5cGUnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnc3RvcmFnZS50eXBlLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbMl0pLnRvRXF1YWwgdmFsdWU6ICdNeVR5cGUnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnZW50aXR5Lm5hbWUudHlwZS5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzRdKS50b0VxdWFsIHZhbHVlOiAndTMyJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ3N0b3JhZ2UudHlwZS5jb3JlLnJ1c3QnXVxuXG4gIGl0ICd0b2tlbml6ZXMgY29uc3RhbnRzJywgLT5cbiAgICB7dG9rZW5zfSA9IGdyYW1tYXIudG9rZW5pemVMaW5lKCdzdGF0aWMgTVlfQ09OU1RBTlQ6ICZzdHIgPSBcImhlbGxvXCI7JylcbiAgICBleHBlY3QodG9rZW5zWzBdKS50b0VxdWFsIHZhbHVlOiAnc3RhdGljJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ3N0b3JhZ2UubW9kaWZpZXIuc3RhdGljLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbMl0pLnRvRXF1YWwgdmFsdWU6ICcmJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ2tleXdvcmQub3BlcmF0b3Iuc2lnaWwucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1szXSkudG9FcXVhbCB2YWx1ZTogJ3N0cicsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdzdG9yYWdlLnR5cGUuY29yZS5ydXN0J11cblxuICBpdCAndG9rZW5pemVzIHRyYWl0cycsIC0+XG4gICAgdG9rZW5zID0gZ3JhbW1hci50b2tlbml6ZUxpbmVzKCcnJ1xuICAgICAgcHViIHRyYWl0IE15VHJhaXQge1xuICAgICAgICAgIGZuIGNyZWF0ZV9zb21ldGhpbmcgKHBhcmFtOiAmc3RyLCBtdXQgb3RoZXJfcGFyYW06IHUzMikgLT4gT3B0aW9uPFNlbGY+O1xuICAgICAgICAgIGZuIGRvX3doYXRldmVyPFQ6IFNlbmQrU2hhcmUrV2hhdGV2ZXIsIFU6IEZyZWV6ZT4gKHBhcmFtOiAmVCwgb3RoZXJfcGFyYW06IHUzMikgLT4gT3B0aW9uPFU+O1xuICAgICAgICAgIGZuIGRvX2FsbF90aGVfd29yayAoJm11dCBzZWxmLCBwYXJhbTogJnN0ciwgbXV0IG90aGVyX3BhcmFtOiB1MzIpIC0+IGJvb2w7XG4gICAgICAgICAgZm4gZG9fZXZlbl9tb3JlPCdhLCBUOiBTZW5kK1doYXRldmVyLCBVOiBTb21ldGhpbmc8VD4rRnJlZXplPiAoJidhIG11dCBzZWxmLCBwYXJhbTogJlQpIC0+ICYnYSBVO1xuICAgICAgfVxuICAgICAgJycnKVxuICAgIGV4cGVjdCh0b2tlbnNbMF1bMF0pLnRvRXF1YWwgdmFsdWU6ICdwdWInLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnc3RvcmFnZS5tb2RpZmllci52aXNpYmlsaXR5LnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbMF1bMl0pLnRvRXF1YWwgdmFsdWU6ICd0cmFpdCcsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdzdG9yYWdlLnR5cGUucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1swXVs0XSkudG9FcXVhbCB2YWx1ZTogJ015VHJhaXQnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnZW50aXR5Lm5hbWUudHlwZS5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzFdWzFdKS50b0VxdWFsIHZhbHVlOiAnZm4nLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAna2V5d29yZC5vdGhlci5mbi5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzFdWzEyXSkudG9FcXVhbCB2YWx1ZTogJ09wdGlvbicsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdzdG9yYWdlLnR5cGUuY29yZS5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzFdWzE0XSkudG9FcXVhbCB2YWx1ZTogJ1NlbGYnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnbWV0YS50eXBlX3BhcmFtcy5ydXN0JywgJ3N0b3JhZ2UudHlwZS5jb3JlLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbMl1bMV0pLnRvRXF1YWwgdmFsdWU6ICdmbicsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdrZXl3b3JkLm90aGVyLmZuLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbMl1bNl0pLnRvRXF1YWwgdmFsdWU6ICdTZW5kJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ21ldGEudHlwZV9wYXJhbXMucnVzdCcsICdzdXBwb3J0LnR5cGUubWFya2VyLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbMl1bN10pLnRvRXF1YWwgdmFsdWU6ICcrU2hhcmUrV2hhdGV2ZXIsIFU6IEZyZWV6ZScsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdtZXRhLnR5cGVfcGFyYW1zLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbM11bMV0pLnRvRXF1YWwgdmFsdWU6ICdmbicsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdrZXl3b3JkLm90aGVyLmZuLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbNF1bMV0pLnRvRXF1YWwgdmFsdWU6ICdmbicsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdrZXl3b3JkLm90aGVyLmZuLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbNF1bNV0pLnRvRXF1YWwgdmFsdWU6ICdcXCcnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnbWV0YS50eXBlX3BhcmFtcy5ydXN0JywgJ3N0b3JhZ2UubW9kaWZpZXIubGlmZXRpbWUucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1s0XVs2XSkudG9FcXVhbCB2YWx1ZTogJ2EnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnbWV0YS50eXBlX3BhcmFtcy5ydXN0JywgJ3N0b3JhZ2UubW9kaWZpZXIubGlmZXRpbWUucnVzdCcsICdlbnRpdHkubmFtZS5saWZldGltZS5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzRdWzExXSkudG9FcXVhbCB2YWx1ZTogJ1QnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnbWV0YS50eXBlX3BhcmFtcy5ydXN0JywgJ21ldGEudHlwZV9wYXJhbXMucnVzdCddXG5cbiAgaXQgJ3Rva2VuaXplcyBpbXBscycsIC0+XG4gICAgdG9rZW5zID0gZ3JhbW1hci50b2tlbml6ZUxpbmVzKCcnJ1xuICAgICAgaW1wbCBNeVRyYWl0IHtcbiAgICAgICAgICBmbiBkb19zb21ldGhpbmcgKCkgeyB1bmltcGxlbWVudGVkISgpIH1cbiAgICAgIH1cbiAgICAgICcnJylcbiAgICBleHBlY3QodG9rZW5zWzBdWzBdKS50b0VxdWFsIHZhbHVlOiAnaW1wbCcsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdzdG9yYWdlLnR5cGUucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1swXVsyXSkudG9FcXVhbCB2YWx1ZTogJ015VHJhaXQnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnZW50aXR5Lm5hbWUudHlwZS5ydXN0J11cblxuICBpdCAndG9rZW5pemVzIHRyYWl0IGltcGxzJywgLT5cbiAgICB0b2tlbnMgPSBncmFtbWFyLnRva2VuaXplTGluZXMoJycnXG4gICAgICBpbXBsIE15VHJhaXQgZm9yIE15U3RydWN0IHtcbiAgICAgICAgICBmbiBjcmVhdGVfc29tZXRoaW5nIChwYXJhbTogJnN0ciwgbXV0IG90aGVyX3BhcmFtOiB1MzIpIC0+IE9wdGlvbjxTZWxmPiB7IHVuaW1wbGVtZW50ZWQhKCkgfVxuICAgICAgICAgIGZuIGRvX3doYXRldmVyPFQ6IFNlbmQrU2hhcmUrV2hhdGV2ZXIsIFU6IEZyZWV6ZT4gKHBhcmFtOiAmVCwgb3RoZXJfcGFyYW06IHUzMikgLT4gT3B0aW9uPFU+IHsgdW5pbXBsZW1lbnRlZCEoKSB9XG4gICAgICAgICAgZm4gZG9fYWxsX3RoZV93b3JrICgmbXV0IHNlbGYsIHBhcmFtOiAmc3RyLCBtdXQgb3RoZXJfcGFyYW06IHUzMikgLT4gYm9vbCB7IHVuaW1wbGVtZW50ZWQhKCkgfVxuICAgICAgICAgIGZuIGRvX2V2ZW5fbW9yZTwnYSwgVDogU2VuZCtXaGF0ZXZlciwgVTogU29tZXRoaW5nPFQ+K0ZyZWV6ZT4gKCYnYSBtdXQgc2VsZiwgcGFyYW06ICZUKSAtPiAmJ2EgVSB7IHVuaW1wbGVtZW50ZWQhKCkgfVxuICAgICAgfVxuICAgICAgJycnKVxuICAgIGV4cGVjdCh0b2tlbnNbMF1bMF0pLnRvRXF1YWwgdmFsdWU6ICdpbXBsJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ3N0b3JhZ2UudHlwZS5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzBdWzJdKS50b0VxdWFsIHZhbHVlOiAnTXlUcmFpdCcsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdlbnRpdHkubmFtZS50eXBlLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbMF1bNF0pLnRvRXF1YWwgdmFsdWU6ICdmb3InLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnc3RvcmFnZS50eXBlLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbMF1bNl0pLnRvRXF1YWwgdmFsdWU6ICdNeVN0cnVjdCcsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdlbnRpdHkubmFtZS50eXBlLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbMV1bMV0pLnRvRXF1YWwgdmFsdWU6ICdmbicsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdrZXl3b3JkLm90aGVyLmZuLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbMV1bMTJdKS50b0VxdWFsIHZhbHVlOiAnT3B0aW9uJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ3N0b3JhZ2UudHlwZS5jb3JlLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbMV1bMTRdKS50b0VxdWFsIHZhbHVlOiAnU2VsZicsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdtZXRhLnR5cGVfcGFyYW1zLnJ1c3QnLCAnc3RvcmFnZS50eXBlLmNvcmUucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1syXVsxXSkudG9FcXVhbCB2YWx1ZTogJ2ZuJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ2tleXdvcmQub3RoZXIuZm4ucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1syXVs2XSkudG9FcXVhbCB2YWx1ZTogJ1NlbmQnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnbWV0YS50eXBlX3BhcmFtcy5ydXN0JywgJ3N1cHBvcnQudHlwZS5tYXJrZXIucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1syXVs3XSkudG9FcXVhbCB2YWx1ZTogJytTaGFyZStXaGF0ZXZlciwgVTogRnJlZXplJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ21ldGEudHlwZV9wYXJhbXMucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1szXVsxXSkudG9FcXVhbCB2YWx1ZTogJ2ZuJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ2tleXdvcmQub3RoZXIuZm4ucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1s0XVsxXSkudG9FcXVhbCB2YWx1ZTogJ2ZuJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ2tleXdvcmQub3RoZXIuZm4ucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1s0XVs1XSkudG9FcXVhbCB2YWx1ZTogJ1xcJycsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdtZXRhLnR5cGVfcGFyYW1zLnJ1c3QnLCAnc3RvcmFnZS5tb2RpZmllci5saWZldGltZS5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzRdWzZdKS50b0VxdWFsIHZhbHVlOiAnYScsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdtZXRhLnR5cGVfcGFyYW1zLnJ1c3QnLCAnc3RvcmFnZS5tb2RpZmllci5saWZldGltZS5ydXN0JywgJ2VudGl0eS5uYW1lLmxpZmV0aW1lLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbNF1bMTFdKS50b0VxdWFsIHZhbHVlOiAnVCcsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdtZXRhLnR5cGVfcGFyYW1zLnJ1c3QnLCAnbWV0YS50eXBlX3BhcmFtcy5ydXN0J11cblxuICBpdCAndG9rZW5pemVzIGdlbmVyaWNzIGFuZCBsaWZldGltZXMgaW4gZW51bXMnICAjIFRPRE9cblxuICBpdCAndG9rZW5pemVzIGdlbmVyaWNzIGFuZCBsaWZldGltZXMgaW4gc3RydWN0cycgICMgVE9ET1xuXG4gIGl0ICd0b2tlbml6ZXMgZ2VuZXJpY3MgYW5kIGxpZmV0aW1lcyBpbiBpbXBscycgICMgVE9ET1xuXG4gIGl0ICd0b2tlbml6ZXMgZ2VuZXJpY3MgYW5kIGxpZmV0aW1lcyBpbiBmdW5jdGlvbnMnICAjIFRPRE9cblxuICBpdCAndG9rZW5pemVzIGZ1bmN0aW9uIGRlZmludGlvbnMnICAjIFRPRE9cblxuICBpdCAndG9rZW5pemVzIGZ1bmN0aW9uIGNhbGxzJyAgICMgVE9ET1xuXG4gIGl0ICd0b2tlbml6ZXMgY2xvc3VyZXMnICAgIyBUT0RPXG5cbiAgI1xuICAjIElzc3Vlc1xuICAjXG5cbiAgaXQgJ3Rva2VuaXplcyBsb29wIGV4cHJlc3Npb24gbGFiZWxzIChpc3N1ZSBcXFxcIzIpJywgLT5cbiAgICB0b2tlbnMgPSBncmFtbWFyLnRva2VuaXplTGluZXMoJycnXG4gICAgICBpbmZpbml0eTogbG9vcCB7XG4gICAgICAgICAgZG9fc2VyaW91c19zdHVmZigpO1xuICAgICAgICAgIHVzZV9hX2xldHRlcignWicpO1xuICAgICAgICAgIGJyZWFrICdpbmZpbml0eTtcbiAgICAgIH1cbiAgICAgICcnJylcbiAgICAjIEZJWE1FOiBNaXNzaW5nIGxhYmVsIGRldGVjdGlvbj9cbiAgICBleHBlY3QodG9rZW5zWzBdWzBdKS50b0VxdWFsIHZhbHVlOiAnaW5maW5pdHk6ICcsIHNjb3BlczogWydzb3VyY2UucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1syXVszXSkudG9FcXVhbCB2YWx1ZTogJ1xcJ1pcXCcnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnc3RyaW5nLnF1b3RlZC5zaW5nbGUucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1szXVszXSkudG9FcXVhbCB2YWx1ZTogJ1xcJycsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdzdG9yYWdlLm1vZGlmaWVyLmxpZmV0aW1lLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbM11bNF0pLnRvRXF1YWwgdmFsdWU6ICdpbmZpbml0eScsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdzdG9yYWdlLm1vZGlmaWVyLmxpZmV0aW1lLnJ1c3QnLCAnZW50aXR5Lm5hbWUubGlmZXRpbWUucnVzdCddXG5cbiAgaXQgJ3Rva2VuaXplcyBpc2l6ZS91c2l6ZSB0eXBlIHN1ZmZpeGVzIChpc3N1ZSBcXFxcIzIyKScsIC0+XG4gICAgZm9yIHQgaW4gWydpc2l6ZScsICd1c2l6ZSddXG4gICAgICB7dG9rZW5zfSA9IGdyYW1tYXIudG9rZW5pemVMaW5lKFwibGV0IHggPSAxMjMje3R9O1wiKVxuICAgICAgZXhwZWN0KHRva2Vuc1s0XSkudG9FcXVhbCB2YWx1ZTogXCIxMjMje3R9XCIsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdjb25zdGFudC5udW1lcmljLmludGVnZXIuZGVjaW1hbC5ydXN0J11cblxuICBpdCAndG9rZW5pemVzIGZsb2F0IGxpdGVyYWxzIHdpdGhvdXQgKy8tIGFmdGVyIEUgKGlzc3VlIFxcXFwjMzApJywgLT5cbiAgICB7dG9rZW5zfSA9IGdyYW1tYXIudG9rZW5pemVMaW5lKCdsZXQgeCA9IDEuMjM0NWU2OycpXG4gICAgZXhwZWN0KHRva2Vuc1s0XSkudG9FcXVhbCB2YWx1ZTogJzEuMjM0NWU2Jywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ2NvbnN0YW50Lm51bWVyaWMuZmxvYXQucnVzdCddXG5cbiAgaXQgJ3Rva2VuaXplcyBuZXN0ZWQgZ2VuZXJpY3MgKGlzc3VlIFxcXFwjMzMsIFxcXFwjMzcpJywgLT5cbiAgICB7dG9rZW5zfSA9IGdyYW1tYXIudG9rZW5pemVMaW5lKCdsZXQgeDogVmVjPFZlYzx1OD4+ID0gVmVjOjpuZXcoKTsnKVxuICAgICMgRklYTUU6IDwgYW5kID4gYXJlIHRva2VuaXplZCBhcyBjb21wYXJpc29uIGtleXdvcmRzPyA6KFxuICAgICNleHBlY3QodG9rZW5zWzNdKS50b0VxdWFsIHZhbHVlOiAnVmVjPCcsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdzdG9yYWdlLmNsYXNzLnN0ZC5ydXN0J11cbiAgICAjZXhwZWN0KHRva2Vuc1s0XSkudG9FcXVhbCB2YWx1ZTogJ1ZlYzwnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnc3RvcmFnZS5jbGFzcy5zdGQucnVzdCddXG4gICAgI2V4cGVjdCh0b2tlbnNbNV0pLnRvRXF1YWwgdmFsdWU6ICd1OCcsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdzdG9yYWdlLnR5cGUuY29yZS5ydXN0J11cblxuICBpdCAndG9rZW5pemVzID09IHByb3Blcmx5IChpc3N1ZSBcXFxcIzQwKScsIC0+XG4gICAgdG9rZW5zID0gZ3JhbW1hci50b2tlbml6ZUxpbmVzKCcnJ1xuICAgICAgc3RydWN0IEZvbyB7IHg6IGkzMiB9XG4gICAgICBpZiB4ID09IDEgeyB9XG4gICAgICAnJycpXG4gICAgZXhwZWN0KHRva2Vuc1sxXVsyXSkudG9FcXVhbCB2YWx1ZTogJz09Jywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ2tleXdvcmQub3BlcmF0b3IuY29tcGFyaXNvbi5ydXN0J11cblxuICBpdCAndG9rZW5pemVzIGNvbnN0IGZ1bmN0aW9uIHBhcmFtZXRlcnMgKGlzc3VlIFxcXFwjNTIpJywgLT5cbiAgICB0b2tlbnMgPSBncmFtbWFyLnRva2VuaXplTGluZXMoJycnXG4gICAgICBmbiBmb28oYmFyOiAqY29uc3QgaTMyKSB7XG4gICAgICAgIGxldCBfID0gMTIzNCBhcyAqY29uc3QgdTMyO1xuICAgICAgfVxuICAgICAgJycnKVxuICAgIGV4cGVjdCh0b2tlbnNbMF1bNF0pLnRvRXF1YWwgdmFsdWU6ICcqJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ2tleXdvcmQub3BlcmF0b3Iuc2lnaWwucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1swXVs1XSkudG9FcXVhbCB2YWx1ZTogJ2NvbnN0Jywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ3N0b3JhZ2UubW9kaWZpZXIuY29uc3QucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1sxXVs5XSkudG9FcXVhbCB2YWx1ZTogJyonLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAna2V5d29yZC5vcGVyYXRvci5zaWdpbC5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzFdWzEwXSkudG9FcXVhbCB2YWx1ZTogJ2NvbnN0Jywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ3N0b3JhZ2UubW9kaWZpZXIuY29uc3QucnVzdCddXG5cbiAgaXQgJ3Rva2VuaXplcyBrZXl3b3JkcyBhbmQga25vd24gdHlwZXMgaW4gd3JhcHBlciBzdHJ1Y3RzIChpc3N1ZSBcXFxcIzU2KScsIC0+XG4gICAge3Rva2Vuc30gPSBncmFtbWFyLnRva2VuaXplTGluZSgncHViIHN0cnVjdCBGb29iYXIocHViIE9wdGlvbjxib29sPik7JylcbiAgICBleHBlY3QodG9rZW5zWzZdKS50b0VxdWFsIHZhbHVlOiAncHViJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ3N0b3JhZ2UubW9kaWZpZXIudmlzaWJpbGl0eS5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzhdKS50b0VxdWFsIHZhbHVlOiAnT3B0aW9uJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ3N0b3JhZ2UudHlwZS5jb3JlLnJ1c3QnXVxuICAgICMgRklYTUU6IDwgYW5kID4gYXJlIHRva2VuaXplZCBhcyBjb21wYXJpc29uIGtleXdvcmRzPyA6KFxuICAgIGV4cGVjdCh0b2tlbnNbMTBdKS50b0VxdWFsIHZhbHVlOiAnYm9vbCcsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdzdG9yYWdlLnR5cGUuY29yZS5ydXN0J11cblxuICBpdCAndG9rZW5pemVzIGxpZmV0aW1lcyBpbiBhc3NvY2lhdGVkIHR5cGUgZGVmaW5pdGlvbnMgKGlzc3VlIFxcXFwjNTUpJywgLT5cbiAgICB0b2tlbnMgPSBncmFtbWFyLnRva2VuaXplTGluZXMoJycnXG4gICAgICB0cmFpdCBGb28ge1xuICAgICAgICB0eXBlIEI6IEEgKyAnc3RhdGljO1xuICAgICAgfVxuICAgICcnJylcbiAgICBleHBlY3QodG9rZW5zWzFdWzVdKS50b0VxdWFsIHZhbHVlOiAnXFwnJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ3N0b3JhZ2UubW9kaWZpZXIubGlmZXRpbWUucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1sxXVs2XSkudG9FcXVhbCB2YWx1ZTogJ3N0YXRpYycsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdzdG9yYWdlLm1vZGlmaWVyLmxpZmV0aW1lLnJ1c3QnLCAnZW50aXR5Lm5hbWUubGlmZXRpbWUucnVzdCddXG5cbiAgaXQgJ3Rva2VuaXplcyB1bnNhZmUga2V5d29yZHMgaW4gZnVuY3Rpb24gYXJndW1lbnRzIChpc3N1ZSBcXFxcIzczKScsIC0+XG4gICAgdG9rZW5zID0gZ3JhbW1hci50b2tlbml6ZUxpbmVzKCcnJ1xuICAgICAgdW5zYWZlIGZuIGZvbygpO1xuICAgICAgZm4gZm9vKGY6IHVuc2FmZSBmbigpKTtcbiAgICAnJycpXG4gICAgZXhwZWN0KHRva2Vuc1swXVswXSkudG9FcXVhbCB2YWx1ZTogJ3Vuc2FmZScsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdrZXl3b3JkLm90aGVyLnVuc2FmZS5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzFdWzRdKS50b0VxdWFsIHZhbHVlOiAndW5zYWZlJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ2tleXdvcmQub3RoZXIudW5zYWZlLnJ1c3QnXVxuXG4gIGl0ICd0b2tlbml6ZXMgd2hlcmUgY2xhdXNlcyAoaXNzdWUgXFxcXCM1NyknLCAtPlxuICAgIHRva2VucyA9IGdyYW1tYXIudG9rZW5pemVMaW5lcygnJydcbiAgICAgIGltcGwgRm9vPEEsIEI+IHdoZXJlIHRleHQgeyB9XG4gICAgICBpbXBsIEZvbzxBLCBCPiBmb3IgQyB3aGVyZSB0ZXh0IHsgfVxuICAgICAgaW1wbCBGb288QSwgQj4gZm9yIEMge1xuICAgICAgICAgIGZuIGZvbzxBLCBCPiAtPiBDIHdoZXJlIHRleHQgeyB9XG4gICAgICB9XG4gICAgICBmbiBmb288QSwgQj4gLT4gQyB3aGVyZSB0ZXh0IHsgfVxuICAgICAgc3RydWN0IEZvbzxBLCBCPiB3aGVyZSB0ZXh0IHsgfVxuICAgICAgdHJhaXQgRm9vPEEsIEI+IDogQyB3aGVyZSB7IH1cbiAgICAnJycpXG4gICAgZXhwZWN0KHRva2Vuc1swXVs3XSkudG9FcXVhbCB2YWx1ZTogJ3doZXJlJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ2tleXdvcmQub3RoZXIud2hlcmUucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1sxXVsxMV0pLnRvRXF1YWwgdmFsdWU6ICd3aGVyZScsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdrZXl3b3JkLm90aGVyLndoZXJlLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbM11bOF0pLnRvRXF1YWwgdmFsdWU6ICd3aGVyZScsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdrZXl3b3JkLm90aGVyLndoZXJlLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbNV1bN10pLnRvRXF1YWwgdmFsdWU6ICd3aGVyZScsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdrZXl3b3JkLm90aGVyLndoZXJlLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbNl1bN10pLnRvRXF1YWwgdmFsdWU6ICd3aGVyZScsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdrZXl3b3JkLm90aGVyLndoZXJlLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbN11bN10pLnRvRXF1YWwgdmFsdWU6ICd3aGVyZScsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdrZXl3b3JkLm90aGVyLndoZXJlLnJ1c3QnXVxuXG4gIGl0ICd0b2tlbml6ZXMgY29tbWVudHMgaW4gYXR0cmlidXRlcyAoaXNzdWUgXFxcXCM5NSknLCAtPlxuICAgIHRva2VucyA9IGdyYW1tYXIudG9rZW5pemVMaW5lcygnJydcbiAgICAgICNbXG4gICAgICAvKiBibG9jayBjb21tZW50ICovXG4gICAgICAvLyBsaW5lIGNvbW1lbnRcbiAgICAgIGRlcml2ZShEZWJ1ZyldXG4gICAgICBzdHJ1Y3QgRCB7IH1cbiAgICAnJycpXG4gICAgZXhwZWN0KHRva2Vuc1swXVswXSkudG9FcXVhbCB2YWx1ZTogJyNbJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ21ldGEuYXR0cmlidXRlLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbMV1bMV0pLnRvRXF1YWwgdmFsdWU6ICcgYmxvY2sgY29tbWVudCAnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnbWV0YS5hdHRyaWJ1dGUucnVzdCcsICdjb21tZW50LmJsb2NrLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbMl1bMV0pLnRvRXF1YWwgdmFsdWU6ICcgbGluZSBjb21tZW50Jywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ21ldGEuYXR0cmlidXRlLnJ1c3QnLCAnY29tbWVudC5saW5lLmRvdWJsZS1zbGFzaC5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzNdWzBdKS50b0VxdWFsIHZhbHVlOiAnZGVyaXZlKERlYnVnKScsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdtZXRhLmF0dHJpYnV0ZS5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzRdWzBdKS50b0VxdWFsIHZhbHVlOiAnc3RydWN0Jywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ3N0b3JhZ2UudHlwZS5ydXN0J11cblxuICBpdCAnZG9lcyBub3QgdG9rZW5pemUgYGZuYCBpbiBhcmd1bWVudCBuYW1lIGFzIGEga2V5d29yZCBpbmNvcnJlY3RseSAoaXNzdWUgXFxcXCM5OSknLCAtPlxuICAgIHt0b2tlbnN9ID0gZ3JhbW1hci50b2tlbml6ZUxpbmUoJ2ZuIGZvbyhmbl94OiAoKSkge30nKVxuICAgIGV4cGVjdCh0b2tlbnNbMF0pLnRvRXF1YWwgdmFsdWU6ICdmbicsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdrZXl3b3JkLm90aGVyLmZuLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbMV0pLnRvRXF1YWwgdmFsdWU6ICcgJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzJdKS50b0VxdWFsIHZhbHVlIDogJ2ZvbycsIHNjb3BlcyA6IFsgJ3NvdXJjZS5ydXN0JywgJ2VudGl0eS5uYW1lLmZ1bmN0aW9uLnJ1c3QnIF1cbiAgICBleHBlY3QodG9rZW5zWzNdKS50b0VxdWFsIHZhbHVlIDogJyhmbl94OiAoKSkgJywgc2NvcGVzIDogWyAnc291cmNlLnJ1c3QnIF1cblxuICBpdCAndG9rZW5pemVzIGZ1bmN0aW9uIGNhbGxzIHdpdGggdHlwZSBhcmd1bWVudHMgKGlzc3VlIFxcXFwjOTgpJywgLT5cbiAgICB0b2tlbnMgPSBncmFtbWFyLnRva2VuaXplTGluZXMoJycnXG4gICAgICBmbiBtYWluKCkge1xuICAgICAgZm9vOjpiYXI6OjxpMzIsICgpPigpO1xuICAgICAgX2Z1bmM6OjxpMzIsICgpPigpO1xuICAgICAgfVxuICAgICcnJylcbiAgICBleHBlY3QodG9rZW5zWzFdWzBdKS50b0VxdWFsIHZhbHVlOiAnZm9vJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzFdWzFdKS50b0VxdWFsIHZhbHVlOiAnOjonLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAna2V5d29yZC5vcGVyYXRvci5taXNjLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbMV1bMl0pLnRvRXF1YWwgdmFsdWU6ICdiYXInLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnZW50aXR5Lm5hbWUuZnVuY3Rpb24ucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1sxXVszXSkudG9FcXVhbCB2YWx1ZTogJzo6Jywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ2tleXdvcmQub3BlcmF0b3IubWlzYy5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzFdWzRdKS50b0VxdWFsIHZhbHVlOiAnPCcsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdtZXRhLnR5cGVfcGFyYW1zLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbMV1bNV0pLnRvRXF1YWwgdmFsdWU6ICdpMzInLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnbWV0YS50eXBlX3BhcmFtcy5ydXN0JywgJ3N0b3JhZ2UudHlwZS5jb3JlLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbMV1bNl0pLnRvRXF1YWwgdmFsdWU6ICcsICgpJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ21ldGEudHlwZV9wYXJhbXMucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1sxXVs3XSkudG9FcXVhbCB2YWx1ZTogJz4nLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnbWV0YS50eXBlX3BhcmFtcy5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzFdWzhdKS50b0VxdWFsIHZhbHVlOiAnKCcsIHNjb3BlczogWydzb3VyY2UucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1sxXVs5XSkudG9FcXVhbCB2YWx1ZTogJyk7Jywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0J11cblxuICAgIGV4cGVjdCh0b2tlbnNbMl1bMF0pLnRvRXF1YWwgdmFsdWU6ICdfZnVuYycsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdlbnRpdHkubmFtZS5mdW5jdGlvbi5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzJdWzFdKS50b0VxdWFsIHZhbHVlOiAnOjonLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAna2V5d29yZC5vcGVyYXRvci5taXNjLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbMl1bMl0pLnRvRXF1YWwgdmFsdWU6ICc8Jywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ21ldGEudHlwZV9wYXJhbXMucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1syXVszXSkudG9FcXVhbCB2YWx1ZTogJ2kzMicsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdtZXRhLnR5cGVfcGFyYW1zLnJ1c3QnLCAnc3RvcmFnZS50eXBlLmNvcmUucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1syXVs0XSkudG9FcXVhbCB2YWx1ZTogJywgKCknLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnbWV0YS50eXBlX3BhcmFtcy5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzJdWzVdKS50b0VxdWFsIHZhbHVlOiAnPicsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdtZXRhLnR5cGVfcGFyYW1zLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbMl1bNl0pLnRvRXF1YWwgdmFsdWU6ICcoJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzJdWzddKS50b0VxdWFsIHZhbHVlOiAnKTsnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnXVxuXG4gIGl0ICd0b2tlbml6ZXMgZnVuY3Rpb24gY2FsbHMgd2l0aG91dCB0eXBlIGFyZ3VtZW50cyAoaXNzdWUgXFxcXCM5OCknLCAtPlxuICAgIHRva2VucyA9IGdyYW1tYXIudG9rZW5pemVMaW5lcygnJydcbiAgICAgIGZuIG1haW4oKSB7XG4gICAgICBmb28uY2FsbCgpO1xuICAgICAgfVxuICAgICcnJylcbiAgICBleHBlY3QodG9rZW5zWzFdWzBdKS50b0VxdWFsIHZhbHVlOiAnZm9vLicsIHNjb3BlczogWydzb3VyY2UucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1sxXVsxXSkudG9FcXVhbCB2YWx1ZTogJ2NhbGwnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnZW50aXR5Lm5hbWUuZnVuY3Rpb24ucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1sxXVsyXSkudG9FcXVhbCB2YWx1ZTogJygnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbMV1bM10pLnRvRXF1YWwgdmFsdWU6ICcpOycsIHNjb3BlczogWydzb3VyY2UucnVzdCddXG5cbiAgaXQgJ3Rva2VuaXplcyBmdW5jdGlvbiBuYW1lcyBjb3JyZWN0bHkgKGlzc3VlIFxcXFwjOTgpJywgLT5cbiAgICB0b2tlbnMgPSBncmFtbWFyLnRva2VuaXplTGluZXMoJycnXG4gICAgICBmbiBtYWluKCkge1xuICAgICAgYSgpO1xuICAgICAgYTEoKTtcbiAgICAgIGFfKCk7XG4gICAgICBhXzEoKTtcbiAgICAgIGExXygpO1xuICAgICAgX2EoKTtcbiAgICAgIF8wKCk7XG4gICAgICBfYTAoKTtcbiAgICAgIF8wYSgpO1xuICAgICAgX18oKTtcbiAgICAgIH1cbiAgICAnJycpXG4gICAgZXhwZWN0KHRva2Vuc1sxXVswXSkudG9FcXVhbCB2YWx1ZTogJ2EnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnZW50aXR5Lm5hbWUuZnVuY3Rpb24ucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1syXVswXSkudG9FcXVhbCB2YWx1ZTogJ2ExJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ2VudGl0eS5uYW1lLmZ1bmN0aW9uLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbM11bMF0pLnRvRXF1YWwgdmFsdWU6ICdhXycsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdlbnRpdHkubmFtZS5mdW5jdGlvbi5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzRdWzBdKS50b0VxdWFsIHZhbHVlOiAnYV8xJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ2VudGl0eS5uYW1lLmZ1bmN0aW9uLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbNV1bMF0pLnRvRXF1YWwgdmFsdWU6ICdhMV8nLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnZW50aXR5Lm5hbWUuZnVuY3Rpb24ucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1s2XVswXSkudG9FcXVhbCB2YWx1ZTogJ19hJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ2VudGl0eS5uYW1lLmZ1bmN0aW9uLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbN11bMF0pLnRvRXF1YWwgdmFsdWU6ICdfMCcsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdlbnRpdHkubmFtZS5mdW5jdGlvbi5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzhdWzBdKS50b0VxdWFsIHZhbHVlOiAnX2EwJywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ2VudGl0eS5uYW1lLmZ1bmN0aW9uLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbOV1bMF0pLnRvRXF1YWwgdmFsdWU6ICdfMGEnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnZW50aXR5Lm5hbWUuZnVuY3Rpb24ucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1sxMF1bMF0pLnRvRXF1YWwgdmFsdWU6ICdfXycsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdlbnRpdHkubmFtZS5mdW5jdGlvbi5ydXN0J11cblxuICBpdCAndG9rZW5pemVzIGBhc2AgYXMgYW4gb3BlcmF0b3IgKGlzc3VlIFxcXFwjMTEwKScsIC0+XG4gICAge3Rva2Vuc30gPSBncmFtbWFyLnRva2VuaXplTGluZSgnbGV0IGkgPSAxMCBhcyBmMzI7JylcbiAgICBleHBlY3QodG9rZW5zWzBdKS50b0VxdWFsIHZhbHVlOiAnbGV0Jywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ2tleXdvcmQub3RoZXIucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1syXSkudG9FcXVhbCB2YWx1ZTogJz0nLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAna2V5d29yZC5vcGVyYXRvci5hc3NpZ25tZW50LnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbNF0pLnRvRXF1YWwgdmFsdWU6ICcxMCcsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdjb25zdGFudC5udW1lcmljLmludGVnZXIuZGVjaW1hbC5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzZdKS50b0VxdWFsIHZhbHVlOiAnYXMnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAna2V5d29yZC5vcGVyYXRvci5taXNjLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbOF0pLnRvRXF1YWwgdmFsdWU6ICdmMzInLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnc3RvcmFnZS50eXBlLmNvcmUucnVzdCddXG5cbiAgaXQgJ3Rva2VuaXplcyBhIHJlc2VydmVkIGtleXdvcmQgYXMgZGVwcmVjYXRlZCAoaXNzdWUgXFxcXCM5NCknLCAtPlxuICAgIHt0b2tlbnN9ID0gZ3JhbW1hci50b2tlbml6ZUxpbmUoJ2xldCBwcml2ID0gMTA7JylcbiAgICBleHBlY3QodG9rZW5zWzBdKS50b0VxdWFsIHZhbHVlOiAnbGV0Jywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ2tleXdvcmQub3RoZXIucnVzdCddXG4gICAgZXhwZWN0KHRva2Vuc1syXSkudG9FcXVhbCB2YWx1ZTogJ3ByaXYnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnaW52YWxpZC5kZXByZWNhdGVkLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbNF0pLnRvRXF1YWwgdmFsdWU6ICc9Jywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ2tleXdvcmQub3BlcmF0b3IuYXNzaWdubWVudC5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzZdKS50b0VxdWFsIHZhbHVlOiAnMTAnLCBzY29wZXM6IFsnc291cmNlLnJ1c3QnLCAnY29uc3RhbnQubnVtZXJpYy5pbnRlZ2VyLmRlY2ltYWwucnVzdCddXG5cbiAgaXQgJ3Rva2VuaXplcyB0eXBlcyBpbiBgaW1wbGAgc3RhdGVtZW50cyBjb3JyZWN0bHkgKGlzc3VlIFxcXFwjNyknLCAtPlxuICAgIHRva2VucyA9IGdyYW1tYXIudG9rZW5pemVMaW5lcygnJydcbiAgICAgIHN0cnVjdCBNeU9iamVjdDwnYT4ge1xuICAgICAgICAgIG15c3RyOiAmJ2Egc3RyXG4gICAgICB9XG4gICAgICBpbXBsPCdhPiBNeU9iamVjdDwnYT4ge1xuICAgICAgICAgIGZuIHByaW50KCZzZWxmKSB7fVxuICAgICAgfVxuICAgICAgaW1wbDwnYT4gQ2xvbmUgZm9yIE15T2JqZWN0PCdhPiB7XG4gICAgICAgICAgZm4gY2xvbmUoJnNlbGYpIHt9XG4gICAgICB9XG4gICAgJycnKVxuICAgIGV4cGVjdCh0b2tlbnNbMF1bMl0pLnRvRXF1YWwgdmFsdWU6ICdNeU9iamVjdCcsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdlbnRpdHkubmFtZS50eXBlLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbM11bNl0pLnRvRXF1YWwgdmFsdWU6ICdNeU9iamVjdCcsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdlbnRpdHkubmFtZS50eXBlLnJ1c3QnXVxuICAgIGV4cGVjdCh0b2tlbnNbNl1bNl0pLnRvRXF1YWwgdmFsdWU6ICdDbG9uZScsIHNjb3BlczogWydzb3VyY2UucnVzdCcsICdzdXBwb3J0LnR5cGUuY29yZS5ydXN0J11cbiAgICBleHBlY3QodG9rZW5zWzZdWzEwXSkudG9FcXVhbCB2YWx1ZTogJ015T2JqZWN0Jywgc2NvcGVzOiBbJ3NvdXJjZS5ydXN0JywgJ2VudGl0eS5uYW1lLnR5cGUucnVzdCddXG4iXX0=
