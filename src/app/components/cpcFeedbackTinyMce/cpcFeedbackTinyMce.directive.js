(function() {
  'use strict';

  angular
    .module('cpccore')
    .directive('cpcFeedbackTinyMce', cpcTeam);

  /* @ngInject */
  function cpcTeam() {
    // Usage:
    //
    // Creates:
    //
    var directive = {
      templateUrl: '/client/app/components/cpcFeedbackTinyMce/cpcFeedbackTinyMce.html',
      bindToController: true,
      controller: Controller,
      controllerAs: 'vm',
      link: link,
      restrict: 'E',
      scope: {}
    };
    return directive;

    function link(scope, element, attrs) {}
  }

  /* @ngInject */
  function Controller($log, $translate, $scope, $modal, $window, objectStore) {
        var vm = this;

        // Config Tiny MCE
        vm.max_chars    = 4000; //max characters
        vm.max_for_html = 8000; //max characters for html tags
        vm.allowed_keys = [8, 13, 16, 17, 18, 20, 33, 34, 35,36, 37, 38, 39, 40, 46];
        vm.chars_without_html = 0;
        vm.chars_with_html = 0;

        vm.alarmChars = function(){
          if(vm.chars_without_html > (vm.max_chars - 25)){
            $('#chars_left').css('color','red');
          }else{
            $('#chars_left').css('color','gray');
          }
        }

	  	tinymce.remove();

		tinymce.init({
    mode: "textareas",
          content_css: "css/content.css",
          readonly: false,
          menubar: false,
          selector: "textarea",
          autoresize_min_height: "100px",
          browser_spellcheck: false,
          resize: false,
          image_advtab: true,
          statusbar: false,
          paste_auto_cleanup_on_paste: false,
          paste_convert_middot_lists: true,
          paste_block_drop: true,
          //paste_retain_style_properties: "*",
          paste_strip_class_attributes: "none",
          paste_remove_spans: false,
          paste_remove_styles: false,
          paste_remove_styles_if_webkit: false,
          paste_dialog_width: true,
          paste_dialog_height: true,
          paste_text_use_dialog: true,
          paste_force_cleanup_paste : false,
          paste_retain_style_properties : "margin, padding, width, height, font-size, font-weight, font-family, color, text-align, ul, ol, li, text-decoration, border, background, float, display",
          spellchecker_languages: 'English=en,French=fr',
          spellchecker_language: 'en',
    spellchecker_callback: function(method, text, success, failure) {
      tinymce.util.JSONRequest.sendRPC({
        url: "/performance/api/spellCheck",
        method: "spellcheck",
        params: {
          lang: this.getLanguage(),
          words: text.replace(/\n/g," ")
        },
        success: function(result) {
          success(result);
        },
        error: function(error, xhr) {
          failure("Spellcheck error:" + xhr.status);
        }
      });
    },
    init_instance_callback: function(editor)
    {
        //alert("Initialized");

        var currentFeedbackObject = objectStore.feedback.currentFeedbackObject.get();
        //alert(JSON.stringify(currentFeedbackObject));
        if(currentFeedbackObject !== null)
        {
            //alert(currentFeedbackObject.feedbackStatus + ' ' + currentFeedbackObject.saveSatus);
            if(currentFeedbackObject.feedbackStatus === 'DRAFT' && currentFeedbackObject.saveSatus === 'DRAFT')
            {
                //alert(currentFeedbackObject.description);
                tinymce.activeEditor.setContent(currentFeedbackObject.description);
            } else if(currentFeedbackObject.feedbackStatus === 'PENDING' && currentFeedbackObject.saveSatus === 'DRAFT')
            {
                //alert(currentFeedbackObject.feedbackResponse);
                tinymce.activeEditor.setContent(currentFeedbackObject.feedbackResponse);
            }
        }
    },
    style_formats: [{
        title: 'Bold text',
        inline: 'b'
    }, {
        title: 'Red text',
        inline: 'span',
        styles: {
            color: '#ff0000'
        }
    }, {
        title: 'Red header',
        block: 'h1',
        styles: {
            color: '#ff0000'
        }
    }, {
        title: 'Example 1',
        inline: 'span',
        classes: 'example1'
    }, {
        title: 'Example 2',
        inline: 'span',
        classes: 'example2'
    }, {
        title: 'Table styles'
    }, {
        title: 'Table row 1',
        selector: 'tr',
        classes: 'tablerow1'
    }],
    formats: {
        alignleft: {
            selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img,span',
            classes: 'left',
            styles: {
                textAlign: 'left'
            }
        },
        aligncenter: {
            selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img,span',
            classes: 'center',
            styles: {
                textAlign: 'center'
            }
        },
        alignright: {
            selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img,span',
            classes: 'right',
            styles: {
                textAlign: 'right'
            }
        },
        alignfull: {
            selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img,span',
            classes: 'full',
            styles: {
                textAlign: 'justify'
            }
        },
        bold: {
            inline: 'b',
            classes: 'bold'
        },
        italic: {
            inline: 'i',
            classes: 'italic'
        },
        underline: {
            inline: 'u',
            classes: 'underline',
            exact: true
        },
        strikethrough: {
            inline: 'del'
        },
        customformat: {
            inline: 'span',
            styles: {
                color: '#00ff00',
                fontSize: '20px'
            },
            attributes: {
                title: 'My custom format'
            }
        }
    },
    setup: function(ed) {
        ed.on('init', function(args) {
            ed.setContent("Enter Feedback Details");
        });

        ed.on('focus', function(args) {
            if (ed.getContent().length != 0 && ed.getContent() == "<p>Enter Feedback Details</p>") {
                ed.setContent('');
            }
        });

        ed.on('blur', function(args) {
            if (ed.getContent().length == 0) {
                ed.setContent('');
            }
        });

       /* ed.on("KeyUp", function(ed, l) {
            vm.chars_without_html = $.trim(tinyMCE.activeEditor.getContent().replace(/(<([^>]+)>)/ig, "")).length;
            vm.chars_with_html = tinyMCE.activeEditor.getContent().length;
            var key = ed.keyCode;

            $('#chars_left').html(vm.max_chars - vm.chars_without_html);

            if (vm.allowed_keys.indexOf(key) != -1) {
                vm.alarmChars();
                return;
            }

            if (vm.chars_with_html > (vm.max_chars + vm.max_for_html)) {
                // ed.stopPropagation();
                // ed.preventDefault();
            } else if (vm.chars_without_html > vm.max_chars - 1 && key != 8 && key != 46) {
                // ed.stopPropagation();
                // ed.preventDefault();
            }
            vm.alarmChars();
        });


        ed.on("PastePostProcess", function(ed, l) {
            vm.chars_without_html = $.trim(tinyMCE.activeEditor.getContent().replace(/(<([^>]+)>)/ig, "")).length;
            vm.chars_with_html = tinyMCE.activeEditor.getContent().length;
            var key = ed.keyCode;

            $('#chars_left').html(vm.max_chars - vm.chars_without_html);

            if (vm.allowed_keys.indexOf(key) != -1) {
                vm.alarmChars();
                return;
            }

            if (vm.chars_with_html > (vm.max_chars + vm.max_for_html)) {
                //ed.stopPropagation();
                //ed.preventDefault();
            } else if (vm.chars_without_html > vm.max_chars - 1 && key != 8 && key != 46) {
                //ed.stopPropagation();
                //sed.preventDefault();
            }
            vm.alarmChars();
        });

        ed.on("CutPostProcess", function(ed, l) {
            vm.chars_without_html = $.trim(tinyMCE.activeEditor.getContent().replace(/(<([^>]+)>)/ig, "")).length;
            vm.chars_with_html = tinyMCE.activeEditor.getContent().length;
            var key = ed.keyCode;

            $('#chars_left').html(vm.max_chars - vm.chars_without_html);

            if (vm.allowed_keys.indexOf(key) != -1) {
                vm.alarmChars();
                return;
            }

            if (vm.chars_with_html > (vm.max_chars + vm.max_for_html)) {
               // ed.stopPropagation();
               // ed.preventDefault();
            } else if (vm.chars_without_html > vm.max_chars - 1 && key != 8 && key != 46) {
                ////alert('Characters limit!');
                // ed.stopPropagation();
                // ed.preventDefault();
            }
            vm.alarmChars();
        });*/

    },
    plugins: [
        "spellchecker paste",
        "advlist autolink lists link image charmap print preview anchor spellchecker",
        "searchreplace visualblocks code fullscreen autoresize",
        "insertdatetime media table contextmenu"
    ],
    toolbar: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | fullscreen | spellchecker"
});

  }
})();
