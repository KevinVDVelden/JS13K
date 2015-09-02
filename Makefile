JS_FILES=$(shell find -name \*.js|grep -v min.js|grep -v ugly.js|grep -v min_subst.js)
MINIFIED_JS_FILES=min.js
SUBSTITUTED_JS_FILES=min_subst.js
UGLY_JS_FILES=ugly.js
ZIP=js13k.zip
ZIP_DIRECTORY=js13k
TMP_DIRECTORY=tmp

EXTRA_FILES=$(shell find -name \*.fs|grep -v $(ZIP_DIRECTORY))
EXTRA_FILES+=$(shell find -name \*.vs|grep -v $(ZIP_DIRECTORY))
EXTRA_FILES+=intro.html

.PHONY: dist all info
all: $(UGLY_JS_FILES)

dist: all $(ZIP)

$(ZIP): $(UGLY_JS_FILES)
	@mkdir -p $(ZIP_DIRECTORY) $(TMP_DIRECTORY)
	cp $(UGLY_JS_FILES) $(ZIP_DIRECTORY)
	cp $(EXTRA_FILES) $(ZIP_DIRECTORY)
	cp index_ugly.html $(ZIP_DIRECTORY)/index.html
	bash bestCompress.sh $(ZIP_DIRECTORY) $(TMP_DIRECTORY) $(ZIP)


min.js: $(JS_FILES)
	closure-compiler --create_source_map min.map --language_in ECMASCRIPT5 --compilation_level ADVANCED_OPTIMIZATIONS $(patsubst %,--js %,$(JS_FILES)) --js_output_file $@
	echo '//@ sourceMappingURL=min.map' >> min.js

min_subst.js: min.js subst.sh
	cat $< | sh subst.sh > $@

ugly.js: min_subst.js
	uglifyjs --source-map ugly.map --in-source-map min.map $< -o $@ --screw-ie8 -m sort,toplevel -c unsafe,drop_console

info: $(ZIP) $(MINIFIED_JS_FILES)
	@echo Minified JS is `cat $(MINIFIED_JS_FILES)|wc -c` bytes.
	@echo Substituted JS is `cat $(SUBSTITUTED_JS_FILES)|wc -c` bytes.
	@echo Uglified JS is `cat $(UGLY_JS_FILES)|wc -c` bytes.
	@echo Unminified JS files:
	@wc -c $(JS_FILES)
	@echo Extra non-js files:
	@wc -c $(EXTRA_FILES)
	@echo Final compression:
	@ls -l $(ZIP)

clean:
	@rm -vf $(MINIFIED_JS_FILES) $(UGLY_JS_FILES) $(SUBSTITUTED_JS_FILES)
	@rm -vf $(ZIP)
	@rm -vrf $(ZIP_DIRECTORY)
	@rm -vrf $(TMP_DIRECTORY)
