(function(){
    "use strict";

    const expect = require('chai').expect;
    const path = require('path');
    const _ = require('lodash');
    const Helpers = require("../helpers");
    const Modules = require(Helpers.LIB()+"/modules");

    const MOCK_PATH = path.join(Helpers.MOCK(), "modules");
    const MOCK_VALID_PATH = path.join(MOCK_PATH , "valid");

    describe("Modules", () => {

        describe("#consturctor()" , () => {

            it("should initialize the class when a root is given" , () => {

                let mock_path = "/foobar";
                let subject = new Modules(mock_path);

                expect(subject._rootMount).to.equal(mock_path);
            });

            it("should throw an error if there is no root titan file" , () => {

                let fn = () => {
                    let subject = new Modules();
                };

                expect(fn).to.throw("Can not load root Mount file");

            });

        });

        describe("#application()" , () => {

            it("should load a application config" , () => {

                let titanModules = new Modules(MOCK_VALID_PATH);
                let subject = titanModules.application();

                expect(subject.isCollection()).to.be.true;
                expect(subject.has("name")).to.be.true;

            });

            it("should return a loaded application config" , () => {

                let titanModules = new Modules(MOCK_VALID_PATH);
                titanModules.application();
                let subject = titanModules.application();

                expect(subject.isCollection()).to.be.true;
                expect(subject.has("name")).to.be.true;

            });

        });

        describe("#modules()" , () => {

            it("should load all modules" , () => {

                let modules = new Modules(MOCK_VALID_PATH, MOCK_VALID_PATH);
                let subject = modules.modules();

                expect(subject).to.be.an("object");
                expect(subject).not.to.be.empty;
                expect(subject[_.keys(subject)[0]].isCollection()).to.be.true;
                expect(subject[_.keys(subject)[0]].has("name")).to.be.true;

            });

            it("should return all the loaded module config" , () => {

                let modules = new Modules(MOCK_VALID_PATH, MOCK_VALID_PATH);
                modules.modules();
                let subject = modules.modules();

                expect(subject).to.be.an("object");
                expect(subject).not.to.be.empty;
                expect(subject[_.keys(subject)[0]].isCollection()).to.be.true;
                expect(subject[_.keys(subject)[0]].has("name")).to.be.true;

            });

        });

        describe("#modulePath()" , () => {

            it("should load return the module paths" , () => {


            });

        });

        describe("#routers()" , () => {

            it("should return an array of router objects" , () => {

                let modules = new Modules(MOCK_VALID_PATH, MOCK_VALID_PATH);
                let subject = modules.routers();

                expect(subject).to.be.an("array");
                expect(subject[Helpers.randomInt(0,subject.length)]).to.have.property("mount");
                expect(subject[Helpers.randomInt(0,subject.length)]).to.have.property("router");

            });

        });

        describe("#api()" , () => {

            it("should return an array of api router objects" , () => {

                let modules = new Modules(MOCK_VALID_PATH, MOCK_VALID_PATH);
                let subject = modules.api();

                console.log(subject);

                expect(subject).to.be.an("array");
                expect(subject[Helpers.randomInt(0,subject.length)]).to.have.property("mount");
                expect(subject[Helpers.randomInt(0,subject.length)]).to.have.property("router");
            });

        });


        describe("#module" , () => {

            it("should return a module by name" , () => {

                let modulename = "emount.test.module1";

                let modules = new Modules(MOCK_VALID_PATH, MOCK_VALID_PATH);
                let subject = modules.module(modulename);

                expect(subject.name).to.equal(modulename);
                expect(subject.length()).to.be.above(0);

            });

            it("should throw an error when no name is specified" , () => {

                let fn = () => {
                    let modules = new Modules(MOCK_VALID_PATH, MOCK_VALID_PATH);
                    let subject = modules.module();
                };

                expect(fn).to.throw("moduleName is required");

            });

            it("should return null when no module name is specified" , ()  => {

                let modules = new Modules(MOCK_VALID_PATH, MOCK_VALID_PATH);
                let subject = modules.module('foo.bar');

                expect(subject).to.equal(null);

            });

        });

        describe("#inits()" , () => {

            it("should return an array of all the inits" , () => {

                let modules = new Modules(MOCK_VALID_PATH, MOCK_VALID_PATH);
                let subject = modules.inits();

                expect(subject).to.be.an("array");
                expect(subject).to.have.length.above(0);
            });

        });

    });

})();