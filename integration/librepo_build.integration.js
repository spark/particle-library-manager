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

/**
 * Tests for real the Agent class using an external service.
 */

const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;

import {BuildLibraryRepository} from '../src/librepo_build'
import {LibraryNotFoundError} from '../src/librepo'

const config = {
	endpoint: 'http://localhost:3000/',
	lib_names: ['swd'],
	lib_unknown: "$$!!@@"
}
// const endpoint = 'http://build.particle.io/';


describe('BuildLibraryRepository', () => {
	it('can fetch index', () => {
		const sut = new BuildLibraryRepository({endpoint: config.endpoint});
		const result = sut.index();
		return result.then((result) => {
			expect(result).to.have.length.greaterThan(0);
			for (let lib of result) {
				expect(lib).to.have.property('id');
				expect(lib).to.have.property('title');
				expect(lib).to.have.property('content');
				expect(lib).to.have.property('version');
				expect(lib).to.have.property('visibility').equal('public');
			}
		});
	});

	it("can fetch names", () => {
		const sut = new BuildLibraryRepository({endpoint: config.endpoint});
		const promise = sut.names().then((result) => {
			expect(result).to.have.length.greaterThan(0);
			expect(result).instanceOf(Array);
			for (let title of result) {
				expect(typeof title).to.be.equal('string');
			}
			for (let name of config.lib_names) {
				expect(result).contains(name);
			}
		});
		return promise;
	});

	it("can fetch libraries", () => {
		const sut = new BuildLibraryRepository({endpoint: config.endpoint});
		const name = config.lib_names[0];
		const promise = sut.fetch(name).then((lib) => {
			expect(lib).has.property('name').that.is.equal(name);
		});
		return promise;
	});

	it("raises exception for unknown library", () => {
		const sut = new BuildLibraryRepository({endpoint: config.endpoint});
		const promise = sut.fetch(config.lib_unknown).then((lib) => {
			throw Error("expected failure");
		}).catch((error) => {
			expect(error.name).to.be.string('LibraryNotFoundError');
		});
		return promise;
	});

	it("can fetch library descriptor", () => {
		const sut = new BuildLibraryRepository({endpoint: config.endpoint});
		const name = config.lib_names[0];
		const promise = sut.fetch(name)
			.then(lib => lib.definition())
			.then(def => {
				expect(def).has.property('name');
				expect(def).has.property('version');
				expect(def).has.property('description');
			});
		return promise;
	});


});