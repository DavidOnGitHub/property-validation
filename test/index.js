import { expect } from 'chai';
import { Validation } from '../src/index';

describe('Validation', () => {
    it('should give error when required field is missing', () => {
        let values = { firstName: 'John', lastName: 'Smith' };
        let errors = new Validation(values)
            .require('lastName', 'last name is missing')
            .getErrors();

        expect(errors.lastName).to.be.undefined;

        values = { firstName: 'John' };
        errors = new Validation(values)
            .require('lastName', 'last name is missing')
            .getErrors();

        expect(errors.lastName).to.equal('last name is missing');
    });

    it('should give error when length is over maxLength', () => {
        let values = { firstName: 'John' };
        let errors = new Validation(values)
            .maxLength('firstName', 4, 'firstName is too long')
            .getErrors();

        expect(errors.firstName).to.be.undefined;

        values = { firstName: 'John' };
        errors = new Validation(values)
            .maxLength('firstName', 3, 'firstName is too long')
            .getErrors();

        expect(errors.firstName).to.equal('firstName is too long');
    });

    it('should give error when email field is not email', () => {
        let values = { email: 'john@test.com' };
        let errors = new Validation(values)
            .validEmail('email', 'invalid email')
            .getErrors();

        expect(errors.email).to.be.undefined;

        values = { email: 'john@t.m' };
        errors = new Validation(values)
            .validEmail('email', 'invalid email')
            .getErrors();

        expect(errors.email).to.equal('invalid email');
    });

    it('should give error if the object contains unexpected property', () => {
        let values = { firstName: 'John', email: 'john@test.com' };
        let errors = new Validation(values)
            .containsOnly(['firstName', 'email'])
            .getErrors();

        expect(errors.body).to.be.undefined;

        values = { firstName: 'John', email: 'john@test.com', address: '123 Test St' };
        errors = new Validation(values)
            .containsOnly(['firstName', 'email'])
            .getErrors();

        expect(errors.body).to.equal('body should only contain firstName, email');
    });

    it('should validate nested property without arrays', () => {
        let values = {
            person: { firstName: 'John', lastName: 'Smith' }
        };
        let errors = new Validation(values)
            .require('person.lastName')
            .getErrors();
        expect(errors).is.empty;

        values = {
            person: { firstName: 'John' }
        };
        errors = new Validation(values)
            .require('person.lastName', 'last name is required')
            .getErrors();
        expect(errors.person.lastName).to.equal('last name is required');
    });

    it('should validate against body', () => {
        let values = {
            person: { firstName: 'John', lastName: 'Smith' }
        };
        let errors = new Validation(values)
            .require('/')
            .getErrors();
        expect(errors).is.empty;

        values = {};
        errors = new Validation(values)
            .require('/', 'body is required')
            .getErrors();
        expect(errors.body).to.equal('body is required');
    });

    it('should validate nested property with arrays', () => {
        let values = {
            persons: [
                {
                    firstName: 'John',
                    lastName: 'Smith',
                    hobbies: [
                        { type: 'sport', value: 'soccer' },
                        { type: 'sport', value: 'basketball' },
                    ]
                },
                {
                    firstName: 'Alex',
                    lastName: 'Gordon',
                    hobbies: [
                        { value: 'chess' },
                        { value: 'basketball' },
                    ]
                },
            ]
        };
        let errors = new Validation(values)
            .require('persons.hobbies.type', 'type is missing')
            .getErrors();

        expect(errors).to.deep.equal({
            persons: [undefined, { hobbies: [{ type: 'type is missing' }, { type: 'type is missing' }] }]
        });
    });

    it('should validate regardless of null or undefined values', () => {
        let values = {
            persons: [
                {
                    firstName: 'John',
                    lastName: 'Smith',
                    hobbies: [
                        { type: 1, value: 'soccer' },
                        { type: 'sport', value: 'basketball' },
                    ]
                },
                {
                    firstName: 'Alex',
                    lastName: 'Gordon',
                    hobbies: [
                        { type: 'sport', value: 'chess' },
                        { value: 'basketball' },
                    ]
                },
            ]
        };
        let errors = new Validation(values)
            .validInteger('persons.hobbies.type', 'should be integer')
            .getErrors();

        expect(errors).to.deep.equal({
            persons: [{ hobbies: [undefined, { type: 'should be integer' }] }, { hobbies: [{ type: 'should be integer' }] }]
        });
    });
});
