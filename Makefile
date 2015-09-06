MINIFIED_JS_FILES=min.js
SUBSTITUTED_JS_FILES=min_subst.js
UGLY_JS_FILES=ugly.js
JS_FILES=$(shell find -name \*.js|grep -v $(MINIFIED_JS_FILES)|grep -v $(SUBSTITUTED_JS_FILES)|grep -v $(UGLY_JS_FILES))
ZIP=js13k.zip
ZIP_DIRECTORY=js13k
TMP_DIRECTORY=tmp

EXTRA_FILES=$(shell find -name \*.fs|grep -v $(ZIP_DIRECTORY))
EXTRA_FILES+=$(shell find -name \*.vs|grep -v $(ZIP_DIRECTORY))
EXTRA_FILES+=intro.html about.html menu.html

.PHONY: zip dist all info TESTCOMPRESS
all: $(UGLY_JS_FILES)

dist: $(UGLY_JS_FILES) $(EXTRA_FILES) index_ugly.html
	@mkdir -p $(ZIP_DIRECTORY) $(TMP_DIRECTORY)
	@cp -uv $(UGLY_JS_FILES) $(ZIP_DIRECTORY)
	@cp -uv $(EXTRA_FILES) $(ZIP_DIRECTORY)
	@cp -uv index_ugly.html $(ZIP_DIRECTORY)/index.html

zip: $(ZIP)

ZIP_EXTRA=
ifeq ("$(wildcard bestCompress.sh)","")
	ZIP_EXTRA+=bestCompress.sh
endif

$(ZIP): dist $(ZIP_EXTRA)
	@bash bestCompress.sh $(ZIP_DIRECTORY) $(TMP_DIRECTORY) $(ZIP)


$(MINIFIED_JS_FILES): $(JS_FILES)
	closure-compiler --create_source_map min.map --language_in ECMASCRIPT5 --compilation_level ADVANCED_OPTIMIZATIONS $(patsubst %,--js %,$(JS_FILES)) --js_output_file $@
	echo '//@ sourceMappingURL=min.map' >> $@

$(SUBSTITUTED_JS_FILES): $(MINIFIED_JS_FILES) subst.sh subst_const.sh
	cat $< | sh subst.sh > $@

subst_const.sh: consts.sh $(JS_FILES)
	bash consts.sh

$(UGLY_JS_FILES): $(SUBSTITUTED_JS_FILES)
	uglifyjs --source-map ugly.map --in-source-map min.map $< -o $@ --screw-ie8 -m sort,toplevel -c unsafe,drop_console

info: $(ZIP)
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


TESTCOMPRESS: bestCompress.sh

bestCompress.sh: dist
	bash 7z.sh $(TMP_DIRECTORY)
