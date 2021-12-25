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

// This module defines a map-based DBLayer for use in testing

'use strict'

import deepmerge from 'deepmerge';

import { CriteriaFilter } from '@Entities/EntityFilters/CriteriaFilter';
import { DBLayer } from '@Tools/Db/Db';
import { VKeyedCollection } from '@Tools/vTypes';
import { SimpleObject, IsNullOrEmpty, IsNotNullOrEmpty } from '@Tools/Misc';
import { Logger } from '@Tools/Logging';

let MapDB = new Map<string, any[]>();

export const MapDbLayer: DBLayer = {
    setupDB: async () => {
        Logger.debug("setupDB: nothing to do here");
        return;
    },

    createObject: async (pCollection: string, pObject: any) => {
        MapDB.get(pCollection).push(pObject);
        return pObject;
    },

    getObject: async (pCollection: string, pCriteria: CriteriaFilter, _pCollation?: any) => {
        // TODO: Support collation
        for (let element of MapDB.get(pCollection)) {
            if (pCriteria.criteriaTest(element)) {
                return element;
            }
        }
        return null;
    },

    async *getObjects(
        pCollection: string,
        pPager?: CriteriaFilter,
        pInfoer?: CriteriaFilter,
        pScoper?: CriteriaFilter
    ): AsyncGenerator<any> {
        // TODO: the deepmerge bit as in MongoDB implementation

        // For every element that matches all three criteia, yield that element
        for (let element of MapDB.get(pCollection)) {
            if ((pPager ? pPager.criteriaTest(element) : true)
                && (pInfoer ? pInfoer.criteriaTest(element) : true)
                && (pScoper ? pScoper.criteriaTest(element) : true)
            ) {
                yield element;
            };
        }
    },

    updateObjectFields: async (
        pColllection: string,
        pCriteria: CriteriaFilter,
        pFields: VKeyedCollection
    ) => {
        // Quick check that there are fields to set or unset
        if (IsNotNullOrEmpty(pFields) || Object.keys(pFields).length === 0) {
            return;
        };

        // Find the first element that matches the criteria provided
        for (let collectionElem of MapDB.get(pColllection)) {
            if (pCriteria.criteriaTest(collectionElem)) {
                // Iterate through the provided fields to change and set them. Null values should be
                // empty strings
                for (const [toSetKey, toSetVal] of Object.entries(pFields)) {
                    if (toSetKey === 'id') continue;
                    if (toSetVal === null) {
                        collectionElem[toSetKey] = '';
                    } else {
                        collectionElem[toSetKey] = toSetVal;
                    };
                };

                return collectionElem;
            };
        };

        // If none match the criteria, return nothing
        return;
    },

    deleteOne: async (pCollection: string, pCriteria: CriteriaFilter) => {
        let index;
        let arr = MapDB.get(pCollection);

        // Find the element
        for (const elem of arr) {
            if (pCriteria.criteriaTest(elem)) {
                index = arr.indexOf(elem);
                break;
            };
        };

        // Then delete it if it was found returning whether this was the case
        if (index) {
            arr.splice(index, 1);
            return true;
        } else {
            return false;
        };
    },


    deleteMany: async (pCollection: string, pCriteria: CriteriaFilter) => {
        let count = 0;
        let indices = [];
        let arr = MapDB.get(pCollection);

        // Push the index of every matching element to `indices`
        for (const elem of arr) {
            if (pCriteria.criteriaTest(elem)) {
                count++;
                indices.push(arr.indexOf(elem));
            };       
        };

        // Delete each index in `indices`
        for (const index of indices) {
            arr.splice(index, 1);
        }

        // Return the number deleted
        return count;
    },


    countObjects: async (pCollection: string, pCriteria: CriteriaFilter) => {
        return MapDB.get(pCollection).filter(elem => pCriteria.criteriaTest(elem)).length
    }
}
