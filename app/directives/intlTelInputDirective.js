app.directive('intlTel', function () {
	return {
		replace: true,
		restrict: 'E',
		require: 'ngModel',
		template: '<input type=\"text\">',
		link: function (scope, element, attrs, ngModel) {
			var $element = $(element),
				replaceRange = function (s, start, end, substitute) {
					return s.substring(0, start) + substitute + s.substring(end);
				},
				pasteHandler = function (e, elem) {
					var content = null,
						self = window.document;
					if ((e.originalEvent || e).clipboardData) {
						e.preventDefault();
						self.execCommand("insertText", false, getClipboard(e));
					}
					else if (window.clipboardData) {
						e.preventDefault();
						content = getClipboard(e);
						if (content.length >= 9) {
							self.execCommand("insertText", false, content);
						} else {
							elem.value = replaceRange(elem.value, elem.selectionStart, elem.selectionEnd, content)
						}
					}
				},
				getClipboard = function (e) {
					if ((e.originalEvent || e).clipboardData) {
						return (e.originalEvent || e).clipboardData.getData("text/plain")
					} else if (window.clipboardData) {
						return window.clipboardData.getData("Text");
					}
				},
				formatNumber = function (e) {
					var thisCountry = $element.intlTelInput("getSelectedCountryData"),
						number = window.intlTelInputUtils.formatNumber(((e.originalEvent || e).type == 'paste' && getClipboard(e).length >= 9) ? getClipboard(e) : $element.intlTelInput("getNumber"));
					if (number !== '') $element.intlTelInput("setNumber", number);
					if (thisCountry.iso2 !== "undefined") {
						$element.parent().find('#countryList').find("option[value=" + thisCountry.iso2 + "]").prop('selected', true);
					}
				},
				read = function () {
					var inputValue = $element.val() ? $element.intlTelInput('getCleanNumber') : '';
					ngModel.$setViewValue(inputValue);
				};
			$element.intlTelInput(app.config.intlTelInput).done(function () {
				var countryList = $('<select class=\"form-control\" id="countryList" autocomplete="off" title="Choose country"/>');
				var activeCountry = $element.intlTelInput("getSelectedCountryData").iso2;

				function countryMap(item,countryList){
					item.name = item.name.replace(/ *\([^)]*\) */g, "");
					if (item.name.length > 20) {
						item.name = item.name.substring(0, 20) + '...';
					}
					item.value = item.iso2;
					if (item.value == activeCountry) {
						countryList.append("<option selected value='" + item.value + "' data-dialcode='" + item.dialCode + "'>" + item.name + "</option>");
					} else {
						countryList.append("<option value='" + item.value + "' data-dialcode='" + item.dialCode + "'>" + item.name + "</option>");
					}
				}
				$.map($.fn.intlTelInput.getCountryData(), function (item) {
					if (app.config.intlTelInput.onlyCountries.length) {
						if(app.config.intlTelInput.onlyCountries.indexOf(item.iso2) !== -1)
							countryMap(item,countryList)
					} else{
						countryMap(item,countryList)
					}
				});
				$element.after(countryList);
				countryList.change(function () {
					var countryCode = $(this).val();
					$element.intlTelInput("setNumber", '').intlTelInput("selectCountry", countryCode);
				});

			});
			$element.prev().remove();

			$element.unwrap();
			$element.wrap("<div class='"+app.config.intlTelInput.inputClass+"'></div>");
			$('#countryList').wrap("<div class='"+app.config.intlTelInput.selectClass+"'></div>");


			$element.on('keypress input paste change keyup mouseup', function (e) {
				var cursorStart = this.selectionStart,
					cursorEnd = this.selectionEnd,
					self = this;
				if ((e.originalEvent || e).type == 'paste') {
					pasteHandler(e, self);
					formatNumber(e);
					var clipLength = getClipboard(e).length;
					// wait for number format
					setTimeout(function () {
						if (clipLength >= 9) {
							var numLength = scope.composeForm.number.length;
							self.setSelectionRange(numLength, numLength);
						} else if(cursorStart < cursorEnd) {
							self.setSelectionRange(cursorEnd, cursorEnd);
						} else {
							var elemLength = $element[0].value.length;
							self.setSelectionRange(elemLength, elemLength);
						}
					}, 100);
					return false;
				} else {
					formatNumber(e);
					this.setSelectionRange(cursorStart, cursorEnd);
				}
			});
			$(document).on('click', function (e) {
				if ($(e.target).siblings("#recent").length === 0) {
					$element.next('#recent').hide();
				}
			});
			read();
		}
	}
});
