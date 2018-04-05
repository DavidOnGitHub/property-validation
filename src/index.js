import _ from 'lodash';

const getProperty = (obj, fields) => fields.reduce((result, field) => result && result[field] ? result[field] : null, obj);

const setProperty = (obj, fields, value) => fields.reduce((result, field, index) => {
    if (index === fields.length - 1) {
        result[field] = value;
    } else if (!result[field]) {
        result[field] = _.isInteger(fields[index + 1]) ? [] : {};
    }
    return result[field];
}, obj);

const getPaths = (obj, fields) => {
    const paths = [];
    const path = [];
    let returnPaths = false;

    fields.forEach((field, index) => {
        if (returnPaths) {
            return;
        }
        const nextPath = [...path, field];
        const value = getProperty(obj, nextPath);
        if (Array.isArray(value) && index < fields.length - 1) {
            for (let i = 0; i < value.length; i += 1) {
                const subPaths = getPaths(value[i], fields.slice(nextPath.length));
                subPaths.forEach(subPath => paths.push([...nextPath, i, ...subPath]));
            }
            returnPaths = true;
        } else if (!returnPaths){
            path.push(field);
        }
    });
    if (!returnPaths) {
        paths.push(path);
    }

    return paths;
};

export class Validation {
    constructor(values) {
        this.values = values;
        this.errors = {};
    }

    getErrors() {
        return this.errors;
    }

    hasError() {
        return !_.isEmpty(this.errors);
    }

    validation(field, message, validate, againstNullOrUndefined) {
        const props = field.split('.');
        const paths = getPaths(this.values, props);

        paths.forEach(path => {
            const property = getProperty(this.values, path);
            if (againstNullOrUndefined || property) {
                if (!validate(property)) {
                    setProperty(this.errors, path, message || 'property is invalid');
                }
            }
        });

        return this;
    }

    validEmail(field, message) {
        return this.validation(field, message || 'invalid email', value => /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value));
    }

    validInteger(field, message) {
        return this.validation(field, message || 'invalid integer', _.isInteger);
    }

    maxLength(field, maxLength, message) {
        return this.validation(field, message || 'max length exceeded', value => value.length <= maxLength);
    }

    containsOnly(fieldList, message) {
        if (!_.keys(this.values).every(key => fieldList.indexOf(key) >= 0)) {
            this.errors.body = message || `body should only contain ${fieldList.join(', ')}`;
        }
        return this;
    }

    notEmptyArray(field, message) {
        return this.validation(field, message || 'not array or empty array', value => Array.isArray(value) && value.length > 0);
    }

    require(field, message) {
        if (field === '/' && _.isEmpty(this.values)) {
            this.errors.body = message || 'body is required but missing';
            return this;
        } else if (field === '/') {
            return this;
        }
        return this.validation(field, message || 'property is required but missing', value => !!value, true);
    }
}
