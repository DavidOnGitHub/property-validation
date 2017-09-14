# property-validation

Chainable validation of object properties for any JS application such as Angular, React and Node applications. Designed to be used as ES6 class. Works with redux-form out of the box.

## Features

* Chainable, e.g.
    ```js
    const validate = new Validation()
      .require('firstName') // using default error message
      .require('lastName', 'last name is required') // using custom error message
      .validEmail('email')
      .getErrors();
    ```

* Supports nested path, e.g.
    ```js
    const validate = new Validation()
      .require('address.street.name')
      .getErrors();
    ```

* Supports array in path, e.g.
    ```js
    const validate = new Validation()
      .require('other.hobbies.type') // hobbies is an array
      .getErrors();
    ```

* Works with redux-form out of the box, [example here](https://github.com/DavidOnGitHub/property-validation#use-with-redux-form)

* Can be extended with custom validations
    ```js
    class MyValidation extends Validation {
      validateMyField(field, message) {
        return this.validation(field, message || 'customized default message', value => myValiateFunc(value));
      }
    }

    const validate = new MyValidation()
      .require('firstName')
      .validateMyField('fieldName', 'customized message')
      .getErrors();
    ```

## Installation

```bash
npm install property-validation --save
```

## Test

```bash
npm test
```

## Usage

### Simple use

```js
import Validation from 'validation';
import { expect } from 'chai';

const values = {
  firstName: 'JohnLongFirstName',
  lastName: 'Smith'
};

const errors = new Validation(values)
  .require('email', 'email is missing')
  .maxLength('firstName', 'firstName is too long', 15)
  .getErrors();

expect(errors).to.deep.equal({
  email: 'email is missing',
  firstName: 'firstName is too long'
}); // true
```

### Use with redux-form
```js
import React, { Component, PropTypes } from 'react'
import { Field, FieldArray, reduxForm } from 'redux-form'

class Example extends Component {
  constructor() {
    super();
    this.renderHobbies = this.renderHobbies.bind(this);
  }
  renderHobbies({ fields }) {
      return (
          <div>
            { fields.map((hobby, index) => (
                <div key={index}>
                    <Field
                        name={`${hobby}.type`}
                        component={Input}
                    >
                    <Field
                        name={`${hobby}.name`}
                        component={Input}
                    >
                </div>
            )) }
          </div>
      );
  }
  render() {
    return (
      <form onSubmit={this.props.handleSubmit(this.nextStep)}>
        <Field
          name="firstName"
          component="Input"
        />
        <FieldArray name="hobbies" component={this.renderHobbies}/>
      </form>
    );
  }
}

const validate = new Validation(values)
    .require('firstName')
    .require('hobbies.type')
    .getErrors();

export default reduxForm({
    form: 'ExampleForm',
    validate
})
```

# Notes

* For nested properties with arrays, validation message for first element will be undefined if validation passed for the first element but failed for one of the rest. e.g.
    ```js
      const values = {
        persons: [
          {
            firstName: 'John',
            lastName: 'Smith',
            hobbies: [
              {
                type: 'sport',
                name: 'soccer'
              },
              {
                type: 'sport',
                name: 'basketball'
              }
            ]
          },
          {
            firstName: 'Alex',
            lastName: 'Turner',
            hobbies: [
              {
                name: 'soccer'
              },
              {
                type: 'sport',
                name: 'basketball'
              }
            ]
          }
        ]
      };
      const errors = new Validation(values)
        .require('persons.hobbies.type', 'missing')
        .getErrors();

      expect(errors).to.deep.equal({
        persons: [
          undefined,
          {
            hobbies: [
              { type: 'missing' }
            ]
          }
        ]
      }); // true
    ```

* Validations, except for require, do not validate null or undefined values. For example, if ```values.firstName``` is undefined, ```new Validation(values).validInteger('firstName')``` does not give validation error. In order to validate null or undefined values, 'require' should be added before other validations in the chain. E.g. ```new Validation(values).require('firstName').validInteger('firstName')```.

* In order to extend ```Validation``` with custom validations, ```this.validation()``` should be used if it is to validate against a specified path, e.g.
    ```js
    class MyValidation extends Validation {
      minLength(field, message, minlength) {
        return this.validation(field, message || 'below minimum length', value => (value >= minlength));
      }
    }
    ```
    If it is to validate against the whole object then ```this.validation``` should not be used. e.g.
    ```js
    class MyValidation extends Validation {
      bodyIsArray(message) {
        if (!Array.isArray(this.values)) {
          this.errors.body = message || 'body should be an array';
        }
        return this;
      }
    }
    ```

# Pull Requests welcomed!!
