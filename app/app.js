var app = angular.module('app',[]);

app.config = {
	intlTelInput:{
		defaultCountry: "ua",
		autoFormat: true,
		nationalMode: false,
		onlyCountries: [],
		inputClass:'col-xs-6',
		selectClass:'col-xs-6'
	}
};