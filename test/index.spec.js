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

const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;
const fs = require('fs');
const path = require('path');
import { resourcesDir } from '../src/index';

describe('resourcesDir', () => {
	it('can fetch resources dir', () => {
		const dir = resourcesDir();
		return expect(fs.existsSync(dir)).to.be.true;
	});

	it('can fetch libraries via approot', () => {
		const dir = resourcesDir();
		const libs = path.join(dir, 'libraries');
		return expect(fs.existsSync(libs)).to.be.true;
	});
});
