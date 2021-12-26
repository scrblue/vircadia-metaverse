//   Copyright 2021 Vircadia Contributors
//
//   Licensed under the Apache License, Version 2.0 (the "License");
//   you may not use this file except in compliance with the License.
//   You may obtain a copy of the License at
//
//       http://www.apache.org/licenses/LICENSE-2.0
//
//   Unless required by applicable law or agreed to in writing, software
//   distributed under the License is distributed on an "AS IS" BASIS,
//   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//   See the License for the specific language governing permissions and
//   limitations under the License.

// This is a module that defines a common interface for database layers. By default used by a
// MongoDB driver and an in-memory map used for testing.
'use strict'

import { CriteriaFilter } from '@Entities/EntityFilters/CriteriaFilter';
import { VKeyedCollection } from '@Tools/vTypes';

// TODO: Collections here refer to MongoDB collections, but this DBLayer type may eventually support
// relational databases, for example, so perhaps a more general term should be used.

// TODO: Add a system equivalent to Collations, even if more restrictive. As far as I can tell (as
// of 2021-12-25), this is only used for whether to check case or not. This could be modeled as an
// enum and converted into the collation used by MongoDB or by whatever system another DB driver
// uses.

// All functions may throw errors on database failure.
export interface DBLayer {
    // Setup functionality -- eg connecting to an external database.
    setupDB: () => Promise<void>,

    // Create an object in the database and return the created object back.
    createObject: (pCollection: string, pObject: any) => Promise<any>,

    // Get the first instance of an object matching the criteria. The pCollation parameter allowsc
    // specifying how the matching objects are sorted before the first is pulled.
    getObject: (pCollection: string, pCriteria: CriteriaFilter, pCollation?: any) => Promise<any>,

    // Get all instances of objects matching all `CriteriaFilter`s passed. The page number in the
    // pPager pagination criteria starts at 1.
    getObjects: (
        pCollection: string,
        pPager?: CriteriaFilter,
        pInfoer?: CriteriaFilter,
        pScoper?: CriteriaFilter
    ) => AsyncGenerator<any>,

    // Update the first object from the given collection that matches the given criteria with the
    // fields given. The fields may include null values to unset a field on the object. This returns
    // the modified object.
    updateObjectFields: (pCollection: string, pCriteria: CriteriaFilter, pFields: VKeyedCollection)
        => Promise<any>,

    // Delete the first object matching a given criteria returning whether anything was deleted.
    deleteOne: (pCollection: string, pCriteria: CriteriaFilter) => Promise<boolean>,

    // Delete all objects matching a given criteria returning the number of objects deleted.
    deleteMany: (pCollection: string, pCriteria: CriteriaFilter) => Promise<number>,

    // Count all objects matching a given criteria returning the number.
    countObjects: (pCollection: string, pCriteria: CriteriaFilter) => Promise<number>,
};

// A Collation that doesn't count capitalization in sorting
export let noCaseCollation: any = {
    locale: 'en_US',
    strength: 2
}
