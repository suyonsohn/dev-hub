const Validator = require('validator')

const isEmpty = require('../validation/is-empty')

module.exports = function validateRegisterInput(data) {
    let errors = {}

    data.name = !isEmpty(data.name) ? data.name : ''
    data.email = !isEmpty(data.email) ? data.email : ''
    data.password = !isEmpty(data.password) ? data.password : ''
    data.password2 = !isEmpty(data.password2) ? data.password2 : ''

    // Check name
    if (!Validator.isLength(data.name, { min: 2, max: 30 })) {
        errors.name = 'Your name must be between 2 and 30 characters.'
    }

    if (Validator.isEmpty(data.name)) {
        errors.name = 'Please enter your name.'
    }

    // Check email
    if (Validator.isEmpty(data.email)) {
        errors.email = 'Please enter your email.'
    }

    if (!Validator.isEmail(data.email)) {
        errors.email = 'Please enter a valid email.'
    }

    // Check password
    if (Validator.isEmpty(data.password)) {
        errors.password = 'Please enter your password.'
    }

    if (!Validator.isLength(data.password, { min: 6, max: 30 })) {
        errors.password = 'Your password must be between 6 and 30 characters.'
    }

    // Check password2
    if (Validator.isEmpty(data.password2)) {
        errors.password2 = 'Please confirm your password by entering it one more time.'
    }

    if (!Validator.equals(data.password, data.password2)) {
        errors.password2 = 'Please confirm your password with the matching password.'
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}