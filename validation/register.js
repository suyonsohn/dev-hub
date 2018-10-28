const Validator = require('validator')

const isEmpty = require('../validation/is-empty')

module.exports = function validateRegisterInput(data) {
    let errors = {}

    if (!Validator.isLength(data.name, { min: 2, max: 30 })) {
        errors.name = 'Your name must be between 2 and 30 characters!'
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}