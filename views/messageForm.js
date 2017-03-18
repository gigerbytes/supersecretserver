var forms = require('forms');
var fields = forms.fields;
var validators = forms.validators;

var reg_form = forms.create({
    recipientName: fields.string({ required: true }),
    message: fields.string({ required: true }),
});

reg_form.toHTML();