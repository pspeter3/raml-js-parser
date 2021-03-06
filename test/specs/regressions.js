"use strict";

if (typeof window === 'undefined') {
    var raml = require('../../lib/raml.js')
    var chai = require('chai')
        , expect = chai.expect
        , should = chai.should();
    var chaiAsPromised = require("chai-as-promised");
    chai.use(chaiAsPromised);
} else {
    var raml = RAML.Parser;
    chai.should();
}

describe('Regressions', function () {
    it('should fail unsupported raml version:RT-180', function(done) {
        var definition = [
            '#%RAML 0.1'
        ].join('\n');

        raml.load(definition).should.be.rejected.with(/Unsupported RAML version: \'#%RAML 0.1\'/).and.notify(done);
    });
    it('should fail with correct error message on hex values', function(done) {
        var definition = [
            '#%RAML 0.8',
            'some_key: "some value \\x0t"'
        ].join('\n');

        raml.load(definition).should.be.rejected.with(/expected escape sequence of 2 hexadecimal numbers, but found t/).and.notify(done);
    });
    it('should fail with correct error message on hex values', function(done) {
        var definition = [
            '#%RAML 0.8',
            'some_key: ? something : something'
        ].join('\n');

        raml.load(definition).should.be.rejected.with(/mapping keys are not allowed here/).and.notify(done);
    });
    it('should fail with correct error message on hex values', function(done) {
        var definition = [
            '#%RAML 0.8',
            'some_key: "',
            '...',
            '---'
        ].join('\n');

        raml.load(definition).should.be.rejected.with(/found unexpected document separator/).and.notify(done);
    });
    it('should fail if baseUriParameter is not a map', function(done) {
        var definition = [
            '#%RAML 0.8',
            'title: Test',
            'baseUri: http://www.api.com/{version}/{company}',
            'version: v1.1',
            '/jobs:',
            '  baseUriParameters:',
            '    company:',
            '      description'
        ].join('\n');

        raml.load(definition).should.be.rejected.with(/parameter must be a map/).and.notify(done);
    });
    it('should not fail to parse an empty trait', function(done) {
        var definition = [
            '#%RAML 0.8',
            'title: MyApi',
            'traits:',
            '  - emptyTrait:',
            '    otherTrait:',
            '      description: Some description',
        ].join('\n');
        raml.load(definition).should.be.rejected.with(/invalid trait definition, it must be a map/).and.notify(done);
    });

    it('should not fail to parse an empty trait list', function(done) {
        var definition = [
            '#%RAML 0.8',
            '---',
            'title: Test',
            'baseUri: http://www.api.com/{version}/{company}',
            'version: v1.1',
            'traits:'
        ].join('\n');
        raml.load(definition).should.be.rejected.with(/invalid traits definition, it must be an array/).and.notify(done);
    });

    it('should fail to parse a RAML header ', function(done) {
        var noop = function () {};
        var definition = [
            '#%RAML 0.8'
        ].join('\n');

        raml.load(definition).then(noop, function (error) {
            setTimeout(function () {
                error.message.should.match(/empty document/);
                done();
            }, 0);
        });
    });

    it('should not fail to parse a RAML file only with headers', function(done) {
        var definition = [
            '#%RAML 0.8',
            '---'
        ].join('\n');
        raml.load(definition).should.be.rejected.with(/document must be a map/).and.notify(done);
    });

    it('should not fail to parse a RAML null uriParameters. RT-178', function(done) {
        var definition = [
            '#%RAML 0.8',
            '---',
            'title: hola',
            'version: v0.1',
            'baseUri: http://server/api/{version}',
            'baseUriParameters:'
        ].join('\n');
        var expected = {
            title: "hola",
            version: "v0.1",
            baseUri: "http://server/api/{version}",
            baseUriParameters: {
                version: {
                    type: "string",
                    required: true,
                    displayName: "version",
                    enum: [ "v0.1" ]
                }
            },
            protocols: [
                'HTTP'
            ]
        }
        raml.load(definition).should.become(expected).and.notify(done);
    });

    it('should fail if baseUriParamters has a version parameter. RT-199', function(done) {
        var definition = [
            '#%RAML 0.8',
            '---',
            'title: hola',
            'version: v0.1',
            'baseUri: http://server/api/{version}',
            'baseUriParameters:',
            ' version:'
        ].join('\n');
        raml.load(definition).should.be.rejected.with(/version parameter not allowed here/).and.notify(done);
    });

    it('should fail if resource URI is invalid', function(done){
        var definition = [
            '#%RAML 0.8',
            '---',
            'title: hola',
            'version: v0.1',
            '/resourceName{}:'
        ].join('\n');
        raml.load(definition).should.be.rejected.with(/Resource name is invalid:/).and.notify(done);
    });

    it('should fail if resource URI is invalid', function(done){
        var definition = [
            '#%RAML 0.8',
            '---',
            'title: hola',
            'version: v0.1',
            '/resourceName{}:'
        ].join('\n');
        raml.load(definition).should.be.rejected.with(/Resource name is invalid:/).and.notify(done);
    });

    it('should reject RAML with more than one YAML document', function(done){
        var definition = [
            '#%RAML 0.8',
            '---',
            'title: hola',
            'version: v0.1',
            '---'
        ].join('\n');
        raml.load(definition).should.be.rejected.with(/expected a single document in the stream but found another document/).and.notify(done);
    });

    it('should inject exception coontext into message when message is null', function(done){
        var definition = [
            '#%RAML 0.8',
            '---',
            'title: hola',
            'version: v0.1',
            '...',
            'somepropertyName'
        ].join('\n');
        raml.load(definition).should.be.rejected.with(/expected '<document start>', but found <scalar>/).and.notify(done);
    });

    it('should fail if baseUriParameters is a string - RT-274', function(done){
        var definition = [
            '#%RAML 0.8',
            '---',
            'title: hola',
            'version: v0.1',
            'baseUri: http://example.com',
            'baseUriParameters:',
            '  someparam'
        ].join('\n');
        raml.load(definition).should.be.rejected.with(/base uri parameters must be a map/).and.notify(done);
    });

    it('should fail if baseUriParameters is a string - RT-274 - with proper line numbering', function(done){
        var noop       = function () {};
        var definition = [
            '#%RAML 0.8',
            '---',
            'title: hola',
            'version: v0.1',
            'baseUri: http://example.com',
            'baseUriParameters:',
            '  someparam'
        ].join('\n');
        raml.load(definition).then(noop, function (error) {
            setTimeout(function () {
                error.message.should.be.equal("base uri parameters must be a map");
                expect(error.problem_mark).to.exist;
                error.problem_mark.line.should.be.equal(6);
                error.problem_mark.column.should.be.equal(2);
                done();
            }, 0);
        });
    });

    it('should fail if baseUriParameters in a resource is a string - RT-274', function(done){
        var definition = [
            '#%RAML 0.8',
            '---',
            'title: hola',
            'version: v0.1',
            'baseUri: http://localhost',
            '/resource:',
            '  baseUriParameters:',
            '    someparam'
        ].join('\n');
        raml.load(definition).should.be.rejected.with(/base uri parameters must be a map/).and.notify(done);
    });

    it('should fail if baseUriParameters in a resource is a string - RT-274', function(done){
        var definition = [
            '#%RAML 0.8',
            '---',
            'title: hola',
            'version: v0.1',
            'baseUri: http://localhost',
            '/resource:',
            '  uriParameters:',
            '    someparam'
        ].join('\n');
        raml.load(definition).should.be.rejected.with(/uri parameters must be a map/).and.notify(done);
    });

    it('should report correct line (RT-244)', function (done) {
        var noop       = function () {};
        var definition = [
            '',
            ''
        ].join('\n');

        raml.load(definition).then(noop, function (error) {
            setTimeout(function () {
                expect(error.problem_mark).to.exist;
                error.problem_mark.column.should.be.equal(0);
                error.problem_mark.line.should.be.equal(0);
                done();
            }, 0);
        });
    });

    it('should report correct line for null media type in implicit mode', function (done) {
        var noop       = function () {};
        var definition = [
            '#%RAML 0.8',
            '/resource:',
            '  post:',
            '    body:',
            '      schema: someSchema',
        ].join('\n');

        raml.load(definition).then(noop, function (error) {
            setTimeout(function () {
                error.message.should.be.equal("body tries to use default Media Type, but mediaType is null");
                expect(error.problem_mark).to.exist;
                error.problem_mark.column.should.be.equal(4);
                error.problem_mark.line.should.be.equal(3);
                done();
            }, 0);
        });
    });

    it('should report repeated URI\'s in the second uri\'s line - RT-279', function(done){
        var noop       = function () {};
        var definition = [
            '#%RAML 0.8',
            '---',
            'title: "muse:"',
            'baseUri: http://ces.com/muse',
            '/r1/r2:',
            '/r1:',
            '  /r2:'
        ].join('\n');
        raml.load(definition).then(noop, function (error) {
            setTimeout(function () {
                error.message.should.be.equal("two resources share same URI /r1/r2");
                expect(error.problem_mark).to.exist;
                error.problem_mark.column.should.be.equal(2);
                error.problem_mark.line.should.be.equal(6);
                done();
            }, 0);
        });
    });

    it('should allow a trait parameter with an integer value - RT-279', function(done){
        var definition = [
            '#%RAML 0.8',
            '---',
            'traits:',
            '  - getMethod:',
            '     description: <<description>>',
            'title: title',
            '/test:',
            ' is: [ getMethod: { description: 1 }]'
        ].join('\n');
        raml.load(definition).should.be.fulfilled.and.notify(done);
    });

    it('should allow a resource type parameter with an integer value - RT-279', function(done){
        var definition = [
            '#%RAML 0.8',
            '---',
            'resourceTypes:',
            '  - someType:',
            '     description: <<description>>',
            'title: title',
            '/test:',
            ' type: { someType: { description: 1 }}'
        ].join('\n');
        raml.load(definition).should.be.fulfilled.and.notify(done);
    });

    it('should apply a resourceType that inherits from another type that uses parameters', function(done){
        var definition = [
            '#%RAML 0.8',
            '---',
            'title: My API',
            'resourceTypes:',
            '  - base:',
            '      get:',
            '         description: <<description>>',
            '  - collection:',
            '      type: { base: { description: hola } }',
            '      get:',
            '  - typedCollection:',
            '      type: collection',
            '      get:',
            '         description: <<description>>',
            '/presentations:',
            '  type: { typedCollection: { description: description } }'
        ].join('\n');

        var expected = {
            "title": "My API",
            "resourceTypes": [
                {
                    "base": {
                        "get": {
                            "description": "<<description>>"
                        }
                    }
                },
                {
                    "collection": {
                        "type": {
                            "base": {
                                "description": "hola"
                            }
                        },
                        "get": null
                    }
                },
                {
                    "typedCollection": {
                        "type": "collection",
                        "get": {
                            "description": '<<description>>'
                        }
                    }
                }
            ],
            "resources": [
                {
                    "type": {
                        "typedCollection": {
                            "description": "description"
                        }
                    },
                    "relativeUri": "/presentations",
                    "methods": [
                        {
                            "method": "get",
                            "description": "description"
                        }
                    ],
                    relativeUriPathSegments: [ "presentations" ]
                }
            ]
        };
        raml.load(definition).should.become(expected).and.notify(done);
    });

    it('should report correct line for resourceType not map error - RT-283', function(done){
        var noop       = function () {};
        var definition = [
            '#%RAML 0.8',
            '---',
            'title: "muse:"',
            'resourceTypes:',
            '  - type1: {}',
            '    type:'
        ].join('\n');
        raml.load(definition).then(noop, function (error) {
            setTimeout(function () {
                error.message.should.be.equal("invalid resourceType definition, it must be a map");
                expect(error.problem_mark).to.exist;
                error.problem_mark.column.should.be.equal(9);
                error.problem_mark.line.should.be.equal(5);
                done();
            }, 0);
        });
    });

    it('should report correct line for resourceType circular reference - RT-257', function(done){
        var noop       = function () {};
        var definition = [
            '#%RAML 0.8',
            '---',
            'title: "muse:"',
            'resourceTypes:',
            '  - rt1:',
            '      type: rt2',
            '  - rt2:',
            '      type: rt1',
            '/resource:',
            '  type: rt1'
        ].join('\n');
        raml.load(definition).then(noop, function (error) {
            setTimeout(function () {
                error.message.should.be.equal("circular reference of \"rt1\" has been detected: rt1 -> rt2 -> rt1");
                expect(error.problem_mark).to.exist;
                error.problem_mark.column.should.be.equal(4);
                error.problem_mark.line.should.be.equal(6);
                done();
            }, 0);
        });
    });

    it('should apply a trait to a method that has been applied a resource type with a matching null method', function(done){
        var definition = [
            '#%RAML 0.8',
            '---',
            'title: User Management',
            'traits:',
            '  - paged:',
            '      queryParameters:',
            '        start:',
            'resourceTypes:',
            '  - collection:',
            '      get:',
            '/users:',
            '  type: collection',
            '  get:',
            '    is: [ paged ]'
        ].join('\n');

        var expected = {
            "title": "User Management",
            "traits": [
                {
                    "paged": {
                        "queryParameters": {
                            "start": {
                                "displayName": "start",
                                "type": "string"
                            }
                        }
                    }
                }
            ],
            "resourceTypes": [
                {
                    "collection": {
                        "get": null
                    }
                }
            ],
            "resources": [
                {
                    "type": "collection",
                    "relativeUri": "/users",
                    relativeUriPathSegments: [ "users" ],
                    "methods": [
                        {
                            "queryParameters": {
                                "start": {
                                    "displayName": "start",
                                    "type": "string"
                                }
                            },
                            "is": [
                                "paged"
                            ],
                            "method": "get"
                        }
                    ]
                }
            ]
        };
        raml.load(definition).should.become(expected).and.notify(done);
    });

    it('should not download a null named file. RT-259', function(done){
        var definition = [
            '#%RAML 0.8',
            '---',
            'title: !include'
        ].join('\n');

        raml.load(definition).should.be.rejected.with(/file name\/URL cannot be null/).and.notify(done);
    });

    it('should not download a file named with blanks. RT-259', function(done){
        var definition = [
            '#%RAML 0.8',
            '---',
            'title: !include             '
        ].join('\n');

        raml.load(definition).should.be.rejected.with(/file name\/URL cannot be null/).and.notify(done);
    });
    it('add a regression test for a complex RAML file', function(done) {
        var definition = [
            '#%RAML 0.8',
            '---',
            '!include http://localhost:9001/test/raml-files/regression.yml'
        ].join('\n');

        raml.load(definition).should.be.fulfilled.and.notify(done);
    });
    it('add a regression test for a big RAML file', function(done) {
        var definition = [
            '#%RAML 0.8',
            '---',
            '!include http://localhost:9001/test/raml-files/large-raml.yml'
        ].join('\n');

        raml.load(definition).should.be.fulfilled.and.notify(done);
    });
});
