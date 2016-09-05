/*
 ******************************************************************************
 Copyright (c) 2016 Particle Industries, Inc.  All rights reserved.

 This program is free software; you can redistribute it and/or
 modify it under the terms of the GNU Lesser General Public
 License as published by the Free Software Foundation, either
 version 3 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 Lesser General Public License for more details.

 You should have received a copy of the GNU Lesser General Public
 License along with this program; if not, see <http://www.gnu.org/licenses/>.
 ******************************************************************************
 */

import {expect, sinon} from './test-setup';

const fs = require('fs');
const path = require('path');
const helpers = require('yeoman-test');
const assert = require('yeoman-assert');
const fse = require('fs-extra');

import { LibraryInitGenerator, LibraryInitGeneratorMixin } from '../src/libinit';
import { appRoot } from '../src/index';

// http://yeoman.io/generator/module-test_helpers.html

class EmptyBase {

}

class MockLibraryInitGenerator extends LibraryInitGeneratorMixin(EmptyBase) { // eslint-disable-line new-cap
	constructor(...args) {
		super(...args);
	}
}


describe('library initialize', () => {

	const testData = { name: 'nominative', version: '1.2.3', author: 'Borges' };

	/**
	 * Asserts that a generated (actual) file matches the expected file in the test fixture.
	 * @param {string} expected  The name of the expected file. This is read from the `generator` folder at
	 *  the same level as these tests.
	 * @param {string} actual    The name of the actual file created. Assumes equal to 'expected' if not defined.
	 * @returns {nada} nothing
	 */
	function assertGeneratedContent(expected, actual) {
		if (actual===undefined) {
			actual = expected;
		}
		const expectedContent = fs.readFileSync(path.join(__dirname,'./generator/', expected), 'utf8');
		assert.fileContent(actual, expectedContent);
	}

	/**
	 * Validates that the library files are created that match the files in the test fixture.
	 * @returns {undefined} nothing. nada. I exist only to pacify linting rules.
	 */
	function validateOutput() {
		assertGeneratedContent('library.properties');
		assertGeneratedContent('src/nominative.cpp');
		assertGeneratedContent('src/nominative.h');
		assertGeneratedContent('examples/doit/doit_example.cpp');
	}

	/**
	 * Creates a LibraryInitGenerator and makes the source content equal to the
	 * `src/init` directory. The generator is run in a temporary directory.
	 * @param {string} dir       The directory under the source folder that contains the generator sources
	 * @param {function} cb      A callback that is passed the created generator.
	 * @returns {Promise}   To run the generator.
	 */
	function generator(dir, cb) {
		let result = helpers.run(LibraryInitGenerator);
		if (dir) {
			result = result.inTmpDir((tmpdir) => {
				// `tmpdir` is the path to the new temporary directory
				fse.copySync(path.join(appRoot, 'src', dir), tmpdir);
			});
		}
		if (cb) {
			result = cb(result);
		}
		return result.toPromise();
	}

	describe('generator', () => {
		it('interpolates library.properties', () => {
			return generator('init', (result) => {
				return result.withOptions(testData);       // Mock options passed in
			}).then(validateOutput);
		});

		it('should prompt for all properties if not provided', () => {
			return generator('init', (result) => {
				return result.withPrompts(testData);       // Mock options passed in
			}).then(validateOutput);
		});

		it('sets the output directory from the "dir" option', () => {
			const sut = new MockLibraryInitGenerator();
			sut.options = { dir: 'abcd' };
			sut.destinationRoot = sinon.stub();
			sut._setOutputDir();
			expect(sut.destinationRoot).to.have.been.calledWith('abcd');
		});

		it('does not set the output directory when the dir option is not present', () => {
			const sut = new MockLibraryInitGenerator();
			sut.options = { };
			sut.destinationRoot = sinon.stub();
			sut._setOutputDir();
			expect(sut.destinationRoot).to.have.not.been.called;
		});

		it('sets the Name option to the name with first letter capitalized', () => {
			const sut = new MockLibraryInitGenerator();
			sut.options = {};
			sut._handlePrompts({name:'abcd'});
			expect(sut.options).to.have.property('Name').equal('Abcd');
		});

		it('does not set the Name option when name is not present', () => {
			const sut = new MockLibraryInitGenerator();
			sut.options = {};
			sut._handlePrompts({name2:'abcd'});
			expect(sut.options).to.not.have.property('Name');
		});

		describe('validation', () => {
			it('validates the name', () => {
				const sut = new MockLibraryInitGenerator();
				sut.options = {};
				expect(() => sut._handlePrompts({name:'ab/cd'})).to.throw('name: must only contain letters, numbers, dashes and underscores');
			});

			it('validates the version', () => {
				const sut = new MockLibraryInitGenerator();
				sut.options = {};
				expect(() => sut._handlePrompts({version:'ab/cd'})).to.throw('version: must be formatted like 1.0.0');
			});

			it('validates the author, which is freeform', () => {
				const sut = new MockLibraryInitGenerator();
				sut.options = {};
				expect(() => sut._handlePrompts({author:'ab/cd'})).to.not.throw();
			});

			it('validates the initial name value', () => {
				const sut = new MockLibraryInitGenerator();
				sut.options = { name: '//' };
				expect(() => sut._checkFields()).to.throw('name: must only contain letters, numbers, dashes and underscores');
			});

			it('validates the initial version value', () => {
				const sut = new MockLibraryInitGenerator();
				sut.options = { version: '//' };
				expect(() => sut._checkFields()).to.throw('version: must be formatted like 1.0.0');
			});

			it('validates the prompts', () => {
				const sut = new MockLibraryInitGenerator();
				sut.options = {};
				const prompts = sut._allPrompts();
				expect(prompts).has.property('length').equal(3);

				expect(prompts[0].validate('ab/cd')).to.equal('name: must only contain letters, numbers, dashes and underscores');
				expect(prompts[1].validate('ab/cd')).to.equal('version: must be formatted like 1.0.0');
				expect(prompts[2].validate('ab/cd')).to.be.true;
			});
		});

		it('prompting delegates to the _prompt method', () => {
			const sut = new MockLibraryInitGenerator();
			expect(sut.prompting).to.have.property('prompt').equal(sut._prompt);
		});

		it('the _prompt method configures and fetches options', () => {
			const sut = new MockLibraryInitGenerator();
			// given
			sut._setOutputDir = sinon.stub();
			sut._allPrompts = sinon.stub().returns('abcd');
			sut._handlePrompts = sinon.stub().returns('handled');
			sut.prompt = sinon.stub().returns(Promise.resolve({name:'123'}));
			// when
			return sut._prompt()
			.then((result) => {
				expect(result).to.be.equal('handled');
				expect(sut._handlePrompts).to.have.been.calledWith({name:'123'});
				expect(sut._allPrompts).to.have.been.calledOnce;
				expect(sut._setOutputDir).to.have.been.calledOnce;
			});
		});
	});
});
